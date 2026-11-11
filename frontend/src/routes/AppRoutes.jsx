
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PassengerLayout from "../layouts/PassengerLayout";
import OperationsLayout from "../layouts/OperationsLayout";
import AdminLayout from "../layouts/AdminLayout";
import OperatorLayout from "../components/operator/OperatorLayout";

import Home from "../pages/public/Home";
import SearchTrips from "../pages/passenger/SearchTrips";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Unauthorized from "../pages/public/Unauthorized";

import MyBookings from "../pages/passenger/MyBookings";
import TripSeats from "../pages/passenger/TripSeats";
import BookingCheckout from "../pages/passenger/BookingCheckout";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageUsers from "../pages/admin/ManageUsers";
import ManageOperators from "../pages/admin/ManageOperators";
import PlatformTrips from "../pages/admin/PlatformTrips";
import PlatformBookings from "../pages/admin/PlatformBookings";
import OperatorDashboard from "../pages/operator/OperatorDashboard";
import ManageBuses from "../pages/operator/ManageBuses";
import ManageTrips from "../pages/operator/ManageTrips";
import PassengerManifest from "../pages/operator/PassengerManifest";
import OperatorReports from "../pages/operator/OperatorReports";

import StaffDashboard from "../pages/staff/StaffDashboard";
import BackendStatus from "../components/common/BackendStatus";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

const RoleHome = () => {
  const { user } = useAuth();

  const destinations = {
    passenger: "/",
    admin: "/admin",
    operator: "/operator",
    staff: "/staff",
  };

  return (
    <Navigate
      to={destinations[user?.role] || "/unauthorized"}
      replace
    />
  );
};

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
    <span className="text-8xl font-extrabold text-blue-600">
      404
    </span>

    <h1 className="mt-4 text-3xl font-bold text-slate-800">
      Page not found
    </h1>

    <p className="mt-3 max-w-md text-slate-500">
      The page you are looking for does not exist or may have been moved.
    </p>

    <a
      href="/"
      className="mt-7 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
    >
      Back to home
    </a>
  </div>
);

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PassengerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchTrips />} />
          <Route path="/passenger/search" element={<SearchTrips />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute allowedRoles={["passenger"]} />}>
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/passenger/bookings" element={<MyBookings />} />
            <Route
              path="/passenger/trips/:tripId/seats"
              element={<TripSeats />}
            />
            <Route
              path="/passenger/checkout"
              element={<BookingCheckout />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="operators" element={<ManageOperators />} />
            <Route path="trips" element={<PlatformTrips />} />
            <Route path="bookings" element={<PlatformBookings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["operator"]} />}>
          <Route path="/operator" element={<OperatorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OperatorDashboard />} />
            <Route path="buses" element={<ManageBuses />} />
            <Route path="trips" element={<ManageTrips />} />
            <Route path="manifest" element={<PassengerManifest />} />
            <Route path="reports" element={<OperatorReports />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
          <Route path="/staff" element={<OperationsLayout />}>
            <Route index element={<StaffDashboard />} />
          </Route>
        </Route>

        <Route path="/system-status" element={<BackendStatus />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["passenger", "admin", "operator", "staff"]}
            >
              <RoleHome />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
