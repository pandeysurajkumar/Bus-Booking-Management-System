import { createAuditLog } from "./audit.service.js";

export const auditAction = ({
  action,
  entityType,
  description = "",
  getEntityId = null,
  getMetadata = null,
}) => {
  return (req, res, next) => {
    res.once("finish", () => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return;
      }

      const entityId = getEntityId
        ? getEntityId(req, res)
        : req.params.id || req.params.tripId || req.params.pnr || null;

      const metadata = getMetadata
        ? getMetadata(req, res)
        : {};

      createAuditLog({
        actorId: req.user?._id || null,
        actorRole: req.user?.role || "system",
        operatorId: req.user?.operatorId || null,
        action,
        entityType,
        entityId,
        description,
        metadata,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "success",
      }).catch((error) => {
        console.error("Audit log creation failed:", error.message);
      });
    });

    next();
  };
};