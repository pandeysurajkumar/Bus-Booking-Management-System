
import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";

const PassengerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">

      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-950 text-slate-300 py-6">
        <div className="max-w-7xl mx-auto px-5 text-center text-sm">
          © {new Date().getFullYear()} BusGo.
          Bus Booking Management System.
        </div>
      </footer>

    </div>
  );
};

export default PassengerLayout;
