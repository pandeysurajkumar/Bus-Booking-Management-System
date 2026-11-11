import { searchTrips } from "./search.service.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const searchTripsController = async (req, res) => {
  const result = await searchTrips(req.query);

  return res.status(200).json(
    new ApiResponse(
      200,
      result,
      "Available trips fetched successfully."
    )
  );
};