import { useAuth } from "../context/AuthContext";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BusFront,
  CalendarDays,
  Ticket,
  Users,
  ChartNoAxesCombined,
  LogOut
} from "lucide-react";

const OperationsLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardNames = {
    admin: "Admin Dashboard",
    operator: "Operator Dashboard",
    staff: "Staff Dashboard"
  };

  const menuByRole = {
    admin: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Users", path: "/admin/users", icon: Users },
      { label: "Operators", path: "/admin/operators", icon: BusFront },
      { label: "Trips", path: "/admin/trips", icon: CalendarDays },
      { label: "Bookings", path: "/admin/bookings", icon: Ticket }
    ],
    operator: [
      { label: "Dashboard", path: "/operator/dashboard", icon: LayoutDashboard },
      { label: "My Buses", path: "/operator/buses", icon: BusFront },
      { label: "My Trips", path: "/operator/trips", icon: CalendarDays },
      { label: "Manifest", path: "/operator/manifest", icon: Users },
      { label: "Reports", path: "/operator/reports", icon: ChartNoAxesCombined }
    ],
    staff: [
      { label: "Dashboard", path: "/staff", icon: LayoutDashboard }
    ]
  };

  const menu = menuByRole[user?.role] || [];

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-slate-950 text-white hidden md:flex md:flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">
            BusGo
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {dashboardNames[user?.role] || "Operations"}
          </p>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/staff"}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg text-sm ${
                    isActive
                      ? "bg-blue-700 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-3 p-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">
            {dashboardNames[user?.role] || "Management Dashboard"}
          </h2>
          <span className="text-sm text-slate-500">
            {user?.name}
          </span>
        </header>

        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OperationsLayout;
