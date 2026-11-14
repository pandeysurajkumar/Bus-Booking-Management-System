import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, ArrowUpDown, Calendar, MapPin, Bus, AlertCircle, RefreshCw } from 'lucide-react';
import { BusCard } from '../components/BusCard';
import api from '../api/axios';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const fromCity = searchParams.get('fromCity') || '';
  const toCity = searchParams.get('toCity') || '';
  const date = searchParams.get('date') || '';

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [hasAc, setHasAc] = useState(searchParams.get('hasAc') || '');
  const [hasSleeper, setHasSleeper] = useState(searchParams.get('hasSleeper') || '');
  const [sortBy, setSortBy] = useState('departure_asc');

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/trips', {
        params: {
          fromCity,
          toCity,
          date,
          hasAc: hasAc || undefined,
          hasSleeper: hasSleeper || undefined,
          sortBy
        }
      });
      setTrips(res.data.data.trips || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load buses matching your criteria. Please try different filters or dates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [fromCity, toCity, date, hasAc, hasSleeper, sortBy]);

  const handleSelectSeats = ({ trip, seats, baseFare }) => {
    navigate('/booking/passengers', {
      state: {
        tripId: trip._id,
        seats,
        baseFare
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Route Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xl sm:text-2xl font-extrabold text-gray-900">
            <span>{fromCity || 'All Origin Cities'}</span>
            <span className="text-brand-600">→</span>
            <span>{toCity || 'All Destination Cities'}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-gray-500">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>
              {date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'All Dates'}
            </span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">{trips.length} Buses Available</span>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setHasAc(hasAc === 'true' ? '' : 'true')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              hasAc === 'true'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            AC Buses
          </button>
          <button
            type="button"
            onClick={() => setHasSleeper(hasSleeper === 'true' ? '' : 'true')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              hasSleeper === 'true'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
            }`}
          >
            Sleeper Berths
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-1.5 ml-auto">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="departure_asc">Departure: Earliest First</option>
              <option value="departure_desc">Departure: Latest First</option>
              <option value="fare_asc">Price: Low to High</option>
              <option value="fare_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-xs">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-base font-bold text-gray-800">Finding the best buses...</h3>
          <p className="text-xs text-gray-500 mt-1">Checking live seat availability and route timings</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h3 className="text-sm font-bold text-red-900">{error}</h3>
          <button
            onClick={fetchTrips}
            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl"
          >
            Try Again
          </button>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <Bus className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">No buses found for this date or route</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              We couldn't find scheduled buses matching {fromCity} to {toCity}. Try selecting tomorrow's date or clearing filters.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setHasAc('');
              setHasSleeper('');
              navigate('/search');
            }}
            className="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-brand-700 transition"
          >
            View All Scheduled Buses
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <BusCard key={trip._id} trip={trip} onSelectSeats={handleSelectSeats} />
          ))}
        </div>
      )}
    </div>
  );
};
