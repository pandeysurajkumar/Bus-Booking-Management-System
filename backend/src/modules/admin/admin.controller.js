import User from "../../models/User.js";
import Booking from "../bookings/booking.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const listUsersController = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.search?.trim()) {
    const search = req.query.search.trim();
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  res.status(200).json(
    new ApiResponse(200, "Users fetched successfully", {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    })
  );
};

export const updateUserStatusController = async (req, res) => {
  const nextStatus =
    req.body.status ||
    (req.body.isActive === false ? "suspended" : "active");

  if (!["active", "suspended"].includes(nextStatus)) {
    throw new ApiError(400, "Status must be active or suspended");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(403, "Administrator accounts cannot be updated here");
  }

  user.status = nextStatus;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, "User status updated", { user })
  );
};

export const listBookingsController = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const filter = {};

  if (req.query.search?.trim()) {
    filter.pnr = {
      $regex: req.query.search.trim(),
      $options: "i"
    };
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("userId", "name email")
      .populate("originStopId", "name city")
      .populate("destinationStopId", "name city")
      .sort({ bookedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Booking.countDocuments(filter)
  ]);

  res.status(200).json(
    new ApiResponse(200, "Bookings fetched successfully", {
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    })
  );
};
