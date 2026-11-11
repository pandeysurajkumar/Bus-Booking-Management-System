import { useEffect, useState } from "react";
import { CalendarPlus, RefreshCw } from "lucide-react";

import api from "../../api/client";

const initialForm = {
  routeId: "",
  busId: "",
  departureAt: "",
  arrivalAt: "",
  fare: "",
};

export default function ManageTrips() {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    setLoading(true);

    try {
      const [tripResponse, routeResponse, busResponse] =
        await Promise.all([
          api.get("/trips", {
            params: { page: 1, limit: 100 },
          }),
          api.get("/routes", {
            params: { page: 1, limit: 100 },
          }),
          api.get("/buses", {
            params: { page: 1, limit: 100, status: "active" },
          }),
        ]);

      const tripData = tripResponse.data.data;
      const routeData = routeResponse.data.data;
      const busData = busResponse.data.data;

      setTrips(
        Array.isArray(tripData) ? tripData : tripData?.trips || []
      );

      setRoutes(
        Array.isArray(routeData) ? routeData : routeData?.routes || []
      );

      setBuses(
        (Array.isArray(busData) ? busData : busData?.buses || [])
          .filter((bus) => bus.status === "active")
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load trip management data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const createTrip = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      new Date(form.arrivalAt) <= new Date(form.departureAt)
    ) {
      setError("Arrival must be later than departure");
      return;
    }

    setSaving(true);

    try {
      await api.post("/trips", {
        routeId: form.routeId,
        busId: form.busId,
        departureAt: new Date(form.departureAt).toISOString(),
        arrivalAt: new Date(form.arrivalAt).toISOString(),
        fare: Number(form.fare),
        currency: "INR",
      });

      setSuccess("Trip created successfully");
      setForm(initialForm);
      setShowForm(false);

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create trip"
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelTrip = async (tripId) => {
    if (!window.confirm("Cancel this trip schedule?")) return;

    setError("");
    setSuccess("");

    try {
      await api.patch(`/trips/${tripId}/cancel`);
      setSuccess("Trip cancelled successfully");
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to cancel trip"
      );
    }
  };

  const updateTripStatus = async (tripId, status) => {
    setError("");
    setSuccess("");

    try {
      await api.patch(`/trips/${tripId}/status`, { status });
      setSuccess("Trip status updated");
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update trip status"
      );
    }
  };

  return (
    <div className="operator-page">
      <div className="operator-page-heading">
        <div>
          <span className="operator-eyebrow">SCHEDULE MANAGEMENT</span>
          <h1>Trip Schedules</h1>
          <p>Create and manage your scheduled bus trips.</p>
        </div>

        <button
          className="operator-primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          <CalendarPlus size={17} />
          Create Trip
        </button>
      </div>

      {error && <div className="operator-error">{error}</div>}
      {success && <div className="operator-success">{success}</div>}

      {showForm && (
        <form className="operator-form-card" onSubmit={createTrip}>
          <h2>Create New Trip</h2>

          <div className="operator-form-grid">
            <div className="operator-field">
              <label>Route</label>
              <select
                name="routeId"
                value={form.routeId}
                onChange={handleChange}
                required
              >
                <option value="">Select route</option>

                {routes.map((route) => (
                  <option key={route._id} value={route._id}>
                    {route.routeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="operator-field">
              <label>Bus</label>
              <select
                name="busId"
                value={form.busId}
                onChange={handleChange}
                required
              >
                <option value="">Select bus</option>

                {buses.map((bus) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.registrationNumber} - {bus.busName}
                  </option>
                ))}
              </select>
            </div>

            <div className="operator-field">
              <label>Departure</label>
              <input
                type="datetime-local"
                name="departureAt"
                value={form.departureAt}
                onChange={handleChange}
                required
              />
            </div>

            <div className="operator-field">
              <label>Arrival</label>
              <input
                type="datetime-local"
                name="arrivalAt"
                value={form.arrivalAt}
                onChange={handleChange}
                required
              />
            </div>

            <div className="operator-field">
              <label>Fare per passenger (INR)</label>
              <input
                type="number"
                name="fare"
                min="1"
                step="0.01"
                value={form.fare}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="operator-form-actions">
            <button
              type="button"
              className="operator-secondary-button"
              onClick={() => setShowForm(false)}
            >
              Close
            </button>

            <button
              type="submit"
              className="operator-primary-button"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>
      )}

      <div className="operator-section-heading">
        <div>
          <h2>All Trips</h2>
          <p>{trips.length} schedules loaded</p>
        </div>

        <button className="operator-refresh" onClick={fetchData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="operator-loading">Loading trips...</div>
      ) : (
        <div className="operator-table-wrapper">
          <table className="operator-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Bus</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Fare</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {trips.map((trip) => (
                <tr key={trip._id}>
                  <td>{trip.routeId?.routeName || "Route"}</td>
                  <td>
                    {trip.busId?.registrationNumber || "Bus"}
                  </td>
                  <td>
                    {new Date(trip.departureAt).toLocaleString("en-IN")}
                  </td>
                  <td>
                    {new Date(trip.arrivalAt).toLocaleString("en-IN")}
                  </td>
                  <td>₹{trip.fare}</td>
                  <td>
                    <span className={`operator-status ${trip.status}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td>
                    <div className="operator-table-actions">
                      {trip.status === "scheduled" && (
                        <>
                          <button
                            className="operator-small-action"
                            onClick={() =>
                              updateTripStatus(trip._id, "boarding")
                            }
                          >
                            Boarding
                          </button>

                          <button
                            className="operator-danger-text"
                            onClick={() => cancelTrip(trip._id)}
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {trip.status === "boarding" && (
                        <button
                          className="operator-small-action"
                          onClick={() =>
                            updateTripStatus(trip._id, "departed")
                          }
                        >
                          Depart
                        </button>
                      )}

                      {trip.status === "departed" && (
                        <button
                          className="operator-small-action"
                          onClick={() =>
                            updateTripStatus(trip._id, "completed")
                          }
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {!trips.length && (
                <tr>
                  <td colSpan="7" className="operator-empty-cell">
                    No trip schedules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}