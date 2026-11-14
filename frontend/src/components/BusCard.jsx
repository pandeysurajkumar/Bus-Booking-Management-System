import React, { useState } from 'react';
import { Star, Wifi, Zap, Droplet, Clock, ArrowRight, ShieldCheck, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { SeatLayout } from './SeatLayout';

export const BusCard = ({ trip, onSelectSeats }) => {
  const [showSeats, setShowSeats] = useState(false);

  const bus = trip.busId || {};
  const operator = trip.operatorId || {};
  const route = trip.routeId || {};

  const depTime = trip.departureTime ? new Date(trip.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '08:00 AM';
  const arrTime = trip.arrivalTime ? new Date(trip.arrivalTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '02:00 PM';

  const durationHours = route.estimatedDurationMinutes ? (route.estimatedDurationMinutes / 60).toFixed(1) : '5.5';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Top Banner / Operator Details */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Operator and Bus Type */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {operator.companyName || operator.name || 'Express Line Travels'}
              </h3>
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>{operator.rating || '4.6'}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              {bus.busType || 'Volvo Multi-Axle AC (2+2)'} • {bus.modelName || 'Volvo 9600'}
            </p>

            {/* Amenities Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {bus.amenities?.hasAc && (
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  AC
                </span>
              )}
              {bus.amenities?.hasWifi && (
                <span className="inline-flex items-center space-x-1 text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  <Wifi className="w-3 h-3" />
                  <span>Wi-Fi</span>
                </span>
              )}
              {bus.amenities?.hasCharging && (
                <span className="inline-flex items-center space-x-1 text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  <Zap className="w-3 h-3" />
                  <span>Charging</span>
                </span>
              )}
              {bus.amenities?.hasWaterBottle && (
                <span className="inline-flex items-center space-x-1 text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                  <Droplet className="w-3 h-3" />
                  <span>Water</span>
                </span>
              )}
            </div>
          </div>

          {/* Timings and Route Duration */}
          <div className="flex items-center space-x-6 sm:space-x-8 py-2">
            <div className="text-left">
              <div className="text-lg sm:text-xl font-extrabold text-gray-900">{depTime}</div>
              <div className="text-xs text-gray-500 font-medium truncate max-w-[120px]">
                {trip.boardingPoints?.[0]?.name || route.originCityId?.name || 'Origin'}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{durationHours} hrs</span>
              <div className="w-20 sm:w-28 flex items-center justify-center my-1">
                <div className="h-[2px] w-full bg-gray-200 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">Direct Express</span>
            </div>

            <div className="text-right">
              <div className="text-lg sm:text-xl font-extrabold text-gray-900">{arrTime}</div>
              <div className="text-xs text-gray-500 font-medium truncate max-w-[120px]">
                {trip.dropPoints?.[0]?.name || route.destinationCityId?.name || 'Destination'}
              </div>
            </div>
          </div>

          {/* Pricing and Action Button */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Starts from</span>
              <span className="text-2xl font-black text-gray-900">₹{trip.baseFare}</span>
              <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">
                {trip.availableSeats} Seats Available
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowSeats(!showSeats)}
              className="mt-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 active:scale-95"
            >
              <span>{showSeats ? 'Hide Seats' : 'View Seats'}</span>
              {showSeats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Interactive Seat Layout Area */}
      {showSeats && (
        <div className="border-t border-gray-200 bg-gray-50/70 p-4 sm:p-6 animate-fade-in">
          <SeatLayout trip={trip} onProceed={onSelectSeats} />
        </div>
      )}
    </div>
  );
};
