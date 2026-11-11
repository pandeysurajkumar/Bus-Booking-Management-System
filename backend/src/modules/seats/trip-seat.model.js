import mongoose from "mongoose";

const tripSeatSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },

    seatNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    seatType: {
      type: String,
      enum: ["seater", "sleeper"],
      required: true,
    },

    position: {
      type: String,
      enum: ["window", "aisle", "middle"],
      required: true,
    },

    row: {
      type: Number,
      required: true,
    },

    column: {
      type: Number,
      required: true,
    },

    deck: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["available", "held", "booked"],
      default: "available",
    },

    heldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    holdUntil: {
      type: Date,
      default: null,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { timestamps: true }
);

tripSeatSchema.index(
  { tripId: 1, seatNumber: 1 },
  { unique: true }
);

tripSeatSchema.index({ tripId: 1, status: 1 });

const TripSeat = mongoose.model("TripSeat", tripSeatSchema);

export default TripSeat;