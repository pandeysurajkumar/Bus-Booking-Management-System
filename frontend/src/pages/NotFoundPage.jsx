import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
        <Bus className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-gray-900">404 - Page Not Found</h1>
      <p className="text-xs text-gray-500 max-w-sm mx-auto">
        The highway stop or reservation link you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
