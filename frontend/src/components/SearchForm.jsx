import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowRightLeft, Search, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export const SearchForm = ({ initialValues = {}, className = '' }) => {
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [fromStateId, setFromStateId] = useState('');
  const [toStateId, setToStateId] = useState('');

  const [fromCities, setFromCities] = useState([]);
  const [toCities, setToCities] = useState([]);

  const [fromCity, setFromCity] = useState(initialValues.fromCity || '');
  const [toCity, setToCity] = useState(initialValues.toCity || '');

  // Default to today or tomorrow
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialValues.date || todayStr);

  const [loadingLocations, setLoadingLocations] = useState(true);
  const [validationError, setValidationError] = useState('');

  // 1. Fetch Indian States from MongoDB on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await api.get('/locations/states');
        setStates(res.data.data || []);
      } catch (err) {
        console.error('Failed to load states:', err);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchStates();
  }, []);

  // 2. Fetch origin cities when fromStateId changes
  useEffect(() => {
    const fetchFromCities = async () => {
      try {
        const res = await api.get('/locations/cities', {
          params: fromStateId ? { stateId: fromStateId } : {}
        });
        setFromCities(res.data.data || []);
      } catch (err) {
        console.error('Failed to load origin cities:', err);
      }
    };
    fetchFromCities();
  }, [fromStateId]);

  // 3. Fetch destination cities when toStateId changes
  useEffect(() => {
    const fetchToCities = async () => {
      try {
        const res = await api.get('/locations/cities', {
          params: toStateId ? { stateId: toStateId } : {}
        });
        setToCities(res.data.data || []);
      } catch (err) {
        console.error('Failed to load destination cities:', err);
      }
    };
    fetchToCities();
  }, [toStateId]);

  // Swap handler
  const handleSwap = () => {
    const tempState = fromStateId;
    setFromStateId(toStateId);
    setToStateId(tempState);

    const tempCity = fromCity;
    setFromCity(toCity);
    setToCity(tempCity);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!fromCity) {
      setValidationError('Please select an origin city (From)');
      return;
    }
    if (!toCity) {
      setValidationError('Please select a destination city (To)');
      return;
    }
    if (fromCity.toLowerCase() === toCity.toLowerCase()) {
      setValidationError('Origin and destination cities cannot be the same');
      return;
    }
    if (!date) {
      setValidationError('Please select a valid journey date');
      return;
    }

    const params = new URLSearchParams({
      fromCity,
      toCity,
      date
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 ${className}`}>
      {validationError && (
        <div className="mb-5 flex items-center space-x-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* FROM LOCATION (States + Cities) */}
          <div className="lg:col-span-5 bg-gray-50 border border-gray-200 rounded-xl p-3 hover:border-brand-400 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Leaving From</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={fromStateId}
                onChange={(e) => {
                  setFromStateId(e.target.value);
                  setFromCity('');
                }}
                className="w-full text-xs font-medium bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-gray-800 focus:outline-none"
              >
                <option value="">All States</option>
                {states.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>

              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="w-full text-sm font-semibold bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-gray-900 focus:outline-none"
                required
              >
                <option value="">Select City *</option>
                {fromCities.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="lg:col-span-1 flex justify-center -my-2 lg:my-0">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap From and To locations"
              className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-brand-600 hover:border-brand-300 shadow-md flex items-center justify-center transition active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* TO LOCATION (States + Cities) */}
          <div className="lg:col-span-4 bg-gray-50 border border-gray-200 rounded-xl p-3 hover:border-brand-400 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Going To</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={toStateId}
                onChange={(e) => {
                  setToStateId(e.target.value);
                  setToCity('');
                }}
                className="w-full text-xs font-medium bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-gray-800 focus:outline-none"
              >
                <option value="">All States</option>
                {states.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>

              <select
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                className="w-full text-sm font-semibold bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-gray-900 focus:outline-none"
                required
              >
                <option value="">Select City *</option>
                {toCities.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* JOURNEY DATE */}
          <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-3 hover:border-brand-400 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition">
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Date</span>
            </div>
            <input
              type="date"
              value={date}
              min={todayStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm font-semibold bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-gray-900 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* SEARCH ACTION BUTTON */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 transition transform active:scale-98"
          >
            <Search className="w-5 h-5" />
            <span>Search Buses</span>
          </button>
        </div>
      </form>
    </div>
  );
};
