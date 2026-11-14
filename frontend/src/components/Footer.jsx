import React from 'react';
import { Bus, ShieldCheck, Heart, MapPin, Phone, Mail, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
                <Bus className="w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                ALGIONS<span className="text-brand-500">BUS</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              India's modern bus reservation platform inspired by RedBus and premier movie-ticketing systems.
              Built with atomic seat locking, real-time tracking, and automated refund management.
            </p>
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-brand-400">
              <Award className="w-4 h-4" />
              <span>ALGIONS AI LABS Assessment Project</span>
            </div>
          </div>

          {/* Col 2: Top Routes */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Popular Indian Routes</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link to="/search?fromCity=New%20Delhi&toCity=Chandigarh" className="hover:text-white transition">
                  Delhi → Chandigarh Buses
                </Link>
              </li>
              <li>
                <Link to="/search?fromCity=Mumbai&toCity=Pune" className="hover:text-white transition">
                  Mumbai → Pune Express
                </Link>
              </li>
              <li>
                <Link to="/search?fromCity=Bengaluru&toCity=Chennai" className="hover:text-white transition">
                  Bengaluru → Chennai Volvo
                </Link>
              </li>
              <li>
                <Link to="/search?fromCity=New%20Delhi&toCity=Jaipur" className="hover:text-white transition">
                  Delhi → Jaipur Luxury
                </Link>
              </li>
              <li>
                <Link to="/search?fromCity=Bengaluru&toCity=Hyderabad" className="hover:text-white transition">
                  Bengaluru → Hyderabad Sleeper
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Features & Policies */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customer Assurance</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Simulated Secure Payments</span>
              </li>
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>5-Min Atomic Seat Lock</span>
              </li>
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Tiered Instant Refunds</span>
              </li>
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Operators & Fleets</span>
              </li>
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Official PDF Boarding Passes</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">24x7 Help & Contact</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>Toll Free: 1800-123-4567</span>
              </p>
              <p className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@algionsbus.com</span>
              </p>
              <p className="flex items-center space-x-2.5">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Cyber City, Gurugram, India</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2026 ALGIONS AI LABS PRIVATE LIMITED Assessment. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span>Production Architecture: Node.js + Express + MongoDB + React + Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
