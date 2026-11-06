
import { describe, it, expect, vi } from "vitest";

import {
  authorizeRoles,
  authorizePermissions
} from "../../src/middlewares/authorize.middleware.js";

import { ROLES } from "../../src/constants/roles.js";

import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("Role-based authorization", () => {

  it("should reject a request without an authenticated user", () => {
    const req = { user: null };
    const res = {};
    const next = vi.fn();

    authorizeRoles(ROLES.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401
      })
    );
  });

  it("should reject passengers accessing admin resources", () => {
    const req = {
      user: { role: ROLES.PASSENGER }
    };

    const next = vi.fn();

    authorizeRoles(ROLES.ADMIN)(req, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403
      })
    );
  });

  it("should allow administrators to access admin resources", () => {
    const req = {
      user: { role: ROLES.ADMIN }
    };

    const next = vi.fn();

    authorizeRoles(ROLES.ADMIN)(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should allow operators to manage trips", () => {
    const req = {
      user: { role: ROLES.OPERATOR }
    };

    const next = vi.fn();

    authorizePermissions(PERMISSIONS.TRIP_MANAGE)(
      req,
      {},
      next
    );

    expect(next).toHaveBeenCalledWith();
  });

  it("should reject staff from managing trips", () => {
    const req = {
      user: { role: ROLES.STAFF }
    };

    const next = vi.fn();

    authorizePermissions(PERMISSIONS.TRIP_MANAGE)(
      req,
      {},
      next
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403
      })
    );
  });

});
