import { useEffect, useState } from "react";
import { ChartColumn, IndianRupee, Ticket, Bus } from "lucide-react";

import api from "../../api/client";

export default function OperatorReports() {
  const [summary, setSummary] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [summaryResponse, tripResponse] = await Promise.all([
          api.get("/reports/dashboard"),
          api.get("/reports/trips", {
            params: { page: 1, limit: 100 },
          }),
        ]);

        setSummary(summaryResponse.data.data);
        setTrips(
          tripResponse.data.data?.trips || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to fetch reports"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div className="operator-loading">Loading reports...</div>;
  }

  const stats = [
    {
      label: "Total Trips",
      value: summary?.trips?.total || 0,
      icon: Bus,
    },
    {
      label: "Confirmed Bookings",
      value: summary?.bookings?.confirmed || 0,
      icon: Ticket,
    },
    {
      label: "Paid Revenue",
      value: `₹${Number(
        summary?.revenue?.total || 0
      ).toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
  ];

  const averageOccupancy = trips.length
    ? (
        trips.reduce(
          (sum, trip) => sum + trip.occupancyPercentage,
          0
        ) / trips.length
      ).toFixed(2)
    : "0.00";

  return (
    <div className="operator-page">
      <div className="operator-page-heading">
        <div>
          <span className="operator-eyebrow">BUSINESS ANALYTICS</span>
          <h1>Reports & Analytics</h1>
          <p>Understand your bookings, occupancy and revenue.</p>
        </div>

        <ChartColumn size={42} className="operator-heading-icon" />
      </div>

      {error && <div className="operator-error">{error}</div>}

      <div className="operator-stat-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <article className="operator-stat-card" key={label}>
            <div className="operator-stat-icon blue">
              <Icon size={22} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="operator-report-card">
        <div className="operator-section-heading">
          <div>
            <h2>Trip Occupancy</h2>
            <p>Percentage of booked seats for each trip.</p>
          </div>
        </div>

        <div className="operator-average">
          <span>Average occupancy</span>
          <strong>{averageOccupancy}%</strong>
        </div>

        <div className="operator-occupancy-list">
          {trips.map((trip) => (
            <div className="operator-occupancy-item" key={trip.tripId}>
              <div className="operator-occupancy-label">
                <strong>
                  {trip.route?.routeName || "Trip"}
                </strong>
                <span>{trip.occupancyPercentage}%</span>
              </div>

              <div className="occupancy-track large">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      trip.occupancyPercentage
                    )}%`,
                  }}
                />
              </div>

              <small>
                {trip.bookedSeats} booked / {trip.totalSeats} seats
              </small>
            </div>
          ))}

          {!trips.length && (
            <div className="operator-empty-cell">
              No trip occupancy data available.
            </div>
          )}
        </div>
      </div>

      <div className="operator-report-card">
        <h2>Booking Summary</h2>

        <div className="operator-summary-rows">
          <div>
            <span>Total bookings</span>
            <strong>{summary?.bookings?.total || 0}</strong>
          </div>

          <div>
            <span>Confirmed bookings</span>
            <strong>{summary?.bookings?.confirmed || 0}</strong>
          </div>

          <div>
            <span>Cancelled bookings</span>
            <strong>{summary?.bookings?.cancelled || 0}</strong>
          </div>

          <div>
            <span>Completed trips</span>
            <strong>{summary?.trips?.completed || 0}</strong>
          </div>

          <div>
            <span>Cancelled trips</span>
            <strong>{summary?.trips?.cancelled || 0}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}