import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
      required: true,
      index: true,
    },

    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },

    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },

    departureAt: {
      type: Date,
      required: true,
    },

    arrivalAt: {
      type: Date,
      required: true,
    },

    fare: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["INR"],
    },

    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "boarding",
        "departed",
        "completed",
        "cancelled",
      ],
      default: "scheduled",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

tripSchema.index({ routeId: 1, departureAt: 1 });
tripSchema.index({ busId: 1, departureAt: 1 });
tripSchema.index({ operatorId: 1, status: 1, departureAt: 1 });

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;