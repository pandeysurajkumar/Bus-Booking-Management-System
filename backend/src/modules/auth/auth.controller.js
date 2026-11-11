
import authService from "./auth.service.js";
import { createAuditLog } from "../audit/audit.service.js";
import ApiResponse from "../../utils/ApiResponse.js";

const REFRESH_TOKEN_DAYS = Number(
  process.env.REFRESH_TOKEN_DAYS || 7
);

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/v1/auth"
});

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    ...refreshCookieOptions(),
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  });
};

// REGISTER
export const register = async (req, res) => {
  const result = await authService.register(req.body);

  setRefreshCookie(res, result.refreshToken);

  res.status(201).json(
    new ApiResponse(
      201,
      "Account registered successfully",
      {
        user: result.user,
        accessToken: result.accessToken
      }
    )
  );
};

// LOGIN

 // LOGIN
export const login = async (req, res) => {
  const result = await authService.login(req.body);

  setRefreshCookie(res, result.refreshToken);

  // Create audit log after successful login
  const user = result.user;

  await createAuditLog({
    actorId: user._id,
    actorRole: user.role,
    operatorId: user.operatorId || null,
    action: "USER_LOGIN",
    entityType: "User",
    entityId: user._id,
    description: "User logged in successfully",
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });

  res.status(200).json(
    new ApiResponse(
      200,
      "Login successful",
      {
        user: result.user,
        accessToken: result.accessToken,
      }
    )
  );
};


// REFRESH TOKEN
export const refresh = async (req, res) => {
  const result = await authService.refresh(
    req.cookies.refreshToken
  );

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(
      200,
      "Session refreshed successfully",
      {
        user: result.user,
        accessToken: result.accessToken
      }
    )
  );
};

// LOGOUT

 // LOGOUT
export const logout = async (req, res) => {
  await authService.logout(req.cookies?.refreshToken);

  // Create audit log after successful logout
  await createAuditLog({
    actorId: req.user._id || req.user.id,
    actorRole: req.user.role,
    operatorId: req.user.operatorId || null,
    action: "USER_LOGOUT",
    entityType: "User",
    entityId: req.user._id || req.user.id,
    description: "User logged out successfully",
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });

  res.clearCookie(
    "refreshToken",
    refreshCookieOptions()
  );

  res.status(200).json(
    new ApiResponse(200, "Logout successful")
  );
};


// CURRENT USER
export const getMe = async (req, res) => {
  const user = await authService.getCurrentUser(
    req.user.id
  );

  res.status(200).json(
    new ApiResponse(
      200,
      "User profile retrieved successfully",
      { user }
    )
  );
};
