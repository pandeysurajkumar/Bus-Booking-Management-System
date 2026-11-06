
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import PassengerLayout from "../layouts/PassengerLayout";
import OperationsLayout from "../layouts/OperationsLayout";

import Home from "../pages/public/Home";
import SearchBuses from "../pages/public/SearchBuses";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Unauthorized from "../pages/public/Unauthorized";

import MyBookings from "../pages/passenger/MyBookings";

import AdminDashboard from "../pages/admin/AdminDashboard";
import OperatorDashboard from "../pages/operator/OperatorDashboard";
import StaffDashboard from "../pages/staff/StaffDashboard";

import ProtectedRoute from "./ProtectedRoute";

import BackendStatus from "../components/common/BackendStatus";

import { useAuth } from "../context/AuthContext";

const RoleHome = () => {
  const { user } = useAuth();

  const destinations = {
    passenger: "/",
    admin: "/admin",
    operator: "/operator",
    staff: "/staff"
  };

  return (
    <Navigate
      to={destinations[user.role] || "/unauthorized"}
      replace
    />
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public pages */}
        <Route element={<PassengerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchBuses />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          {/* Protected passenger pages */}
          <Route element={<ProtectedRoute allowedRoles={["passenger"]} />}>
            <Route
              path="/my-bookings"
              element={<MyBookings />}
            />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<OperationsLayout />}>
            <Route
              index
              element={<AdminDashboard />}
            />
          </Route>
        </Route>

        {/* Operator routes */}
        <Route element={<ProtectedRoute allowedRoles={["operator"]} />}>
          <Route path="/operator" element={<OperationsLayout />}>
            <Route
              index
              element={<OperatorDashboard />}
            />
          </Route>
        </Route>

        {/* Staff routes */}
        <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
          <Route path="/staff" element={<OperationsLayout />}>
            <Route
              index
              element={<StaffDashboard />}
            />
          </Route>
        </Route>

        {/* System status */}
        <Route
          path="/system-status"
          element={<BackendStatus />}
        />

        {/* Redirect logged-in users */}
        <Route path="/dashboard" element={<RoleHome />} />

        {/* Unknown routes */}
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
