import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, CalendarDays, Clock, Armchair } from "lucide-react";
import api from "../../api/client";
import "../../styles/passenger.css";

export default function SearchTrips() {
  const navigate = useNavigate();

  const [stops, setStops] = useState([]);
  const [trips, setTrips] = useState([]);

  const [form, setForm] = useState({
    originStopId: "",
    destinationStopId: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const response = await api.get("/stops");
        setStops(response.data.data?.stops || response.data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load stops"
        );
      }
    };

    fetchStops();
  }, []);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const searchTrips = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.originStopId ||
      !form.destinationStopId ||
      !form.date
    ) {
      setError("Please select origin, destination and travel date");
      return;
    }

    if (form.originStopId === form.destinationStopId) {
      setError("Origin and destination must be different");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await api.get("/search/trips", {
        params: form,
      });

      const result = response.data.data;

      setTrips(
        Array.isArray(result) ? result : result?.trips || []
      );
    } catch (err) {
      setTrips([]);
      setError(
        err.response?.data?.message || "Unable to search trips"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--";

  return (
    <div className="passenger-container">
      <section className="search-hero">
        <div>
          <span className="eyebrow">YOUR JOURNEY STARTS HERE</span>
          <h1>Where would you like to go?</h1>
          <p>Find your bus, choose your seat and book your journey.</p>
        </div>

        <Bus size={100} className="hero-bus-icon" />
      </section>

      <form className="search-panel" onSubmit={searchTrips}>
        <div className="search-field">
          <label>FROM</label>
          <MapPin size={18} />
          <select
            name="originStopId"
            value={form.originStopId}
            onChange={handleChange}
            required
          >
            <option value="">Select origin</option>
            {stops.map((stop) => (
              <option key={stop._id} value={stop._id}>
                {stop.name}, {stop.city}
              </option>
            ))}
          </select>
        </div>

        <div className="search-field">
          <label>TO</label>
          <MapPin size={18} />
          <select
            name="destinationStopId"
            value={form.destinationStopId}
            onChange={handleChange}
            required
          >
            <option value="">Select destination</option>
            {stops.map((stop) => (
              <option key={stop._id} value={stop._id}>
                {stop.name}, {stop.city}
              </option>
            ))}
          </select>
        </div>

        <div className="search-field">
          <label>JOURNEY DATE</label>
          <CalendarDays size={18} />
          <input
            type="date"
            name="date"
            min={new Date().toISOString().split("T")[0]}
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <button className="primary-button search-button" type="submit">
          <Search size={18} />
          Search Buses
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <section className="results-section">
        <div className="section-heading">
          <div>
            <h2>Available Buses</h2>
            <p>
              {searched
                ? `${trips.length} trips found`
                : "Search to discover available trips"}
            </p>
          </div>
        </div>

        {loading && <div className="loading-state">Searching buses...</div>}

        {!loading && searched && trips.length === 0 && !error && (
          <div className="empty-state">
            <Bus size={40} />
            <h3>No buses found</h3>
            <p>Try another date or different locations.</p>
          </div>
        )}

        <div className="trip-list">
          {trips.map((trip) => (
            <article className="trip-card" key={trip._id}>
              <div className="trip-card-top">
                <div>
                  <h3>
                    {trip.busId?.busName ||
                      trip.busId?.registrationNumber ||
                      "Passenger Bus"}
                  </h3>
                  <span className="bus-type">
                    {trip.busId?.busType || "Bus"}
                  </span>
                </div>

                <div className="trip-price">
                  <small>Starting from</small>
                  <strong>
                    ₹{Number(trip.fare || 0).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="trip-timing">
                <div>
                  <strong>{formatTime(trip.departureAt)}</strong>
                  <span>Departure</span>
                </div>

                <div className="trip-route-line">
                  <Clock size={17} />
                  <span>{trip.status}</span>
                </div>

                <div>
                  <strong>{formatTime(trip.arrivalAt)}</strong>
                  <span>Arrival</span>
                </div>
              </div>

              <div className="trip-card-bottom">
                <span>
                  <Armchair size={17} />
                  {trip.availableSeats ?? 0} seats available
                </span>

                <button
                  className="primary-button"
                  disabled={!trip.availableSeats}
                  onClick={() =>
                    navigate(`/passenger/trips/${trip._id}/seats`, {
                      state: {
                        originStopId: form.originStopId,
                        destinationStopId: form.destinationStopId,
                        trip,
                      },
                    })
                  }
                >
                  Select Seats
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}