
import { Link } from "react-router-dom";
import {
  BusFront,
  ShieldCheck,
  Clock,
  MapPin
} from "lucide-react";

const Home = () => {
  return (
    <div>

      <section className="bg-gradient-to-r from-blue-950 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-5 py-24">

          <div className="max-w-2xl">

            <p className="text-blue-200 font-semibold mb-4">
              YOUR JOURNEY STARTS HERE
            </p>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Travel Smarter.
              <br />
              Book Better.
            </h1>

            <p className="text-blue-100 mt-6 text-lg">
              Discover routes, compare buses and reserve your
              seats through one convenient booking platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="inline-block bg-white text-blue-800 px-7 py-3 rounded-lg font-bold hover:bg-blue-50"
              >
                Search Buses
              </Link>
              <Link
                to="/login"
                className="inline-block border border-white/40 text-white px-7 py-3 rounded-lg font-semibold hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>

          </div>

        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-16">

        <h2 className="text-3xl font-bold text-center">
          Why Choose BusGo?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mt-10">

          <Feature
            icon={MapPin}
            title="Easy Search"
            description="Find trips using origin, destination and journey date."
          />

          <Feature
            icon={ShieldCheck}
            title="Secure Booking"
            description="Book available seats with reliable booking protection."
          />

          <Feature
            icon={Clock}
            title="Quick Reservations"
            description="Manage your bookings and tickets in one place."
          />

        </div>

      </section>

    </div>
  );
};

const Feature = ({ icon: Icon, title, description }) => (
  <div className="bg-white border border-slate-200 p-7 rounded-xl">
    <Icon className="text-blue-700" size={30} />

    <h3 className="font-bold text-lg mt-4">
      {title}
    </h3>

    <p className="text-slate-600 text-sm mt-2">
      {description}
    </p>
  </div>
);

export default Home;
