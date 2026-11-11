import mongoose from "mongoose";

const routeStopSchema = new mongoose.Schema(
  {
    stopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },

    sequence: {
      type: Number,
      required: true,
      min: 1,
    },

    distanceFromStartKm: {
      type: Number,
      required: true,
      min: 0,
    },

    arrivalOffsetMinutes: {
      type: Number,
      min: 0,
    },

    departureOffsetMinutes: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
      required: true,
      index: true,
    },

    routeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    originStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },

    destinationStopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      required: true,
    },

    stops: {
      type: [routeStopSchema],
      required: true,
      validate: {
        validator(stops) {
          if (!stops || stops.length < 2) return false;

          const sequences = stops.map((stop) => stop.sequence);
          const stopIds = stops.map((stop) => stop.stopId.toString());

          return (
            new Set(sequences).size === sequences.length &&
            new Set(stopIds).size === stopIds.length
          );
        },
        message: "Route must have unique stops and sequence numbers.",
      },
    },

    totalDistanceKm: {
      type: Number,
      required: true,
      min: 1,
    },

    estimatedDurationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

routeSchema.index({ operatorId: 1, status: 1 });
routeSchema.index({ originStopId: 1, destinationStopId: 1 });

const Route = mongoose.model("Route", routeSchema);

export default Route;