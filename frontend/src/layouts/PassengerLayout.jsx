
import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";
import "../styles/passenger.css";

const PassengerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-950 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
          <span>© {new Date().getFullYear()} BusGo. Reliable bus booking.</span>
          <span className="text-slate-500">Travel comfortably. Travel safely.</span>
        </div>
      </footer>
    </div>
  );
};

export default PassengerLayout;
