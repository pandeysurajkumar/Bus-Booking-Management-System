import { useEffect, useState } from "react";
import api from "../../api/client";
import "../../styles/admin.css";

export default function PlatformBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/bookings", {
          params: { search, page: 1, limit: 100 },
        });

        const result = response.data?.data ?? response.data;
        const rows = Array.isArray(result)
          ? result
          : result.bookings ?? result.results ?? [];

        if (active) setBookings(rows);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load platform bookings. Check the admin bookings API."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBookings();
    return () => {
      active = false;
    };
  }, [search]);

  const money = (amount = 0) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">TRANSACTION OVERSIGHT</span>
          <h1>Platform Bookings</h1>
          <p>Review booking references, passenger accounts and payment status.</p>
        </div>
      </header>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <input
            className="admin-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by PNR..."
          />
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        {loading ? (
          <div className="admin-loading">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="admin-empty">No bookings found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PNR</th>
                  <th>Passenger</th>
                  <th>Journey</th>
                  <th>Booked on</th>
                  <th>Amount</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td><strong>{booking.pnr}</strong></td>
                    <td>
                      {booking.userId?.name || booking.passengerName || "—"}
                      <small>{booking.userId?.email || ""}</small>
                    </td>
                    <td>
                      {booking.journey?.originName || booking.originStopId?.name || "—"}
                      {" → "}
                      {booking.journey?.destinationName || booking.destinationStopId?.name || "—"}
                    </td>
                    <td>
                      {booking.bookedAt
                        ? new Date(booking.bookedAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>{money(booking.totalAmount)}</td>
                    <td>
                      <span className={`admin-status status-${booking.paymentStatus || "unknown"}`}>
                        {booking.paymentStatus || "Unknown"}
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