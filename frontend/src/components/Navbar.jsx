import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, User, LogOut, Ticket, Shield, Settings, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isOperator } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pnrSearch, setPnrSearch] = useState('');

  const handlePnrSearch = (e) => {
    e.preventDefault();
    if (pnrSearch.trim()) {
      navigate(`/ticket/${pnrSearch.trim().toUpperCase()}`);
      setPnrSearch('');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:bg-brand-700 transition">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900 group-hover:text-brand-600 transition">
                ALGIONS<span className="text-brand-600">BUS</span>
              </span>
              <span className="block text-[10px] font-semibold text-gray-400 tracking-wider uppercase -mt-1">
                Express RedLine
              </span>
            </div>
          </Link>

          {/* Search PNR Quick Box */}
          <form onSubmit={handlePnrSearch} className="hidden md:flex items-center relative max-w-xs w-64">
            <input
              type="text"
              placeholder="Search by PNR..."
              value={pnrSearch}
              onChange={(e) => setPnrSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent uppercase font-mono"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          </form>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-brand-600 transition">
              Book Tickets
            </Link>
            <Link to="/#popular-routes" className="hover:text-brand-600 transition">
              Popular Routes
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/my-bookings"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  <Ticket className="w-4 h-4 text-brand-600" />
                  <span>My Bookings</span>
                </Link>

                {isOperator && (
                  <Link
                    to="/operator"
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Operator Portal</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Profile Pill */}
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-gray-900 leading-tight">{user.name}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{user.role}</span>
                  </div>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-brand-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/login?mode=register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 px-4 pt-3 pb-5 space-y-3 bg-white">
          <form onSubmit={handlePnrSearch} className="relative w-full mb-3">
            <input
              type="text"
              placeholder="Search PNR..."
              value={pnrSearch}
              onChange={(e) => setPnrSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 uppercase font-mono"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-gray-900"
          >
            Book Tickets
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-gray-700"
              >
                My Bookings
              </Link>
              {isOperator && (
                <Link
                  to="/operator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-blue-600"
                >
                  Operator Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-purple-600"
                >
                  Admin Panel
                </Link>
              )}
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-red-600 font-semibold"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2 text-center text-sm font-semibold border border-gray-300 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/login?mode=register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2 text-center text-sm font-semibold bg-brand-600 text-white rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
