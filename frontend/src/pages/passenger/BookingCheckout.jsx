import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, TicketCheck } from "lucide-react";

import api from "../../api/client";
import "../../styles/passenger.css";

export default function BookingCheckout() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    tripId,
    trip,
    originStopId,
    destinationStopId,
    selectedSeats = [],
  } = location.state || {};

  const [passengers, setPassengers] = useState(
    selectedSeats.map((seatNumber) => ({
      seatNumber,
      name: "",
      age: "",
      gender: "male",
    }))
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (
    !tripId ||
    !originStopId ||
    !destinationStopId ||
    !selectedSeats.length
  ) {
    return (
      <div className="passenger-container">
        <div className="empty-state">
          <h2>Booking session unavailable</h2>
          <button
            className="primary-button"
            onClick={() => navigate("/passenger/search")}
          >
            Search buses
          </button>
        </div>
      </div>
    );
  }

  const updatePassenger = (index, field, value) => {
    setPassengers((previous) =>
      previous.map((passenger, i) =>
        i === index
          ? { ...passenger, [field]: value }
          : passenger
      )
    );
  };

  const confirmBooking = async (e) => {
    e.preventDefault();
    setError("");

    if (
      passengers.some(
        (p) =>
          !p.name.trim() ||
          !p.age ||
          Number(p.age) < 1 ||
          Number(p.age) > 120
      )
    ) {
      setError("Enter valid passenger names and ages");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/bookings", {
        tripId,
        originStopId,
        destinationStopId,
        idempotencyKey: crypto.randomUUID(),
        passengers: passengers.map((p) => ({
          seatNumber: p.seatNumber,
          name: p.name.trim(),
          age: Number(p.age),
          gender: p.gender,
        })),
      });

      const booking = response.data.data;

      navigate("/passenger/bookings", {
        state: {
          newBooking: booking,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Booking failed. Your seat hold may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalAmount =
    Number(trip?.fare || 0) * passengers.length;

  return (
    <div className="passenger-container">
      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={17} /> Back to seats
      </button>

      <div className="section-heading">
        <div>
          <span className="eyebrow">FINAL STEP</span>
          <h1>Passenger details</h1>
          <p>Enter the details of everyone travelling.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={confirmBooking}>
          {passengers.map((passenger, index) => (
            <section className="passenger-form-card" key={passenger.seatNumber}>
              <div className="passenger-form-heading">
                <h3>Passenger {index + 1}</h3>
                <span>Seat {passenger.seatNumber}</span>
              </div>

              <div className="form-group">
                <label>Full name</label>
                <input
                  type="text"
                  value={passenger.name}
                  onChange={(e) =>
                    updatePassenger(index, "name", e.target.value)
                  }
                  placeholder="Enter passenger name"
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-two-columns">
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={passenger.age}
                    onChange={(e) =>
                      updatePassenger(index, "age", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={passenger.gender}
                    onChange={(e) =>
                      updatePassenger(index, "gender", e.target.value)
                    }
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </section>
          ))}

          <button
            type="submit"
            className="primary-button full-width"
            disabled={loading}
          >
            <TicketCheck size={18} />
            {loading ? "Confirming..." : "Confirm Booking"}
          </button>
        </form>

        <aside className="fare-summary">
          <h3>Fare summary</h3>

          <div className="fare-row">
            <span>Selected seats</span>
            <strong>{selectedSeats.length}</strong>
          </div>

          <div className="fare-row">
            <span>Fare per seat</span>
            <strong>₹{Number(trip?.fare || 0).toLocaleString("en-IN")}</strong>
          </div>

          <div className="fare-total">
            <span>Total amount</span>
            <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
          </div>

          <p className="fare-note">
            Payment is simulated in this application. No real payment
            will be collected.
          </p>
        </aside>
      </div>
    </div>
  );
}