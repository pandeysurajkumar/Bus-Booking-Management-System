import AuditLog from "./audit.model.js";
import ApiError from "../../utils/ApiError.js";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "accesstoken",
  "refreshtoken",
  "token",
  "authorization",
  "cookie",
  "secret",
  "apikey",
  "otp",
  "cardnumber",
  "cvv",
]);

const sanitize = (value, depth = 0) => {
  if (depth > 5) return "[MAX_DEPTH]";

  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 30).map((item) => sanitize(item, depth + 1));
  }

  if (typeof value === "object") {
    if (value instanceof Date) return value.toISOString();

    const result = {};

    for (const [key, item] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = sanitize(item, depth + 1);
      }
    }

    return result;
  }

  if (typeof value === "string") {
    return value.slice(0, 500);
  }

  return value;
};

export const createAuditLog = async ({
  actorId = null,
  actorRole = "system",
  operatorId = null,
  action,
  entityType,
  entityId = null,
  description = "",
  metadata = {},
  ipAddress = null,
  userAgent = null,
  status = "success",
}) => {
  return AuditLog.create({
    actorId,
    actorRole,
    operatorId,
    action,
    entityType,
    entityId: entityId ? String(entityId) : null,
    description,
    metadata: sanitize(metadata),
    ipAddress,
    userAgent,
    status,
  });
};

export const getAuditLogs = async (user, query) => {
  const filter = {};

  if (user.role === "operator") {
    if (!user.operatorId) {
      throw new ApiError(403, "Operator account is not linked");
    }

    filter.operatorId = user.operatorId;
  } else if (user.role === "admin" && query.operatorId) {
    filter.operatorId = query.operatorId;
  }

  if (query.action) filter.action = query.action;
  if (query.entityType) filter.entityType = query.entityType;
  if (query.actorId) filter.actorId = query.actorId;
  if (query.status) filter.status = query.status;

  if (query.startDate || query.endDate) {
    filter.createdAt = {};

    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }

  const page = query.page || 1;
  const limit = query.limit || 20;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("actorId", "name email role")
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};