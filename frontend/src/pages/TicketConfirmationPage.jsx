import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Download, Printer, Bus, ArrowRight, Share2, MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import api from '../api/axios';

export const TicketConfirmationPage = () => {
  const { pnr } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!booking && pnr) {
      const fetchBooking = async () => {
        try {
          const res = await api.get(`/bookings/pnr/${pnr}`);
          setBooking(res.data.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Ticket not found for this PNR');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [pnr, booking]);

  const handleDownloadPDF = async () => {
    if (!booking) return;
    setDownloading(true);
    try {
      const response = await api.get(`/bookings/${booking.pnr}/ticket-pdf`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Ticket-${booking.pnr}.pdf`;
      link.click();
    } catch (err) {
      console.error('PDF download error:', err);
      // Fallback: browser print
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-500 font-medium">Retrieving verified ticket...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">PNR Lookup Failed</h2>
        <p className="text-xs text-gray-500">{error || 'No booking found matching this reference.'}</p>
        <Link to="/" className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Back to Home
        </Link>
      </div>
    );
  }

  const journeyDateFormatted = booking.journeyDate
    ? new Date(booking.journeyDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* CELEBRATORY BANNER */}
      <div className="bg-emerald-600 text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Booking Confirmed</span>
            <h1 className="text-2xl sm:text-3xl font-black">Your Ticket is Booked!</h1>
            <p className="text-xs text-emerald-100 mt-0.5">A confirmation email has been dispatched.</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100 block">Unique PNR</span>
          <span className="text-2xl font-black font-mono tracking-wider">{booking.pnr}</span>
        </div>
      </div>

      {/* ACTION BAR (Download PDF & Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/my-bookings"
          className="text-xs font-bold text-gray-600 hover:text-brand-600 transition flex items-center space-x-1"
        >
          <span>← View All Bookings</span>
        </Link>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Ticket</span>
          </button>

          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadPDF}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generating PDF...' : 'Download Official PDF'}</span>
          </button>
        </div>
      </div>

      {/* E-TICKET PREVIEW CARD */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden print:border-none print:shadow-none">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-brand-600 to-red-700 text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Bus className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black">ALGIONS BUS EXPRESS</h2>
              <p className="text-xs text-brand-100 font-medium">Official Passenger Boarding Pass</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-bold text-brand-200 block">Status</span>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-extrabold uppercase">
              {booking.status}
            </span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Route & Operator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Route</span>
              <span className="text-base font-extrabold text-gray-900">{booking.routeId?.title}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Operator</span>
              <span className="text-base font-extrabold text-gray-900">{booking.operatorId?.companyName}</span>
              <span className="text-xs text-gray-500 block">{booking.busId?.busType}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Journey Date</span>
              <span className="text-base font-extrabold text-gray-900">{journeyDateFormatted}</span>
            </div>
          </div>

          {/* Boarding and Drop Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-600 uppercase">
                <MapPin className="w-4 h-4" />
                <span>Boarding Station</span>
              </div>
              <div className="text-sm font-bold text-gray-900">{booking.boardingPoint?.name}</div>
              <div className="text-xs text-gray-500">
                Time: {new Date(booking.boardingPoint?.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              {booking.boardingPoint?.landmark && (
                <div className="text-[11px] text-gray-400 italic">Landmark: {booking.boardingPoint.landmark}</div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 uppercase">
                <MapPin className="w-4 h-4" />
                <span>Drop Location</span>
              </div>
              <div className="text-sm font-bold text-gray-900">{booking.dropPoint?.name}</div>
              <div className="text-xs text-gray-500">
                Time: {new Date(booking.dropPoint?.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Passenger Manifest */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Confirmed Passengers ({booking.passengers?.length || booking.seats.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase">
                    <th className="py-2">#</th>
                    <th className="py-2">Passenger Name</th>
                    <th className="py-2">Age</th>
                    <th className="py-2">Gender</th>
                    <th className="py-2 text-right">Seat Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {(booking.passengers || []).map((p, idx) => (
                    <tr key={p._id || idx}>
                      <td className="py-2.5 text-gray-400">{idx + 1}</td>
                      <td className="py-2.5 font-bold text-gray-900">{p.fullName}</td>
                      <td className="py-2.5 text-gray-600">{p.age} yrs</td>
                      <td className="py-2.5 text-gray-600 uppercase">{p.gender}</td>
                      <td className="py-2.5 text-right font-black text-brand-600 text-sm">{p.seatNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Details Box */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
            <div className="text-gray-500">
              Payment Method: <span className="font-bold uppercase text-gray-800">{booking.paymentId?.paymentMethod || 'UPI'}</span> •
              Transaction ID: <span className="font-mono text-gray-800">{booking.paymentId?.transactionId || 'SIMULATED_TXN'}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Paid</span>
              <span className="text-2xl font-black text-gray-900">₹{booking.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
