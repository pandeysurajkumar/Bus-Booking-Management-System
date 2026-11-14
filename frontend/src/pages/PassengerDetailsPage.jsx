import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, CheckCircle, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const PassengerDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { tripId, seats = [], baseFare = 0 } = location.state || {};

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [passengers, setPassengers] = useState([]);
  const [selectedBoarding, setSelectedBoarding] = useState(null);
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tripId || seats.length === 0) {
      navigate('/search');
      return;
    }

    const fetchTrip = async () => {
      try {
        const res = await api.get(`/trips/${tripId}`);
        const tripData = res.data.data;
        setTrip(tripData);

        // Pre-select first boarding and drop points
        if (tripData.boardingPoints?.length > 0) {
          setSelectedBoarding(tripData.boardingPoints[0]);
        }
        if (tripData.dropPoints?.length > 0) {
          setSelectedDrop(tripData.dropPoints[0]);
        }

        // Initialize passenger array for each seat
        const initialPassengers = seats.map((seatNum, idx) => ({
          seatNumber: seatNum,
          fullName: idx === 0 && user?.name ? user.name : '',
          age: '',
          gender: 'male'
        }));
        setPassengers(initialPassengers);
      } catch (err) {
        console.error(err);
        setError('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId, seats]);

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate email & phone
    if (!email || !email.includes('@')) {
      setError('Please provide a valid contact email');
      return;
    }
    if (!phone || phone.length < 10) {
      setError('Please provide a valid 10-digit mobile number');
      return;
    }

    // Validate each passenger
    for (const p of passengers) {
      if (!p.fullName.trim() || p.fullName.trim().length < 2) {
        setError(`Please enter full name (min 2 characters) for Seat ${p.seatNumber}`);
        return;
      }
      const ageNum = parseInt(p.age, 10);
      if (!ageNum || ageNum < 1 || ageNum > 120) {
        setError(`Please enter a valid age (1-120) for Passenger in Seat ${p.seatNumber}`);
        return;
      }
    }

    if (!selectedBoarding) {
      setError('Please select a boarding point');
      return;
    }
    if (!selectedDrop) {
      setError('Please select a drop point');
      return;
    }

    // Pass data forward to review page
    navigate('/booking/review', {
      state: {
        trip,
        seats,
        passengers: passengers.map((p) => ({ ...p, age: parseInt(p.age, 10) })),
        boardingPoint: selectedBoarding,
        dropPoint: selectedDrop,
        contactInfo: { email, phone },
        baseFare
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-500">Preparing passenger forms...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
        <span>Step 1: Seat Selection</span>
        <span>•</span>
        <span className="text-brand-600">Step 2: Passenger Details</span>
        <span>•</span>
        <span>Step 3: Review & Payment</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Passenger Information</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Booking for <span className="font-bold text-brand-600">{seats.length} Seat(s)</span>: {seats.join(', ')}
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-gray-100 text-xs font-bold text-gray-700">
          Trip: {trip?.routeId?.title}
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3.5 rounded-xl animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PASSENGER FORMS */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            Passenger Details ({seats.length})
          </h2>

          {passengers.map((passenger, index) => (
            <div
              key={passenger.seatNumber}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-bold uppercase text-gray-700">
                  Passenger {index + 1}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200">
                  Seat {passenger.seatNumber}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arun Kumar"
                    value={passenger.fullName}
                    onChange={(e) => updatePassenger(index, 'fullName', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Age *</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    placeholder="Age"
                    value={passenger.age}
                    onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Gender *</label>
                  <select
                    value={passenger.gender}
                    onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOARDING & DROP POINTS */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            Boarding & Dropping Points
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>Select Boarding Point</span>
              </label>
              <select
                value={selectedBoarding?.name || ''}
                onChange={(e) => {
                  const bp = trip.boardingPoints.find((b) => b.name === e.target.value);
                  setSelectedBoarding(bp);
                }}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {trip?.boardingPoints?.map((bp) => (
                  <option key={bp.stopId || bp.name} value={bp.name}>
                    {bp.name} ({new Date(bp.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Select Drop Point</span>
              </label>
              <select
                value={selectedDrop?.name || ''}
                onChange={(e) => {
                  const dp = trip.dropPoints.find((d) => d.name === e.target.value);
                  setSelectedDrop(dp);
                }}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {trip?.dropPoints?.map((dp) => (
                  <option key={dp.stopId || dp.name} value={dp.name}>
                    {dp.name} ({new Date(dp.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CONTACT INFORMATION */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            Contact Information (for E-Ticket & SMS)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="passenger@example.com"
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>Mobile Number *</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* PROCEED BAR */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 flex items-center space-x-2 transition active:scale-95"
          >
            <span>Proceed to Review Booking</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
