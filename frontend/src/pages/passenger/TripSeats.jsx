import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Armchair, ArrowLeft, CheckCircle } from "lucide-react";

import api from "../../api/client";
import "../../styles/passenger.css";

export default function TripSeats() {
  const { tripId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const trip = location.state?.trip;
  const originStopId = location.state?.originStopId;
  const destinationStopId = location.state?.destinationStopId;

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busySeat, setBusySeat] = useState("");
  const [error, setError] = useState("");

  const fetchSeats = async () => {
    try {
      const response = await api.get(`/seats/${tripId}`);
      const data = response.data.data;

      setSeats(Array.isArray(data) ? data : data?.seats || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load seats"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [tripId]);

  const toggleSeat = async (seat) => {
    if (seat.status === "booked" || seat.status === "held") return;

    setError("");
    setBusySeat(seat.seatNumber);

    try {
      if (selectedSeats.includes(seat.seatNumber)) {
        await api.post(`/seats/${tripId}/release`, {
          seatNumber: seat.seatNumber,
        });

        setSelectedSeats((previous) =>
          previous.filter((number) => number !== seat.seatNumber)
        );
      } else {
        if (selectedSeats.length >= 6) {
          setError("You can select a maximum of 6 seats");
          return;
        }

        await api.post(`/seats/${tripId}/hold`, {
          seatNumber: seat.seatNumber,
        });

        setSelectedSeats((previous) => [
          ...previous,
          seat.seatNumber,
        ]);
      }

      await fetchSeats();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Seat operation failed. Refresh and try again."
      );
      await fetchSeats();
    } finally {
      setBusySeat("");
    }
  };

  const continueBooking = () => {
    if (!selectedSeats.length) {
      setError("Please select at least one seat");
      return;
    }

    navigate("/passenger/checkout", {
      state: {
        tripId,
        trip,
        originStopId,
        destinationStopId,
        selectedSeats,
      },
    });
  };

  if (loading) {
    return <div className="loading-state">Loading seat layout...</div>;
  }

  return (
    <div className="passenger-container">
      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={17} /> Back to trips
      </button>

      <div className="section-heading">
        <div>
          <span className="eyebrow">CHOOSE YOUR SEATS</span>
          <h1>Select your seats</h1>
          <p>Choose up to six seats for your journey.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="seat-layout-wrapper">
        <div className="seat-legend">
          <span><i className="seat-dot available" /> Available</span>
          <span><i className="seat-dot selected" /> Selected</span>
          <span><i className="seat-dot occupied" /> Booked / Held</span>
        </div>

        <div className="bus-seat-layout">
          <div className="driver-section">
            <span>FRONT</span>
            <Armchair size={25} />
          </div>

          <div className="seat-grid">
            {seats.map((seat) => {
              const isSelected = selectedSeats.includes(
                seat.seatNumber
              );

              const isUnavailable =
                seat.status === "booked" ||
                seat.status === "held";

              return (
                <button
                  key={seat._id || seat.seatNumber}
                  disabled={
                    isUnavailable ||
                    busySeat === seat.seatNumber
                  }
                  className={[
                    "seat-button",
                    isSelected ? "seat-selected" : "",
                    isUnavailable ? "seat-unavailable" : "",
                  ].join(" ")}
                  onClick={() => toggleSeat(seat)}
                  title={`${seat.seatNumber} - ${seat.status}`}
                >
                  <Armchair size={20} />
                  <span>{seat.seatNumber}</span>
                  {isSelected && <CheckCircle size={13} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="seat-selection-summary">
        <div>
          <strong>{selectedSeats.length} seats selected</strong>
          <p>
            {selectedSeats.length
              ? selectedSeats.join(", ")
              : "No seats selected"}
          </p>
        </div>

        <button
          className="primary-button"
          disabled={!selectedSeats.length}
          onClick={continueBooking}
        >
          Continue to passenger details
        </button>
      </div>
    </div>
  );
}