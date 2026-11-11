import mongoose from "mongoose";

const cancellationRuleSchema = new mongoose.Schema(
  {
    minHoursBeforeDeparture: {
      type: Number,
      required: true,
      min: 0,
    },
    refundPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const cancellationPolicySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
      immutable: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    rules: {
      type: [cancellationRuleSchema],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "CancellationPolicy",
  cancellationPolicySchema
);