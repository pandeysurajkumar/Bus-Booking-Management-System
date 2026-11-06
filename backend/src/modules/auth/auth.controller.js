
import authService from "./auth.service.js";

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
export const login = async (req, res) => {
  const result = await authService.login(req.body);

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(
      200,
      "Login successful",
      {
        user: result.user,
        accessToken: result.accessToken
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
export const logout = async (req, res) => {
  await authService.logout(req.cookies.refreshToken);

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
