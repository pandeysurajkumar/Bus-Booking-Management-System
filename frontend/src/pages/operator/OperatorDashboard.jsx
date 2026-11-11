import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bus,
  CalendarDays,
  Ticket,
  IndianRupee,
  ArrowUpRight,
  Clock,
} from "lucide-react";

import api from "../../api/client";

export default function OperatorDashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryResponse, tripsResponse] = await Promise.all([
          api.get("/reports/dashboard"),
          api.get("/reports/trips", {
            params: { page: 1, limit: 5 },
          }),
        ]);

        setSummary(summaryResponse.data.data);
        setTrips(
          tripsResponse.data.data?.trips || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load operator dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="operator-loading">Loading dashboard...</div>;
  }

  const cards = [
    {
      label: "Total Trips",
      value: summary?.trips?.total ?? 0,
      icon: CalendarDays,
      color: "blue",
    },
    {
      label: "Scheduled Trips",
      value: summary?.trips?.scheduled ?? 0,
      icon: Bus,
      color: "purple",
    },
    {
      label: "Confirmed Bookings",
      value: summary?.bookings?.confirmed ?? 0,
      icon: Ticket,
      color: "green",
    },
    {
      label: "Paid Revenue",
      value: `₹${Number(
        summary?.revenue?.total || 0
      ).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "orange",
    },
  ];

  return (
    <div className="operator-page">
      <div className="operator-page-heading">
        <div>
          <span className="operator-eyebrow">OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>Monitor your transportation business.</p>
        </div>

        <button
          className="operator-primary-button"
          onClick={() => navigate("/operator/trips")}
        >
          <CalendarDays size={17} />
          Manage Trips
        </button>
      </div>

      {error && <div className="operator-error">{error}</div>}

      <div className="operator-stat-grid">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <article className="operator-stat-card" key={label}>
            <div className={`operator-stat-icon ${color}`}>
              <Icon size={23} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="operator-section-heading">
        <div>
          <h2>Recent Trip Schedules</h2>
          <p>Your latest scheduled operations</p>
        </div>

        <button
          className="operator-text-button"
          onClick={() => navigate("/operator/trips")}
        >
          View all <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="operator-table-wrapper">
        <table className="operator-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Bus</th>
              <th>Departure</th>
              <th>Occupancy</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {trips.map((trip) => (
              <tr key={trip.tripId}>
                <td>
                  {trip.route?.routeName || "Route"}
                </td>
                <td>
                  {trip.bus?.registrationNumber || "Bus"}
                </td>
                <td>
                  {new Date(trip.departureAt).toLocaleString("en-IN")}
                </td>
                <td>
                  {trip.bookedSeats}/{trip.totalSeats}
                  <div className="occupancy-track">
                    <div
                      style={{
                        width: `${trip.occupancyPercentage}%`,
                      }}
                    />
                  </div>
                </td>
                <td>
                  <span className={`operator-status ${trip.status}`}>
                    {trip.status}
                  </span>
                </td>
              </tr>
            ))}

            {!trips.length && (
              <tr>
                <td colSpan="5" className="operator-empty-cell">
                  No trip schedules found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="operator-quick-grid">
        <button onClick={() => navigate("/operator/buses")}>
          <Bus size={23} />
          <strong>Manage Fleet</strong>
          <span>Add and update buses</span>
        </button>

        <button onClick={() => navigate("/operator/trips")}>
          <Clock size={23} />
          <strong>Trip Schedules</strong>
          <span>Manage departure schedules</span>
        </button>

        <button onClick={() => navigate("/operator/reports")}>
          <Ticket size={23} />
          <strong>Business Reports</strong>
          <span>Review occupancy and revenue</span>
        </button>
      </div>
    </div>
  );
}