import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bus, Lock, Mail, User, Phone, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const [isRegisterMode, setIsRegisterMode] = useState(queryParams.get('mode') === 'register');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const returnUrl = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegisterMode) {
        const userData = await register({ name, email, password, role, phone });
        if (userData.role === 'admin') navigate('/admin');
        else if (userData.role === 'operator') navigate('/operator');
        else navigate(returnUrl);
      } else {
        const userData = await login(email, password);
        if (userData.role === 'admin') navigate('/admin');
        else if (userData.role === 'operator') navigate('/operator');
        else navigate(returnUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for demo evaluation
  const handleQuickFill = (demoRole) => {
    setIsRegisterMode(false);
    setError('');
    if (demoRole === 'admin') {
      setEmail('admin@algionsbus.com');
      setPassword('Admin@123');
    } else if (demoRole === 'operator') {
      setEmail('operator@zingbus.com');
      setPassword('Operator@123');
    } else {
      setEmail('customer@gmail.com');
      setPassword('Customer@123');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30 mx-auto">
          <Bus className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {isRegisterMode ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        <p className="text-xs text-gray-500">
          Sign in to view your bookings, download tickets, or access management portals.
        </p>
      </div>

      {/* QUICK FILL DEMO CREDENTIALS STRIP */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex items-center space-x-1.5 font-extrabold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Internship Assessment Quick Login:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold text-gray-800 hover:bg-amber-100/50 transition text-center shadow-2xs"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('operator')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold text-blue-700 hover:bg-amber-100/50 transition text-center shadow-2xs"
            >
              Demo Operator
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold text-purple-700 hover:bg-amber-100/50 transition text-center shadow-2xs"
            >
              Demo Admin
            </button>
          </div>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl border border-gray-100 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-xl text-xs font-bold text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setError('');
              }}
              className={`py-2 rounded-lg transition ${
                !isRegisterMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setError('');
              }}
              className={`py-2 rounded-lg transition ${
                isRegisterMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isRegisterMode && (
              <>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arun Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Role Selection</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="customer">Customer (Traveler)</option>
                    <option value="operator">Bus Operator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {isRegisterMode && (
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Mobile Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Please wait...' : isRegisterMode ? 'Create Account' : 'Sign In'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
