
import bcrypt from "bcryptjs";

import User from "../../models/User.js";
import AuthSession from "../../models/AuthSession.js";

import ApiError from "../../utils/ApiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
  hashToken
} from "../../utils/token.utils.js";

const REFRESH_TOKEN_DAYS = Number(
  process.env.REFRESH_TOKEN_DAYS || 7
);

const createSession = async (user) => {
  const refreshToken = generateRefreshToken();

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  );

  const session = await AuthSession.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt
  });

  const accessToken = generateAccessToken(
    user,
    session._id
  );

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken
  };
};

// REGISTER
const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "passenger"
  });

  return createSession(user);
};

// LOGIN
const login = async ({ email, password }) => {
  const user = await User.findOne({ email })
    .select("+passwordHash");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status !== "active") {
    throw new ApiError(403, "Your account is suspended");
  }

  return createSession(user);
};

// REFRESH SESSION
const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const now = new Date();

  // Atomically revoke the old session.
  // Only one concurrent refresh request can succeed.
  const oldSession = await AuthSession.findOneAndUpdate(
    {
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
      expiresAt: { $gt: now }
    },
    {
      $set: { revokedAt: now }
    },
    {
      new: false
    }
  );

  if (!oldSession) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(oldSession.userId);

  if (!user || user.status !== "active") {
    throw new ApiError(401, "Account is unavailable");
  }

  const newSession = await createSession(user);

  await AuthSession.findByIdAndUpdate(
    oldSession._id,
    {
      $set: { replacedBy: await AuthSession.findOne({
        tokenHash: hashToken(newSession.refreshToken)
      }).select("_id").then((doc) => doc?._id) }
    }
  );

  return newSession;
};

// LOGOUT
const logout = async (refreshToken) => {
  if (!refreshToken) return;

  await AuthSession.updateOne(
    {
      tokenHash: hashToken(refreshToken),
      revokedAt: null
    },
    {
      $set: { revokedAt: new Date() }
    }
  );
};

// GET CURRENT USER
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user.toJSON();
};

const authService = {
  register,
  login,
  refresh,
  logout,
  getCurrentUser
};

export default authService;
