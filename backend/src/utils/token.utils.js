
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export const generateAccessToken = (user, sessionId) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      sid: sessionId.toString()
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
    }
  );
};

export const generateRefreshToken = () => {
  return crypto.randomBytes(48).toString("hex");
};

export const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};
