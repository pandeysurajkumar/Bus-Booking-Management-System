
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BusFront } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-blue-700"
        : "text-slate-600 hover:text-blue-700"
    }`;

  const workspacePath = {
    admin: "/admin",
    operator: "/operator",
    staff: "/staff",
    passenger: "/my-bookings",
  }[user?.role];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-5 min-h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
            <BusFront size={22} />
          </span>
          <span className="text-xl font-bold text-slate-900">
            Bus<span className="text-blue-700">Go</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/" className={navClass} end>
            Home
          </NavLink>
          <NavLink to="/search" className={navClass}>
            Search Buses
          </NavLink>
          {isAuthenticated && user?.role === "passenger" && (
            <NavLink to="/my-bookings" className={navClass}>
              My Bookings
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {workspacePath && user?.role !== "passenger" && (
                <Link
                  to={workspacePath}
                  className="hidden sm:inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  Dashboard
                </Link>
              )}
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-slate-600 hover:text-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
