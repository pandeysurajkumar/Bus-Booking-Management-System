
import { ROLES } from "./roles.js";

export const PERMISSIONS = Object.freeze({
  TRIP_READ: "trip:read",
  BOOKING_CREATE: "booking:create",
  BOOKING_READ_OWN: "booking:read:own",
  BOOKING_CANCEL_OWN: "booking:cancel:own",

  BUS_MANAGE: "bus:manage",
  ROUTE_MANAGE: "route:manage",
  TRIP_MANAGE: "trip:manage",

  BOOKING_READ_ALL: "booking:read:all",
  USER_MANAGE: "user:manage",

  MANIFEST_READ: "manifest:read",
  TICKET_VERIFY: "ticket:verify",

  REPORT_READ_ALL: "report:read:all",
  REPORT_READ_OWN: "report:read:own"
});

export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.PASSENGER]: [
    PERMISSIONS.TRIP_READ,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_READ_OWN,
    PERMISSIONS.BOOKING_CANCEL_OWN
  ],

  [ROLES.ADMIN]: Object.values(PERMISSIONS),

  [ROLES.OPERATOR]: [
    PERMISSIONS.TRIP_READ,
    PERMISSIONS.BUS_MANAGE,
    PERMISSIONS.TRIP_MANAGE,
    PERMISSIONS.MANIFEST_READ,
    PERMISSIONS.REPORT_READ_OWN
  ],

  [ROLES.STAFF]: [
    PERMISSIONS.TRIP_READ,
    PERMISSIONS.MANIFEST_READ,
    PERMISSIONS.TICKET_VERIFY
  ]
});
