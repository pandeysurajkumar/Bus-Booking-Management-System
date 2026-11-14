import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, MapPin, XCircle, AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal States
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [refundEstimate, setRefundEstimate] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of travel plans');
  const [cancellingAction, setCancellingAction] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openCancelModal = async (booking) => {
    setCancellingBooking(booking);
    setRefundEstimate(null);
    setLoadingEstimate(true);
    setErrorMsg('');
    setCancelSuccessMsg('');

    try {
      const res = await api.get(`/cancellations/estimate/${booking._id}`);
      setRefundEstimate(res.data.data);
    } catch (err) {
      setErrorMsg('Failed to calculate refund estimate');
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancellingBooking) return;
    setCancellingAction(true);
    setErrorMsg('');

    try {
      const res = await api.post('/cancellations', {
        bookingId: cancellingBooking._id,
        reason: cancelReason
      });

      setCancelSuccessMsg(
        `Ticket successfully cancelled! Simulated refund of ₹${res.data.refund?.refundAmount} has been credited.`
      );
      await fetchBookings();
      setTimeout(() => {
        setCancellingBooking(null);
      }, 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-500 font-medium">Loading your booking history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Bookings & Tickets</h1>
          <p className="text-xs text-gray-500 mt-0.5">Welcome back, {user?.name}. Manage your travel reservations and refunds.</p>
        </div>
        <Link
          to="/"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
        >
          Book Another Ticket
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No bookings yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            You haven't made any reservations yet. Search our 100+ daily routes and book your first trip!
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Find Buses Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === 'confirmed';
            const isCancelled = booking.status === 'cancelled';

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm font-extrabold text-gray-900 tracking-wider">
                      PNR: {booking.pnr}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                        isConfirmed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCancelled
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <span className="text-xs text-gray-400 font-medium">
                    Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 uppercase font-bold text-[10px] block">Route</span>
                    <span className="text-sm font-bold text-gray-900 block">{booking.routeId?.title}</span>
                    <span className="text-gray-500">{booking.operatorId?.companyName}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 uppercase font-bold text-[10px] block">Journey Date</span>
                    <span className="text-sm font-bold text-gray-900 block">
                      {new Date(booking.journeyDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                    <span className="text-gray-500">Boarding: {booking.boardingPoint?.name}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 uppercase font-bold text-[10px] block">Seats</span>
                    <span className="text-sm font-extrabold text-brand-600 block">
                      {booking.seats?.join(', ')} ({booking.passengerCount} passengers)
                    </span>
                    <span className="text-gray-500 font-medium">Total Paid: ₹{booking.totalAmount}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center sm:justify-end space-x-2 pt-2 sm:pt-0">
                    <Link
                      to={`/ticket/${booking.pnr}`}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition"
                    >
                      View Ticket
                    </Link>

                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => openCancelModal(booking)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-scale-in">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">Cancel Booking</h3>
                <p className="text-xs text-gray-500">PNR: {cancellingBooking.pnr}</p>
              </div>
              <button
                onClick={() => setCancellingBooking(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            {cancelSuccessMsg ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <span>{cancelSuccessMsg}</span>
              </div>
            ) : (
              <>
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {errorMsg}
                  </div>
                )}

                {/* Refund Policy Calculation Box */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2 text-xs">
                  <span className="font-bold text-gray-700 uppercase tracking-wider block">
                    Server Refund Calculation
                  </span>

                  {loadingEstimate ? (
                    <div className="py-3 text-center text-gray-500">Calculating refund tiers...</div>
                  ) : refundEstimate ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between">
                        <span>Time until departure:</span>
                        <strong className="font-bold">{refundEstimate.hoursUntilDeparture} hours</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Original ticket amount:</span>
                        <span>₹{refundEstimate.originalAmount}</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>Cancellation fee ({refundEstimate.cancellationFeePercentage}%):</span>
                        <span>- ₹{refundEstimate.cancellationFee}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-emerald-700">
                        <span>Refund Amount ({refundEstimate.refundPercentage}%):</span>
                        <span>₹{refundEstimate.refundAmount}</span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-gray-700">Reason for Cancellation</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white"
                  >
                    <option>Change of travel plans</option>
                    <option>Booked by mistake</option>
                    <option>Found alternative transport</option>
                    <option>Personal emergency</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancellingBooking(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                  >
                    Keep Booking
                  </button>
                  <button
                    type="button"
                    disabled={cancellingAction || loadingEstimate}
                    onClick={handleConfirmCancellation}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition"
                  >
                    {cancellingAction ? 'Processing Refund...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
