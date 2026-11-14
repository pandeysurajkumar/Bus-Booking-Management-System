import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bus, MapPin, Calendar, Clock, User, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

export const BookingReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    trip,
    seats = [],
    passengers = [],
    boardingPoint,
    dropPoint,
    contactInfo,
    baseFare
  } = location.state || {};

  const [fareDetails, setFareDetails] = useState(null);
  const [loadingFare, setLoadingFare] = useState(true);

  useEffect(() => {
    if (!trip || seats.length === 0) {
      navigate('/search');
      return;
    }

    // Call backend fare calculation endpoint
    const calculateServerFare = async () => {
      try {
        const res = await api.post('/seats/calculate-fare', {
          tripId: trip._id,
          seatNumbers: seats
        });
        setFareDetails(res.data.data);
      } catch (err) {
        console.error('Failed to calculate server fare:', err);
      } finally {
        setLoadingFare(false);
      }
    };

    calculateServerFare();
  }, [trip, seats]);

  const handleProceedToPayment = () => {
    navigate('/booking/checkout', {
      state: {
        trip,
        seats,
        passengers,
        boardingPoint,
        dropPoint,
        contactInfo,
        fareDetails
      }
    });
  };

  const journeyDateFormatted = trip?.departureDate
    ? new Date(trip.departureDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
        <span>Step 1: Seat Selection</span>
        <span>•</span>
        <span>Step 2: Passenger Details</span>
        <span>•</span>
        <span className="text-brand-600">Step 3: Review & Payment</span>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-black text-gray-900">Review Booking Details</h1>
        <p className="text-xs text-gray-500 mt-0.5">Please review your journey summary and fare breakdown before payment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Journey & Passenger Summary */}
        <div className="lg:col-span-8 space-y-6">
          {/* Trip Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Operator</span>
                <span className="text-base font-bold text-gray-900">{trip?.operatorId?.companyName}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-200">
                {trip?.busId?.busType}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-lg font-black text-gray-900">
              <span>{trip?.routeId?.title}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl">
              <div className="space-y-1">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Boarding Point</span>
                <span className="font-bold text-gray-800 text-sm block">{boardingPoint?.name}</span>
                <span className="text-gray-500">
                  {new Date(boardingPoint?.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {journeyDateFormatted}
                </span>
                {boardingPoint?.landmark && (
                  <span className="text-gray-400 italic block mt-0.5">Landmark: {boardingPoint.landmark}</span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-gray-400 font-bold uppercase tracking-wider block">Drop Point</span>
                <span className="font-bold text-gray-800 text-sm block">{dropPoint?.name}</span>
                <span className="text-gray-500">
                  {new Date(dropPoint?.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Passenger Manifest Preview Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Passengers ({passengers.length})
            </h3>

            <div className="divide-y divide-gray-100">
              {passengers.map((p, idx) => (
                <div key={p.seatNumber} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-900">{p.fullName}</span>
                    <span className="text-gray-500">({p.age} yrs, {p.gender})</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">
                    Seat {p.seatNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Policy Preview Box */}
          <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-5 space-y-2 text-xs">
            <h4 className="font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Standard Cancellation Policy Summary</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-amber-800 pt-1">
              <div>• More than 24 hrs: <strong className="font-bold">90% refund</strong></div>
              <div>• 12 to 24 hrs: <strong className="font-bold">75% refund</strong></div>
              <div>• 4 to 12 hrs: <strong className="font-bold">50% refund</strong></div>
              <div>• Less than 4 hrs: <strong className="font-bold">0% refund</strong></div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Fare Breakdown & Checkout */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
              Fare Breakdown
            </h3>

            {loadingFare ? (
              <div className="py-8 text-center text-xs text-gray-400">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Calculating server-side fare...
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Base Ticket Fare ({seats.length} seats)</span>
                  <span className="font-semibold text-gray-900">₹{fareDetails?.baseAmount || baseFare}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>GST & Transportation Taxes (5%)</span>
                  <span className="font-semibold text-gray-900">₹{fareDetails?.taxAmount || 0}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Convenience & Booking Fee</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm font-black text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-xl text-brand-600">₹{fareDetails?.totalAmount || baseFare}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={loadingFare}
              onClick={handleProceedToPayment}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-brand-600/30 transition flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>Proceed to Simulated Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
