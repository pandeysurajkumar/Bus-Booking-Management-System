
import mongoose from "mongoose";

const authSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false
    },

    expiresAt: {
      type: Date,
      required: true
    },

    revokedAt: {
      type: Date,
      default: null
    },

    replacedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthSession",
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Automatically clean up expired session records.
authSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const AuthSession = mongoose.model(
  "AuthSession",
  authSessionSchema
);

export default AuthSession;
