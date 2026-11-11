import { useEffect, useState } from "react";
import { Bus, Plus, RefreshCw } from "lucide-react";

import api from "../../api/client";

const AMENITY_OPTIONS = [
  { label: "AC", value: "air_conditioning" },
  { label: "WiFi", value: "wifi" },
  { label: "Charging", value: "charging_point" },
  { label: "Water Bottle", value: "water_bottle" },
  { label: "Blanket", value: "blanket" },
];

const seatPosition = (column, columns) => {
  if (column === 1 || column === Number(columns)) return "window";
  if (Number(columns) >= 4 && (column === 2 || column === Number(columns) - 1)) {
    return "aisle";
  }
  return "middle";
};

const initialForm = {
  registrationNumber: "",
  busName: "",
  busType: "seater",
  rows: 10,
  columns: 4,
  deckCount: 1,
  amenities: [],
};

export default function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBuses = async () => {
    setLoading(true);

    try {
      const response = await api.get("/buses", {
        params: { page: 1, limit: 100 },
      });

      const data = response.data.data;

      setBuses(
        Array.isArray(data) ? data : data?.buses || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load buses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAmenity = (amenity) => {
    setForm((previous) => ({
      ...previous,
      amenities: previous.amenities.includes(amenity)
        ? previous.amenities.filter((item) => item !== amenity)
        : [...previous.amenities, amenity],
    }));
  };

  const createBus = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const rows = Number(form.rows);
    const columns = Number(form.columns);

    if (rows < 1 || columns < 1 || rows * columns > 100) {
      setError("Seat layout must contain between 1 and 100 positions");
      return;
    }

    const seats = [];

    for (let row = 1; row <= rows; row++) {
      for (let column = 1; column <= columns; column++) {
        const seatNumber = `R${row}C${column}`;

        seats.push({
          seatNumber,
          row,
          column,
          deck: 1,
          seatType: form.busType === "sleeper" ? "sleeper" : "seater",
          position: seatPosition(column, columns),
          isActive: true,
        });
      }
    }

    const payload = {
      registrationNumber: form.registrationNumber.trim().toUpperCase(),
      busName: form.busName.trim(),
      busType: form.busType,
      amenities: form.amenities,
      seatLayout: {
        rows,
        columns,
        deckCount: Number(form.deckCount),
        seats,
      },
    };

    setSaving(true);

    try {
      await api.post("/buses", payload);

      setSuccess("Bus registered successfully");
      setForm(initialForm);
      setShowForm(false);

      await fetchBuses();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to register bus"
      );
    } finally {
      setSaving(false);
    }
  };

  const archiveBus = async (busId) => {
    if (!window.confirm("Are you sure you want to archive this bus?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`/buses/${busId}`);
      setSuccess("Bus archived successfully");
      await fetchBuses();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to archive bus"
      );
    }
  };

  return (
    <div className="operator-page">
      <div className="operator-page-heading">
        <div>
          <span className="operator-eyebrow">FLEET MANAGEMENT</span>
          <h1>Manage Buses</h1>
          <p>Register and manage your bus fleet.</p>
        </div>

        <button
          className="operator-primary-button"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={17} />
          Add New Bus
        </button>
      </div>

      {error && <div className="operator-error">{error}</div>}
      {success && <div className="operator-success">{success}</div>}

      {showForm && (
        <form className="operator-form-card" onSubmit={createBus}>
          <h2>Register New Bus</h2>

          <div className="operator-form-grid">
            <div className="operator-field">
              <label>Registration Number</label>
              <input
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={handleChange}
                placeholder="PB10AB1234"
                required
              />
            </div>

            <div className="operator-field">
              <label>Bus Name</label>
              <input
                name="busName"
                value={form.busName}
                onChange={handleChange}
                placeholder="Volvo Express"
                required
              />
            </div>

            <div className="operator-field">
              <label>Bus Type</label>
              <select
                name="busType"
                value={form.busType}
                onChange={handleChange}
              >
                <option value="seater">Seater</option>
                <option value="sleeper">Sleeper</option>
                <option value="semi_sleeper">Semi Sleeper</option>
              </select>
            </div>

            <div className="operator-field">
              <label>Rows</label>
              <input
                type="number"
                name="rows"
                min="1"
                max="25"
                value={form.rows}
                onChange={handleChange}
                required
              />
            </div>

            <div className="operator-field">
              <label>Columns</label>
              <input
                type="number"
                name="columns"
                min="1"
                max="4"
                value={form.columns}
                onChange={handleChange}
                required
              />
            </div>

            <div className="operator-field">
              <label>Deck Count</label>
              <select
                name="deckCount"
                value={form.deckCount}
                onChange={handleChange}
              >
                <option value="1">Single Deck</option>
                <option value="2">Double Deck</option>
              </select>
            </div>
          </div>

          <div className="operator-field">
            <label>Amenities</label>

            <div className="amenity-options">
              {AMENITY_OPTIONS.map((amenity) => (
                  <label key={amenity.value}>
                    <input
                      type="checkbox"
                      checked={form.amenities.includes(amenity.value)}
                      onChange={() => handleAmenity(amenity.value)}
                    />
                    {amenity.label}
                  </label>
                ))}
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
              className="operator-primary-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Register Bus"}
            </button>
          </div>
        </form>
      )}

      <div className="operator-section-heading">
        <div>
          <h2>Your Fleet</h2>
          <p>{buses.length} buses loaded</p>
        </div>

        <button className="operator-refresh" onClick={fetchBuses}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="operator-loading">Loading buses...</div>
      ) : (
        <div className="operator-table-wrapper">
          <table className="operator-table">
            <thead>
              <tr>
                <th>Bus</th>
                <th>Registration</th>
                <th>Type</th>
                <th>Seats</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {buses.map((bus) => (
                <tr key={bus._id}>
                  <td>
                    <strong>{bus.busName}</strong>
                  </td>
                  <td>{bus.registrationNumber}</td>
                  <td>{bus.busType}</td>
                  <td>{bus.seatLayout?.seats?.length || 0}</td>
                  <td>
                    <span className={`operator-status ${bus.status}`}>
                      {bus.status}
                    </span>
                  </td>
                  <td>
                    {bus.status !== "archived" && (
                      <button
                        className="operator-danger-text"
                        onClick={() => archiveBus(bus._id)}
                      >
                        Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {!buses.length && (
                <tr>
                  <td colSpan="6" className="operator-empty-cell">
                    <Bus size={25} />
                    No buses registered yet.
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