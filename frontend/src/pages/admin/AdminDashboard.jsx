import { useEffect, useState } from "react";
import api from "../../api/client";
import "../../styles/admin.css";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function StatCard({ label, value, detail, icon }) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-top">
        <span>{label}</span>
        <span className="admin-stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [dashboardRes, tripsRes] = await Promise.all([
          api.get("/reports/dashboard"),
          api.get("/reports/trips", { params: { page: 1, limit: 6 } }),
        ]);

        if (!active) return;

        setSummary(dashboardRes.data?.data ?? dashboardRes.data);
        const tripData = tripsRes.data?.data ?? tripsRes.data;
        setTrips(
          Array.isArray(tripData)
            ? tripData
            : tripData?.trips ?? tripData?.results ?? []
        );
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load dashboard data. Check admin report API access."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const stats = {
    totalTrips: summary?.trips?.total ?? summary?.totalTrips ?? 0,
    totalBookings: summary?.bookings?.total ?? summary?.totalBookings ?? 0,
    totalRevenue:
      summary?.revenue?.total ?? summary?.totalRevenue ?? 0,
    activeTrips:
      summary?.trips?.scheduled ?? summary?.activeTrips ?? 0,
  };

  if (loading) {
    return <div className="admin-page"><div className="admin-loading">Loading platform overview...</div></div>;
  }

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">PLATFORM CONTROL CENTER</span>
          <h1>Admin Dashboard</h1>
          <p>Monitor platform activity, trips, bookings and revenue.</p>
        </div>
        <span className="admin-live-indicator">Platform overview</span>
      </header>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <section className="admin-stats-grid">
        <StatCard
          label="Total Trips"
          value={stats.totalTrips ?? stats.trips ?? 0}
          detail="Trips recorded on platform"
          icon="🚌"
        />
        <StatCard
          label="Total Bookings"
          value={stats.totalBookings ?? stats.bookings ?? 0}
          detail="All booking records"
          icon="🎟️"
        />
        <StatCard
          label="Paid Revenue"
          value={formatCurrency(stats.totalRevenue ?? stats.revenue ?? 0)}
          detail="Successful paid bookings"
          icon="₹"
        />
        <StatCard
          label="Active Trips"
          value={stats.activeTrips ?? stats.scheduledTrips ?? 0}
          detail="Currently scheduled or active"
          icon="↗"
        />
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Recent trip activity</h2>
            <p>Latest trips available in the reporting service.</p>
          </div>
          <a href="/admin/trips" className="admin-text-link">View all trips →</a>
        </div>

        {trips.length === 0 ? (
          <div className="admin-empty">No trip records available.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Operator</th>
                  <th>Departure</th>
                  <th>Occupancy</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.tripId || trip._id || trip.id}>
                    <td>
                      <strong>{trip.tripCode || String(trip.tripId || trip._id || "").slice(-7) || "—"}</strong>
                      <small>{trip.route?.routeName || trip.routeId?.name || trip.routeName || "Route"}</small>
                    </td>
                    <td>{trip.operatorId?.companyName || trip.operatorId?.name || trip.operatorName || "—"}</td>
                    <td>
                      {trip.departureAt
                        ? new Date(trip.departureAt).toLocaleString("en-IN")
                        : "—"}
                    </td>
                    <td>
                      {trip.occupancyPercentage != null
                        ? `${Math.round(trip.occupancyPercentage)}%`
                        : trip.occupancy != null
                          ? `${Math.round(trip.occupancy)}%`
                          : "—"}
                    </td>
                    <td>
                      <span className={`admin-status status-${String(trip.status || "unknown").toLowerCase()}`}>
                        {trip.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}