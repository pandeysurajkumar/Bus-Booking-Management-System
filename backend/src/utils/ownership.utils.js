
import mongoose from "mongoose";
import ApiError from "./ApiError.js";

export const assertOperatorOwnership = (user, operatorId) => {
  if (user.role === "admin") {
    return true;
  }

  if (
    user.role !== "operator" ||
    !user.operatorId ||
    !mongoose.isValidObjectId(operatorId)
  ) {
    throw new ApiError(403, "Access to this operator resource is denied");
  }

  if (user.operatorId.toString() !== operatorId.toString()) {
    throw new ApiError(403, "You do not own this resource");
  }

  return true;
};
