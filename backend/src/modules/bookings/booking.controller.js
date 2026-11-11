import {
  createBooking,
  getMyBookings,
  getBookingByPNR,
} from "./booking.service.js";

import ApiResponse from "../../utils/ApiResponse.js";

export const createBookingController = async (req, res) => {
  const booking = await createBooking(req.body, req.user);

  return res.status(201).json(
    new ApiResponse(201, booking, "Booking confirmed successfully.")
  );
};

export const getMyBookingsController = async (req, res) => {
  const result = await getMyBookings(req.user._id, req.query);

  return res.status(200).json(
    new ApiResponse(200, result, "Bookings fetched successfully.")
  );
};

export const getBookingByPNRController = async (req, res) => {
  const booking = await getBookingByPNR(req.params.pnr, req.user);

  return res.status(200).json(
    new ApiResponse(200, booking, "Booking details fetched successfully.")
  );
};