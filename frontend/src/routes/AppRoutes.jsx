
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PassengerLayout from "../layouts/PassengerLayout";
import OperationsLayout from "../layouts/OperationsLayout";

import Home from "../pages/public/Home";
import SearchBuses from "../pages/public/SearchBuses";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";

import MyBookings from "../pages/passenger/MyBookings";
import AdminDashboard from "../pages/admin/AdminDashboard";

import BackendStatus from "../components/common/BackendStatus";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Passenger application */}
        <Route element={<PassengerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchBuses />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        {/* Admin application scaffold */}
        <Route path="/admin" element={<OperationsLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* System health */}
        <Route
          path="/system-status"
          element={
            <div className="p-10">
              <h1 className="text-2xl font-bold mb-5">
                System Status
              </h1>
              <BackendStatus />
            </div>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <div className="text-center py-24">
              <h1 className="text-4xl font-bold">404</h1>
              <p className="text-slate-600 mt-3">
                Page not found.
              </p>
            </div>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
