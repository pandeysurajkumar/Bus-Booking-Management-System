import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bus,
  CalendarDays,
  Users,
  ChartColumn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import "../../styles/operator.css";

export default function OperatorLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const links = [
    {
      path: "/operator/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/operator/buses",
      label: "Manage Buses",
      icon: Bus,
    },
    {
      path: "/operator/trips",
      label: "Trip Schedules",
      icon: CalendarDays,
    },
    {
      path: "/operator/reports",
      label: "Reports",
      icon: ChartColumn,
    },
  ];

  return (
    <div className="operator-app">
      <aside className={`operator-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="operator-logo">
          <span className="operator-logo-icon"><Bus size={23} /></span>
          <span>Bus<span>Go</span></span>
        </div>

        <div className="operator-sidebar-label">OPERATOR PANEL</div>

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

        <button className="operator-logout" onClick={logout}>
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
            <strong>Operator Workspace</strong>
            <span>Manage your bus operations</span>
          </div>

          <div className="operator-avatar">OP</div>
        </header>

        <main className="operator-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}