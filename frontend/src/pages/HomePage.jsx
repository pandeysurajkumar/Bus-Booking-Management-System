import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bus, ShieldCheck, Clock, Award, Sparkles, ArrowRight, Star, CheckCircle2, Users, MapPin } from 'lucide-react';
import { SearchForm } from '../components/SearchForm';
import api from '../api/axios';

export const HomePage = () => {
  const navigate = useNavigate();
  const [popularRoutes, setPopularRoutes] = useState([]);

  useEffect(() => {
    const fetchPopularRoutes = async () => {
      try {
        const res = await api.get('/routes/popular');
        setPopularRoutes(res.data.data || []);
      } catch (err) {
        console.error('Failed to load popular routes:', err);
      }
    };
    fetchPopularRoutes();
  }, []);

  const handleQuickSearch = (origin, dest) => {
    const today = new Date().toISOString().split('T')[0];
    navigate(`/search?fromCity=${encodeURIComponent(origin)}&toCity=${encodeURIComponent(dest)}&date=${today}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-red-800 text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>India's RedBus Inspired Booking Experience</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            Book Bus Tickets Online with <span className="underline decoration-amber-400 decoration-wavy">Atomic Seat Locking</span>
          </h1>

          <p className="text-base sm:text-xl text-brand-100 max-w-2xl mx-auto font-normal">
            Real-time movie-hall style seat layouts, 30+ top operators, instant simulated refunds, and verified sleeper/AC coaches.
          </p>

          {/* Floated Search Form */}
          <div className="pt-6 max-w-5xl mx-auto text-left">
            <SearchForm className="shadow-2xl" />
          </div>
        </div>
      </div>

      {/* STATS BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-brand-600">110+</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-500">Scheduled Trips</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-brand-600">30+</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-500">Premium Operators</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-brand-600">20+</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-500">Indian States</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-brand-600">55+</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-500">Connected Cities</div>
          </div>
        </div>
      </div>

      {/* POPULAR ROUTES SECTION */}
      <div id="popular-routes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
              Top Trending Travel Pairs
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Popular Indian Intercity Routes
            </h2>
          </div>
          <p className="text-sm text-gray-500 max-w-sm">
            High frequency daily luxury AC and Sleeper buses on India's busiest highway corridors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { from: 'New Delhi', to: 'Chandigarh', duration: '4.5 hrs', fare: '₹650', buses: '14+ Daily' },
            { from: 'Mumbai', to: 'Pune', duration: '3.2 hrs', fare: '₹430', buses: '20+ Daily' },
            { from: 'Bengaluru', to: 'Chennai', duration: '6.0 hrs', fare: '₹870', buses: '18+ Daily' },
            { from: 'New Delhi', to: 'Jaipur', duration: '5.0 hrs', fare: '₹716', buses: '12+ Daily' },
            { from: 'Bengaluru', to: 'Hyderabad', duration: '9.0 hrs', fare: '₹1,354', buses: '10+ Daily' },
            { from: 'Chandigarh', to: 'Ludhiana', duration: '2.0 hrs', fare: '₹331', buses: '8+ Daily' }
          ].map((r, idx) => (
            <div
              key={idx}
              onClick={() => handleQuickSearch(r.from, r.to)}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-lg hover:border-brand-500 transition group cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-base font-bold text-gray-900 group-hover:text-brand-600 transition flex items-center space-x-2">
                    <span>{r.from}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition" />
                    <span>{r.to}</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {r.duration} • {r.buses}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold">Starts</span>
                  <span className="text-lg font-black text-gray-900">{r.fare}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY CHOOSE US / FEATURES */}
      <div className="bg-gray-100/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block">
              Why Book With Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Engineered for Seamless Highway Travel
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-brand-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">5-Minute Atomic Seat Lock</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                No double bookings. Our server-side concurrency engine locks your seats atomically across devices while you complete checkout.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Tiered Automated Refunds</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Clear, transparent cancellation rules: up to 90% instant refund calculated automatically based on departure schedule.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Official E-Ticket & Manifests</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Instant PDF boarding pass download, unique PNR lookup, and direct live manifest reconciliation with bus operators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
