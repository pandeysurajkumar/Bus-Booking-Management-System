import {
  createStop,
  getStops,
  getStopById,
} from "./stop.service.js";

import ApiResponse from "../../utils/ApiResponse.js";

export const createStopController = async (req, res) => {
  const stop = await createStop(req.body, req.user);

  return res.status(201).json(
    new ApiResponse(201, stop, "Stop created successfully.")
  );
};

export const getStopsController = async (req, res) => {
  const result = await getStops(req.query);

  return res.status(200).json(
    new ApiResponse(200, result, "Stops fetched successfully.")
  );
};

export const getStopController = async (req, res) => {
  const stop = await getStopById(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, stop, "Stop fetched successfully.")
  );
};