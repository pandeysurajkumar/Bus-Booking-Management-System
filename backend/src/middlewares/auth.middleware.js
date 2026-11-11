
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import AuthSession from "../models/AuthSession.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {

  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required");
  }

  const token = authorization.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  if (!decoded.sub || !decoded.sid) {
    throw new ApiError(401, "Invalid access token");
  }

  const session = await AuthSession.findOne({
    _id: decoded.sid,
    userId: decoded.sub,
    revokedAt: null,
    expiresAt: { $gt: new Date() }
  });

  if (!session) {
    throw new ApiError(401, "Session expired or revoked");
  }

  const user = await User.findById(decoded.sub);

  if (!user || user.status !== "active") {
    throw new ApiError(401, "Account unavailable");
  }

  req.user = {
    _id: user._id,
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    operatorId: user.operatorId || null
  };

  next();
});

export default authenticate;
