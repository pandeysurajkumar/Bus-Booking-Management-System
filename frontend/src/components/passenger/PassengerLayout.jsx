import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bus,
  Search,
  Ticket,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function PassengerLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div className="passenger-app">
      <header className="passenger-navbar">
        <NavLink to="/passenger/search" className="passenger-brand">
          <span className="brand-icon">
            <Bus size={23} />
          </span>
          <span>Bus<span className="brand-highlight">Go</span></span>
        </NavLink>

        <nav className="passenger-nav-links">
          <NavLink to="/passenger/search">
            <Search size={17} /> Search Buses
          </NavLink>

          <NavLink to="/passenger/bookings">
            <Ticket size={17} /> My Bookings
          </NavLink>
        </nav>

        <button className="passenger-logout" onClick={logout}>
          <LogOut size={17} />
          Logout
        </button>
      </header>

      <main className="passenger-main">
        <Outlet />
      </main>

      <footer className="passenger-footer">
        <span>© {new Date().getFullYear()} BusGo</span>
        <span>Travel comfortably. Travel safely.</span>
      </footer>
    </div>
  );
}