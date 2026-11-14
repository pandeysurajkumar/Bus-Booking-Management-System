import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Clock, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { SeatLegend } from './SeatLegend';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const SeatLayout = ({ trip, onProceed, maxSeats = 6 }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDeck, setActiveDeck] = useState('lower');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [lockTimer, setLockTimer] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [locking, setLocking] = useState(false);

  // 1. Fetch live seats for this trip
  const fetchSeats = async () => {
    try {
      const res = await api.get(`/seats/trip/${trip._id}`);
      const tripSeats = res.data.data.seats || [];
      setSeats(tripSeats);

      // Auto-switch to upper if lower has no seats (rare)
      const hasUpper = tripSeats.some((s) => s.deck === 'upper');
      if (!hasUpper) setActiveDeck('lower');
    } catch (err) {
      console.error('Failed to load trip seats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    // Poll seats every 15 seconds to update locks from other users
    const pollInterval = setInterval(fetchSeats, 15000);
    return () => clearInterval(pollInterval);
  }, [trip._id]);

  // 2. Countdown timer for seat lock
  useEffect(() => {
    if (!lockExpiresAt) return;
    const interval = setInterval(() => {
      const diff = new Date(lockExpiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setLockTimer('Expired');
        setLockExpiresAt(null);
        setSelectedSeats([]);
        fetchSeats();
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setLockTimer(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  const hasUpperDeck = seats.some((s) => s.deck === 'upper');
  const deckSeats = seats.filter((s) => s.deck === activeDeck);

  // Group deck seats by rows
  const maxRow = Math.max(...deckSeats.map((s) => s.row), 1);
  const rows = [];
  for (let r = 1; r <= maxRow; r++) {
    rows.push(deckSeats.filter((s) => s.row === r).sort((a, b) => a.column - b.column));
  }

  // Handle seat click
  const handleSeatClick = async (seat) => {
    setErrorMsg('');

    // Check if booked or blocked
    if (seat.status === 'booked' || seat.status === 'blocked') {
      return;
    }

    // Check if locked by someone else
    if (seat.status === 'locked' && !seat.isLockedByCurrentUser && !selectedSeats.includes(seat.seatNumber)) {
      setErrorMsg(`Seat ${seat.seatNumber} is temporarily locked by another passenger.`);
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { returnUrl: window.location.pathname } });
      return;
    }

    const seatNum = seat.seatNumber;
    let nextSelected = [];

    if (selectedSeats.includes(seatNum)) {
      // Deselect
      nextSelected = selectedSeats.filter((s) => s !== seatNum);
      setSelectedSeats(nextSelected);

      // Release seat in backend
      try {
        await api.post('/seats/release', { tripId: trip._id, seatNumbers: [seatNum] });
      } catch (e) {
        console.error(e);
      }
    } else {
      // Select
      if (selectedSeats.length >= maxSeats) {
        setErrorMsg(`You can select a maximum of ${maxSeats} seats.`);
        return;
      }
      nextSelected = [...selectedSeats, seatNum];
      setSelectedSeats(nextSelected);

      // Lock seat in backend atomically
      setLocking(true);
      try {
        const lockRes = await api.post('/seats/lock', {
          tripId: trip._id,
          seatNumbers: nextSelected
        });
        setLockExpiresAt(lockRes.data.lockExpiresAt);
        await fetchSeats();
      } catch (err) {
        // Rollback selection on lock conflict
        setSelectedSeats(selectedSeats);
        setErrorMsg(err.response?.data?.message || 'Seat could not be locked. It may have just been selected by someone else.');
        await fetchSeats();
      } finally {
        setLocking(false);
      }
    }
  };

  // Calculate total selected fare
  const selectedSeatObjects = seats.filter((s) => selectedSeats.includes(s.seatNumber));
  const totalBaseFare = selectedSeatObjects.reduce((acc, curr) => acc + curr.fare, 0);

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      setErrorMsg('Please select at least one seat to continue.');
      return;
    }
    if (onProceed) {
      onProceed({
        trip,
        seats: selectedSeats,
        seatObjects: selectedSeatObjects,
        baseFare: totalBaseFare
      });
    } else {
      navigate(`/booking/passengers`, {
        state: {
          tripId: trip._id,
          seats: selectedSeats,
          totalBaseFare
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-gray-500 font-medium">Loading interactive seat layout...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 space-y-5">
      {/* Deck Selector & Lock Timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        {hasUpperDeck ? (
          <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveDeck('lower')}
              className={`px-4 py-2 rounded-lg transition ${
                activeDeck === 'lower'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Lower Deck ({seats.filter((s) => s.deck === 'lower').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveDeck('upper')}
              className={`px-4 py-2 rounded-lg transition ${
                activeDeck === 'upper'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Upper Deck ({seats.filter((s) => s.deck === 'upper').length})
            </button>
          </div>
        ) : (
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Standard Floor Deck
          </span>
        )}

        {/* Lock Expiry Timer Badge */}
        {lockTimer && selectedSeats.length > 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold animate-pulse">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Lock Expires in: {lockTimer}</span>
          </div>
        )}
      </div>

      <SeatLegend />

      {errorMsg && (
        <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Bus Interior Box */}
      <div className="bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200 flex flex-col items-center">
        {/* Driver Cabin Area */}
        <div className="w-full max-w-md flex justify-between items-center mb-6 px-4 py-2 bg-gray-200/60 rounded-xl border border-gray-300/60 text-xs font-bold text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <span>Front Cabin</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-md shadow-xs text-gray-700">
            <Compass className="w-4 h-4 text-brand-600" />
            <span>Driver Position</span>
          </div>
        </div>

        {/* Seat Grid Rows */}
        <div className="w-full max-w-md space-y-3">
          {rows.map((rowSeats, rIdx) => (
            <div key={`row-${rIdx}`} className="flex justify-between items-center gap-2">
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.seatNumber);
                const isBooked = seat.status === 'booked';
                const isLockedOther = seat.status === 'locked' && !seat.isLockedByCurrentUser && !isSelected;
                const isBlocked = seat.status === 'blocked';
                const isSleeper = seat.seatType === 'sleeper';

                // Determine styling
                let btnStyle = 'bg-white border-emerald-500 text-gray-800 hover:border-brand-500 hover:shadow-md';
                if (isSelected) {
                  btnStyle = 'bg-blue-600 border-blue-700 text-white shadow-md scale-105';
                } else if (isBooked) {
                  btnStyle = 'bg-rose-50 border-rose-300 text-rose-400 cursor-not-allowed opacity-70';
                } else if (isLockedOther) {
                  btnStyle = 'bg-amber-100 border-amber-400 text-amber-800 animate-pulse cursor-not-allowed';
                } else if (isBlocked) {
                  btnStyle = 'bg-gray-200 border-gray-400 text-gray-400 cursor-not-allowed';
                }

                return (
                  <button
                    key={seat._id || seat.seatNumber}
                    type="button"
                    disabled={isBooked || isLockedOther || isBlocked || locking}
                    onClick={() => handleSeatClick(seat)}
                    className={`relative rounded-lg border-2 transition font-bold flex flex-col items-center justify-center p-1.5 ${
                      isSleeper ? 'w-24 h-12' : 'w-12 h-12'
                    } ${btnStyle}`}
                    title={`Seat ${seat.seatNumber} (${seat.seatType}) - ₹${seat.fare}`}
                  >
                    <span className="text-[11px] leading-tight font-extrabold">{seat.seatNumber}</span>
                    <span className="text-[9px] font-medium opacity-90">₹{seat.fare}</span>
                    {isSleeper && (
                      <span className="absolute right-1 top-1 w-2.5 h-2.5 rounded-full bg-current opacity-40"></span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Summary and Proceed Bar */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <div className="text-xs text-gray-500 font-semibold">
            Selected Seats ({selectedSeats.length}/{maxSeats}):
          </div>
          <div className="text-sm font-bold text-gray-900 mt-0.5">
            {selectedSeats.length > 0 ? (
              <span className="text-brand-600">{selectedSeats.join(', ')}</span>
            ) : (
              <span className="text-gray-400 font-normal">None selected</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <span className="text-xs text-gray-500 block">Total Base Fare</span>
            <span className="text-xl font-black text-gray-900">₹{totalBaseFare}</span>
          </div>

          <button
            type="button"
            disabled={selectedSeats.length === 0 || locking}
            onClick={handleContinue}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center space-x-2"
          >
            <span>Continue</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
