
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layouts
import PassengerLayout from "../layouts/PassengerLayout";
import OperationsLayout from "../layouts/OperationsLayout";

// Public pages
import Home from "../pages/public/Home";
import SearchBuses from "../pages/public/SearchBuses";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Unauthorized from "../pages/public/Unauthorized";

// Passenger pages
import MyBookings from "../pages/passenger/MyBookings";
import TripSeats from "../pages/passenger/TripSeats";
import BookingCheckout from "../pages/passenger/BookingCheckout";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";

// Operator pages
import OperatorDashboard from "../pages/operator/OperatorDashboard";
import ManageBuses from "../pages/operator/ManageBuses";
import ManageTrips from "../pages/operator/ManageTrips";
import PassengerManifest from "../pages/operator/PassengerManifest";
import OperatorReports from "../pages/operator/OperatorReports";

// Staff pages
import StaffDashboard from "../pages/staff/StaffDashboard";

// Components
import BackendStatus from "../components/common/BackendStatus";

// Authentication
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// Redirect users according to their roles
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
      The page you're looking for doesn't exist or may have been moved.
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

        {/* ========================================
            PUBLIC ROUTES
        ======================================== */}

        <Route element={<PassengerLayout />}>
          <Route path="/" element={<Home />} />

          <Route
            path="/search"
            element={<SearchBuses />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/unauthorized"
            element={<Unauthorized />}
          />

          {/* Passenger protected routes */}

          <Route
            element={
              <ProtectedRoute allowedRoles={["passenger"]} />
            }
          >
            <Route
              path="/my-bookings"
              element={<MyBookings />}
            />

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

        {/* ========================================
            ADMIN ROUTES
        ======================================== */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]} />
          }
        >
          <Route
            path="/admin"
            element={<OperationsLayout />}
          >
            <Route
              index
              element={<AdminDashboard />}
            />

            {/* Additional admin pages will be registered here */}
          </Route>
        </Route>

        {/* ========================================
            OPERATOR ROUTES
        ======================================== */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["operator"]} />
          }
        >
          <Route
            path="/operator"
            element={<OperationsLayout />}
          >
            <Route
              index
              element={<Navigate to="dashboard" replace />}
            />

            <Route
              path="dashboard"
              element={<OperatorDashboard />}
            />

            <Route
              path="buses"
              element={<ManageBuses />}
            />

            <Route
              path="trips"
              element={<ManageTrips />}
            />

            <Route
              path="manifest"
              element={<PassengerManifest />}
            />

            <Route
              path="reports"
              element={<OperatorReports />}
            />
          </Route>
        </Route>

        {/* ========================================
            STAFF ROUTES
        ======================================== */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["staff"]} />
          }
        >
          <Route
            path="/staff"
            element={<OperationsLayout />}
          >
            <Route
              index
              element={<StaffDashboard />}
            />
          </Route>
        </Route>

        {/* ========================================
            SYSTEM ROUTES
        ======================================== */}

        <Route
          path="/system-status"
          element={<BackendStatus />}
        />

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

        {/* ========================================
            404 FALLBACK
        ======================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
