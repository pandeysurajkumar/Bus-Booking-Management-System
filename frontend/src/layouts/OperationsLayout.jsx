import { useAuth } from "../context/AuthContext";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BusFront,
  Route,
  CalendarDays,
  Ticket,
  Users,
  ChartNoAxesCombined
} from "lucide-react";

const OperationsLayout = () => {
  const { user } = useAuth();

  const dashboardNames = {
    admin: "Admin Dashboard",
    operator: "Operator Dashboard",
    staff: "Staff Dashboard"
  };

  const menuByRole = {
    admin: [
      { label: "Dashboard", path: "/admin" },
      { label: "Buses", path: "/admin/buses" },
      { label: "Routes", path: "/admin/routes" },
      { label: "Trips", path: "/admin/trips" },
      { label: "Bookings", path: "/admin/bookings" },
      { label: "Users", path: "/admin/users" },
      { label: "Reports", path: "/admin/reports" }
    ],

    operator: [
      { label: "Dashboard", path: "/operator" },
      { label: "My Buses", path: "/operator/buses" },
      { label: "My Trips", path: "/operator/trips" },
      { label: "Passenger Manifest", path: "/operator/manifests" }
    ],

    staff: [
      { label: "Dashboard", path: "/staff" },
      { label: "Assigned Trips", path: "/staff/trips" },
      { label: "Ticket Verification", path: "/staff/verification" }
    ]
  };

  const menu = menuByRole[user.role] || [];

  return (
    <div className="min-h-screen flex bg-slate-100">

      <aside className="w-64 bg-slate-950 text-white hidden md:block">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">
            BusGo {dashboardNames[user.role] || "Operations"}
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Management Portal
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
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
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b px-6 py-4 flex justify-between">
          <h2 className="font-semibold text-slate-800">
            Management Dashboard
          </h2>

          <span className="text-sm text-slate-500">
            Operations
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
