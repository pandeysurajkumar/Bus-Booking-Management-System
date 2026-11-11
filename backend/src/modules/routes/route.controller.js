import {
  createRoute,
  getRoutes,
  getRouteById,
} from "./route.service.js";

import ApiResponse from "../../utils/ApiResponse.js";

export const createRouteController = async (req, res) => {
  const route = await createRoute(req.body, req.user);

  return res.status(201).json(
    new ApiResponse(201, route, "Route created successfully.")
  );
};

export const getRoutesController = async (req, res) => {
  const result = await getRoutes(req.query, req.user);

  return res.status(200).json(
    new ApiResponse(200, result, "Routes fetched successfully.")
  );
};

export const getRouteController = async (req, res) => {
  const route = await getRouteById(req.params.id, req.user);

  return res.status(200).json(
    new ApiResponse(200, route, "Route fetched successfully.")
  );
};