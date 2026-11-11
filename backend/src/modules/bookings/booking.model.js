import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    fare: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const refundSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["not_applicable", "processed"],
      default: "not_applicable",
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    reference: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },

    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
      required: true,
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

    journey: {
      originName: { type: String, required: true },
      destinationName: { type: String, required: true },
      departureAt: { type: Date, required: true },
      arrivalAt: { type: Date, required: true },
    },

    passengers: {
      type: [passengerSchema],
      required: true,
      validate: {
        validator(passengers) {
          if (!passengers?.length) return false;

          const numbers = passengers.map((p) =>
            p.seatNumber.toUpperCase()
          );

          return new Set(numbers).size === numbers.length;
        },
        message: "Duplicate passenger seat numbers are not allowed.",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["INR"],
    },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
    },

    idempotencyKey: {
      type: String,
      default: undefined,
    },

    bookedAt: {
      type: Date,
      default: Date.now,
    },
    refund: {
        type: refundSchema,
        default: () => ({
            status: "not_applicable",
            amount: 0,
            percentage: 0,
        }),
        },

        cancelledAt: {
        type: Date,
        default: null,
        },
  },
  { timestamps: true }
);

bookingSchema.index(
  { userId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $type: "string" },
    },
  }
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ tripId: 1, status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;