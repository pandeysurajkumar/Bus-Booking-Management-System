import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Ticket,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/operator.css";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  const links = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/operators", label: "Operators", icon: Building2 },
    { path: "/admin/trips", label: "Trips", icon: CalendarDays },
    { path: "/admin/bookings", label: "Bookings", icon: Ticket },
  ];

  return (
    <div className="operator-app">
      <aside className={`operator-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="operator-logo">
          <span className="operator-logo-icon">BG</span>
          <span>
            Bus<span>Go</span>
          </span>
        </div>

        <div className="operator-sidebar-label">ADMIN PANEL</div>

        <nav className="operator-menu">
          {links.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? "operator-nav active" : "operator-nav"
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="operator-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {menuOpen && (
        <div
          className="operator-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="operator-content">
        <header className="operator-topbar">
          <button
            className="operator-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <div>
            <strong>Platform Administration</strong>
            <span>Oversee operators, trips and bookings</span>
          </div>

          <div className="operator-avatar">
            {(user?.name || "A").slice(0, 2).toUpperCase()}
          </div>
        </header>

        <main className="operator-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
