import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { PassengerDetailsPage } from './pages/PassengerDetailsPage';
import { BookingReviewPage } from './pages/BookingReviewPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TicketConfirmationPage } from './pages/TicketConfirmationPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { OperatorDashboardPage } from './pages/OperatorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/ticket/:pnr" element={<TicketConfirmationPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Customer Booking Flow (Protected) */}
              <Route
                path="/booking/passengers"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'operator', 'admin']}>
                    <PassengerDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking/review"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'operator', 'admin']}>
                    <BookingReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking/checkout"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'operator', 'admin']}>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'operator', 'admin']}>
                    <CustomerDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Operator Portal */}
              <Route
                path="/operator"
                element={
                  <ProtectedRoute allowedRoles={['operator', 'admin']}>
                    <OperatorDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Panel */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
