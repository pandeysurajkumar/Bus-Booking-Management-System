import React, { useState, useEffect } from 'react';
import { Bus, Calendar, Users, TrendingUp, AlertTriangle, FileText, CheckCircle2, ChevronRight, X } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const OperatorDashboardPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [buses, setBuses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manifest modal states
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [manifestData, setManifestData] = useState(null);
  const [loadingManifest, setLoadingManifest] = useState(false);

  useEffect(() => {
    const fetchOperatorData = async () => {
      try {
        const [dashRes, busesRes, tripsRes] = await Promise.all([
          api.get('/operator/dashboard'),
          api.get('/operator/buses'),
          api.get('/operator/trips')
        ]);

        setAnalytics(dashRes.data.data);
        setBuses(busesRes.data.data || []);
        setTrips(tripsRes.data.data || []);
      } catch (err) {
        console.error('Failed to load operator dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorData();
  }, []);

  const openManifestModal = async (tripId) => {
    setSelectedTripId(tripId);
    setLoadingManifest(true);
    setManifestData(null);
    try {
      const res = await api.get(`/operator/manifest/${tripId}`);
      setManifestData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch manifest:', err);
    } finally {
      setLoadingManifest(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-500 font-medium">Loading operator management portal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Operator Fleet Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            {user?.operatorId?.companyName || 'Operator Fleet Management'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage assigned buses, trips, seat occupancy and passenger manifests.</p>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Assigned Buses</span>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">{analytics?.assignedBuses || buses.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Active in fleet</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Scheduled Trips</span>
          <div className="text-2xl sm:text-3xl font-black text-blue-600">{analytics?.activeTrips || trips.length}</div>
          <span className="text-[11px] text-gray-500 font-medium">On live routes</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Confirmed Bookings</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{analytics?.confirmedBookings || 0}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">{analytics?.confirmedPassengers || 0} passengers</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">₹{analytics?.totalRevenue?.toLocaleString('en-IN') || 0}</div>
          <span className="text-[11px] text-gray-500 font-medium">Simulated GMV</span>
        </div>
      </div>

      {/* TODAY'S SCHEDULES & MANIFESTS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900">Scheduled Trips & Passenger Manifests</h2>
            <p className="text-xs text-gray-500">Click on any trip to inspect confirmed passenger manifest and seat occupancy</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700">
            {trips.length} Trips
          </span>
        </div>

        <div className="divide-y divide-gray-100 text-xs">
          {trips.slice(0, 15).map((trip) => {
            const depTime = trip.departureTime ? new Date(trip.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
            const depDate = trip.departureDate ? new Date(trip.departureDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '';

            return (
              <div
                key={trip._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-extrabold text-gray-900">{trip.routeId?.title || 'Intercity Route'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                      {trip.busId?.busNumber}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Departure: <strong className="text-gray-700">{depDate} at {depTime}</strong> • {trip.busId?.busType}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Seat Inventory</span>
                    <span className="font-extrabold text-gray-900">
                      {trip.totalSeats - trip.availableSeats} / {trip.totalSeats} booked
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openManifestModal(trip._id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center space-x-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Manifest</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MANIFEST MODAL */}
      {selectedTripId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-gray-200 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">Passenger Manifest Reconciliation</h3>
                <p className="text-xs text-gray-500">
                  {manifestData?.trip?.routeId?.title} • Bus {manifestData?.trip?.busId?.busNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedTripId(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingManifest ? (
              <div className="py-12 text-center text-xs text-gray-500">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Reconciling seat occupancy & passenger manifest...
              </div>
            ) : manifestData ? (
              <div className="space-y-4">
                {/* Reconciliation Bar */}
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-gray-500 uppercase font-bold text-[10px] block">Total Capacity</span>
                    <span className="text-base font-black text-gray-900">{manifestData.reconciliation?.totalSeats}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase font-bold text-[10px] block">Occupied Seats</span>
                    <span className="text-base font-black text-blue-700">{manifestData.reconciliation?.occupiedSeats}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase font-bold text-[10px] block">Occupancy Rate</span>
                    <span className="text-base font-black text-emerald-700">{manifestData.reconciliation?.occupancyPercentage}%</span>
                  </div>
                </div>

                {/* Passenger Table */}
                {manifestData.passengers?.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">
                    No confirmed bookings for this trip yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-400 uppercase font-bold text-[10px]">
                          <th className="py-2">Seat</th>
                          <th className="py-2">Passenger Name</th>
                          <th className="py-2">Age/Gender</th>
                          <th className="py-2">PNR</th>
                          <th className="py-2">Boarding Point</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {manifestData.passengers.map((p) => (
                          <tr key={p.passengerId}>
                            <td className="py-2.5 font-black text-brand-600 text-sm">{p.seatNumber}</td>
                            <td className="py-2.5 font-bold text-gray-900">{p.name}</td>
                            <td className="py-2.5 text-gray-600">{p.age} / {p.gender}</td>
                            <td className="py-2.5 font-mono text-gray-700">{p.pnr}</td>
                            <td className="py-2.5 text-gray-500">{p.boardingPoint}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
