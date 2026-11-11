import Operator from "./operator.model.js";
import ApiError from "../../utils/ApiError.js";

export const createOperator = async (data, user) => {
  const email = data.contactEmail.toLowerCase().trim();

  const existing = await Operator.findOne({ contactEmail: email });

  if (existing) {
    throw new ApiError(409, "An operator with this email already exists.");
  }

  return Operator.create({
    ...data,
    contactEmail: email,
    createdBy: user._id,
  });
};

export const getOperators = async () => {
  return Operator.find().sort({ createdAt: -1 });
};

export const updateOperatorStatus = async (id, status) => {
  if (!["active", "inactive", "suspended"].includes(status)) {
    throw new ApiError(400, "Invalid operator status.");
  }

  const operator = await Operator.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!operator) {
    throw new ApiError(404, "Operator not found.");
  }

  return operator;
};