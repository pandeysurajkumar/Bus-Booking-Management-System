import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },

    row: {
      type: Number,
      required: true,
      min: 1,
    },

    column: {
      type: Number,
      required: true,
      min: 1,
    },

    deck: {
      type: Number,
      default: 1,
      min: 1,
      max: 2,
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const seatLayoutSchema = new mongoose.Schema(
  {
    rows: {
      type: Number,
      required: true,
      min: 1,
      max: 30,
    },

    columns: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    deckCount: {
      type: Number,
      default: 1,
      min: 1,
      max: 2,
    },

    seats: {
      type: [seatSchema],
      required: true,
      validate: {
        validator(seats) {
          if (!seats || seats.length === 0) return false;

          const numbers = seats.map((seat) =>
            seat.seatNumber.trim().toUpperCase()
          );

          return new Set(numbers).size === numbers.length;
        },
        message: "Seat numbers must be unique within a bus.",
      },
    },
  },
  { _id: false }
);

const busSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
      required: true,
      index: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    busName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    busType: {
      type: String,
      enum: ["seater", "sleeper", "semi_sleeper"],
      required: true,
    },

    amenities: {
      type: [String],
      default: [],
      enum: [
        "wifi",
        "charging_point",
        "water_bottle",
        "blanket",
        "reading_light",
        "air_conditioning",
        "entertainment",
      ],
    },

    seatLayout: {
      type: seatLayoutSchema,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    scheduleLockToken: {
      type: String,
      default: null,
    },

    scheduleLockUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

busSchema.index({ operatorId: 1, status: 1 });
busSchema.index({ busName: 1 });

const Bus = mongoose.model("Bus", busSchema);

export default Bus;