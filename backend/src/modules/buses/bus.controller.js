import {
  createBus,
  getBuses,
  getBusById,
  updateBus,
  archiveBus,
} from "./bus.service.js";

import ApiResponse from "../../utils/ApiResponse.js";

export const createBusController = async (req, res) => {
  const bus = await createBus(req.body, req.user);

  return res.status(201).json(
    new ApiResponse(201, bus, "Bus created successfully.")
  );
};

export const getBusesController = async (req, res) => {
  const result = await getBuses(req.query, req.user);

  return res.status(200).json(
    new ApiResponse(200, result, "Buses fetched successfully.")
  );
};

export const getBusController = async (req, res) => {
  const bus = await getBusById(req.params.id, req.user);

  return res.status(200).json(
    new ApiResponse(200, bus, "Bus fetched successfully.")
  );
};

export const updateBusController = async (req, res) => {
  const bus = await updateBus(req.params.id, req.body, req.user);

  return res.status(200).json(
    new ApiResponse(200, bus, "Bus updated successfully.")
  );
};

export const archiveBusController = async (req, res) => {
  const bus = await archiveBus(req.params.id, req.user);

  return res.status(200).json(
    new ApiResponse(200, bus, "Bus archived successfully.")
  );
};