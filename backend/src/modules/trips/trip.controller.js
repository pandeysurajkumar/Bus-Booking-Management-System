import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  cancelTrip,
  updateTripStatus,
} from "./trip.service.js";

import ApiResponse from "../../utils/ApiResponse.js";

export const createTripController = async (req, res) => {
  const trip = await createTrip(req.body, req.user);

  return res.status(201).json(
    new ApiResponse(201, trip, "Trip scheduled successfully.")
  );
};

export const getTripsController = async (req, res) => {
  const result = await getTrips(req.query, req.user);

  return res.status(200).json(
    new ApiResponse(200, result, "Trips fetched successfully.")
  );
};

export const getTripController = async (req, res) => {
  const trip = await getTripById(req.params.id, req.user);

  return res.status(200).json(
    new ApiResponse(200, trip, "Trip fetched successfully.")
  );
};

export const updateTripController = async (req, res) => {
  const trip = await updateTrip(req.params.id, req.body, req.user);

  return res.status(200).json(
    new ApiResponse(200, trip, "Trip updated successfully.")
  );
};

export const cancelTripController = async (req, res) => {
  const trip = await cancelTrip(req.params.id, req.user);

  return res.status(200).json(
    new ApiResponse(200, trip, "Trip cancelled successfully.")
  );
};

export const updateTripStatusController = async (req, res) => {
  const trip = await updateTripStatus(
    req.params.id,
    req.body.status,
    req.user
  );

  return res.status(200).json(
    new ApiResponse(200, trip, "Trip status updated successfully.")
  );
};