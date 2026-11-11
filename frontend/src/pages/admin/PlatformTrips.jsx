import { useEffect, useState } from "react";
import api from "../../api/client";
import "../../styles/admin.css";

export default function PlatformTrips() {
  const [trips, setTrips] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTrips() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/reports/trips", {
          params: { status, page: 1, limit: 100 },
        });

        const result = response.data?.data ?? response.data;
        const rows = Array.isArray(result)
          ? result
          : result.trips ?? result.results ?? [];

        if (active) setTrips(rows);
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Unable to load platform trips.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTrips();
    return () => {
      active = false;
    };
  }, [status]);

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">NETWORK OPERATIONS</span>
          <h1>Platform Trips</h1>
          <p>View scheduled and completed trips across operators.</p>
        </div>
      </header>

      <section className="admin-panel">
        <div className="admin-toolbar admin-toolbar-end">
          <select
            className="admin-input admin-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="boarding">Boarding</option>
            <option value="departed">Departed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        {loading ? (
          <div className="admin-loading">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="admin-empty">No trips found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Trip / Route</th>
                  <th>Operator</th>
                  <th>Departure</th>
                  <th>Seats</th>
                  <th>Occupancy</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.tripId || trip._id}>
                    <td>
                      <strong>{trip.tripCode || String(trip.tripId || trip._id || "").slice(-7)}</strong>
                      <small>{trip.route?.routeName || trip.routeId?.name || trip.routeName || "—"}</small>
                    </td>
                    <td>{trip.bus?.registrationNumber || trip.operatorId?.companyName || trip.operatorName || "—"}</td>
                    <td>
                      {trip.departureAt
                        ? new Date(trip.departureAt).toLocaleString("en-IN")
                        : "—"}
                    </td>
                    <td>
                      {trip.bookedSeats ?? 0} / {trip.totalSeats ?? "—"}
                    </td>
                    <td>
                      {trip.occupancyPercentage != null
                        ? `${Math.round(trip.occupancyPercentage)}%`
                        : "—"}
                    </td>
                    <td>
                      <span className={`admin-status status-${trip.status || "unknown"}`}>
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