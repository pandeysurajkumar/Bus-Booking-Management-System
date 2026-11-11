import mongoose from "mongoose";

const auditSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    actorRole: {
      type: String,
      enum: ["passenger", "admin", "operator", "staff", "system"],
      default: "system",
    },

    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
      default: null,
    },

    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    entityType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    entityId: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },
  },
  {
    timestamps: true,
  }
);

auditSchema.index({ actorId: 1, createdAt: -1 });
auditSchema.index({ operatorId: 1, createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });
auditSchema.index({ entityType: 1, entityId: 1 });
auditSchema.index({ createdAt: -1 });

export default mongoose.model("AuditLog", auditSchema);