import mongoose from "mongoose";

const operatorSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
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

operatorSchema.index({ companyName: 1 });

const Operator = mongoose.model("Operator", operatorSchema);

export default Operator;