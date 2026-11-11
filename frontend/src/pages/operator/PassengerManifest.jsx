import { useEffect, useState } from "react";
import { Users, Download, Search } from "lucide-react";

import api from "../../api/client";

export default function PassengerManifest() {
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState("");
  const [manifest, setManifest] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/trips", {
      params: { page: 1, limit: 100 },
    })
      .then((response) => {
        const data = response.data.data;
        setTrips(
          Array.isArray(data) ? data : data?.trips || []
        );
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Unable to load trips"
        );
      });
  }, []);

  const fetchManifest = async (selectedTripId = tripId) => {
    if (!selectedTripId) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/reports/trips/${selectedTripId}/manifest`,
        {
          params: {
            page: 1,
            limit: 100,
            search: search || undefined,
          },
        }
      );

      setManifest(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load passenger manifest"
      );
      setManifest(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!manifest?.passengers?.length) return;

    const headers = [
      "PNR",
      "Passenger Name",
      "Age",
      "Gender",
      "Seat",
      "Fare",
      "Payment Status",
      "Email",
      "Phone",
    ];

    const rows = manifest.passengers.map((p) => [
      p.pnr,
      p.passengerName,
      p.age,
      p.gender,
      p.seatNumber,
      p.fare,
      p.paymentStatus,
      p.contactEmail,
      p.contactPhone,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `manifest-${tripId}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="operator-page">
      <div className="operator-page-heading">
        <div>
          <span className="operator-eyebrow">PASSENGER MANAGEMENT</span>
          <h1>Passenger Manifest</h1>
          <p>View confirmed passengers and their seat assignments.</p>
        </div>

        <Users size={40} className="operator-heading-icon" />
      </div>

      {error && <div className="operator-error">{error}</div>}

      <section className="operator-filter-card">
        <div className="operator-field">
          <label>Select Trip</label>

          <select
            value={tripId}
            onChange={(e) => {
              setTripId(e.target.value);
              setManifest(null);
            }}
          >
            <option value="">Choose a trip</option>

            {trips.map((trip) => (
              <option key={trip._id} value={trip._id}>
                {trip.routeId?.routeName || "Route"} —{" "}
                {new Date(trip.departureAt).toLocaleString("en-IN")}
              </option>
            ))}
          </select>
        </div>

        <div className="operator-field">
          <label>Search passenger</label>

          <div className="operator-search-input">
            <Search size={17} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, PNR or seat"
            />
          </div>
        </div>

        <button
          className="operator-primary-button"
          disabled={!tripId || loading}
          onClick={() => fetchManifest()}
        >
          {loading ? "Loading..." : "View Manifest"}
        </button>
      </section>

      {manifest && (
        <>
          <div className="operator-stat-grid">
            <article className="operator-stat-card">
              <span>Total Seats</span>
              <strong>{manifest.occupancy.totalSeats}</strong>
            </article>

            <article className="operator-stat-card">
              <span>Booked Seats</span>
              <strong>{manifest.occupancy.bookedSeats}</strong>
            </article>

            <article className="operator-stat-card">
              <span>Available Seats</span>
              <strong>{manifest.occupancy.availableSeats}</strong>
            </article>

            <article className="operator-stat-card">
              <span>Occupancy</span>
              <strong>{manifest.occupancy.percentage}%</strong>
            </article>
          </div>

          <div className="operator-section-heading">
            <div>
              <h2>Confirmed Passengers</h2>
              <p>{manifest.pagination.total} passenger records</p>
            </div>

            <button
              className="operator-secondary-button"
              onClick={downloadCSV}
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>

          <div className="operator-table-wrapper">
            <table className="operator-table">
              <thead>
                <tr>
                  <th>PNR</th>
                  <th>Passenger</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Seat</th>
                  <th>Fare</th>
                  <th>Payment</th>
                </tr>
              </thead>

              <tbody>
                {manifest.passengers.map((passenger, index) => (
                  <tr key={`${passenger.pnr}-${passenger.seatNumber}-${index}`}>
                    <td>{passenger.pnr}</td>
                    <td>{passenger.passengerName}</td>
                    <td>{passenger.age}</td>
                    <td>{passenger.gender}</td>
                    <td>{passenger.seatNumber}</td>
                    <td>₹{passenger.fare}</td>
                    <td>{passenger.paymentStatus}</td>
                  </tr>
                ))}

                {!manifest.passengers.length && (
                  <tr>
                    <td colSpan="7" className="operator-empty-cell">
                      No passengers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}