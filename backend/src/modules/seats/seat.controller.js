import {
  getTripSeats,
  holdSeat,
  releaseSeat,
} from "./seat.service.js";

import ApiResponse from "../../utils/ApiResponse.js";

export const getTripSeatsController = async (req, res) => {
  const result = await getTripSeats(req.params.tripId);

  return res.status(200).json(
    new ApiResponse(200, result, "Seat availability fetched successfully.")
  );
};

export const holdSeatController = async (req, res) => {
  const result = await holdSeat(
    req.params.tripId,
    req.body.seatNumber,
    req.user
  );

  return res.status(200).json(
    new ApiResponse(200, result, "Seat held successfully.")
  );
};

export const releaseSeatController = async (req, res) => {
  const result = await releaseSeat(
    req.params.tripId,
    req.body.seatNumber,
    req.user
  );

  return res.status(200).json(
    new ApiResponse(200, result, "Seat released successfully.")
  );
};