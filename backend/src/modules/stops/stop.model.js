import mongoose from "mongoose";

const stopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    address: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    location: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
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

stopSchema.index({ city: 1, status: 1 });
stopSchema.index({ name: 1, city: 1 });

const Stop = mongoose.model("Stop", stopSchema);

export default Stop;