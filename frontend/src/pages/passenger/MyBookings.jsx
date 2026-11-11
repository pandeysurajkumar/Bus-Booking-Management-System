import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Ticket, CalendarDays, XCircle, CreditCard } from "lucide-react";

import api from "../../api/client";
import "../../styles/passenger.css";

export default function MyBookings() {
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings/my", {
        params: { page: 1, limit: 50 },
      });

      const data = response.data.data;

      setBookings(
        Array.isArray(data) ? data : data?.bookings || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const simulatePayment = async (pnr) => {
    setActionLoading(pnr);
    setError("");

    try {
      await api.post(`/cancellations/${pnr}/pay`);
      await fetchBookings();
    } catch (err) {
      setError(
        err.response?.data?.message || "Payment simulation failed"
      );
    } finally {
      setActionLoading("");
    }
  };

  const cancelBooking = async (pnr) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel booking ${pnr}?`
    );

    if (!confirmed) return;

    setActionLoading(pnr);
    setError("");

    try {
      await api.post(`/cancellations/${pnr}/cancel`);
      await fetchBookings();
    } catch (err) {
      setError(
        err.response?.data?.message || "Booking cancellation failed"
      );
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return <div className="loading-state">Loading your bookings...</div>;
  }

  return (
    <div className="passenger-container">
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR TRAVEL HISTORY</span>
          <h1>My Bookings</h1>
          <p>Manage your tickets, payments and cancellations.</p>
        </div>

        <Ticket size={42} className="heading-icon" />
      </div>

      {location.state?.newBooking && (
        <div className="success-message">
          Booking confirmed! Your PNR is{" "}
          <strong>{location.state.newBooking.pnr}</strong>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {!bookings.length ? (
        <div className="empty-state">
          <Ticket size={45} />
          <h3>No bookings yet</h3>
          <p>Your booked journeys will appear here.</p>
        </div>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <article className="booking-card" key={booking._id}>
              <div className="booking-card-header">
                <div>
                  <span className="eyebrow">BOOKING PNR</span>
                  <h3>{booking.pnr}</h3>
                </div>

                <span
                  className={`status-pill ${
                    booking.status === "confirmed"
                      ? "status-confirmed"
                      : "status-cancelled"
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="booking-route">
                <div>
                  <span>FROM</span>
                  <strong>
                    {booking.journey?.originName || "Origin"}
                  </strong>
                </div>

                <div className="booking-route-arrow">→</div>

                <div>
                  <span>TO</span>
                  <strong>
                    {booking.journey?.destinationName || "Destination"}
                  </strong>
                </div>
              </div>

              <div className="booking-details">
                <span>
                  <CalendarDays size={16} />
                  {booking.journey?.departureAt
                    ? new Date(
                        booking.journey.departureAt
                      ).toLocaleString("en-IN")
                    : "Date unavailable"}
                </span>

                <span>
                  <Ticket size={16} />
                  {booking.passengers
                    ?.map((p) => p.seatNumber)
                    .join(", ")}
                </span>

                <span>
                  ₹{Number(booking.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="booking-card-footer">
                <div>
                  <span className="payment-label">Payment</span>
                  <strong>{booking.paymentStatus}</strong>

                  {booking.refund?.status === "processed" && (
                    <p className="refund-text">
                      Refund: ₹{booking.refund.amount} (
                      {booking.refund.percentage}%)
                    </p>
                  )}
                </div>

                {booking.status === "confirmed" && (
                  <div className="booking-actions">
                    {booking.paymentStatus === "pending" && (
                      <button
                        className="secondary-button"
                        disabled={actionLoading === booking.pnr}
                        onClick={() => simulatePayment(booking.pnr)}
                      >
                        <CreditCard size={16} />
                        {actionLoading === booking.pnr
                          ? "Processing..."
                          : "Simulate Payment"}
                      </button>
                    )}

                    <button
                      className="danger-button"
                      disabled={actionLoading === booking.pnr}
                      onClick={() => cancelBooking(booking.pnr)}
                    >
                      <XCircle size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}