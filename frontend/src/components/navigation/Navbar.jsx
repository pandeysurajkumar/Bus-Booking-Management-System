
import { Link, NavLink } from "react-router-dom";
import { BusFront } from "lucide-react";

const Navbar = () => {
  const navClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-blue-700"
        : "text-slate-600 hover:text-blue-700"
    }`;

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2">
          <BusFront className="text-blue-700" size={28} />

          <span className="text-xl font-bold text-slate-900">
            Bus<span className="text-blue-700">Go</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          <NavLink to="/search" className={navClass}>
            Search Buses
          </NavLink>

          <NavLink to="/my-bookings" className={navClass}>
            My Bookings
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
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
        </div>

      </div>
    </header>
  );
};

export default Navbar;
