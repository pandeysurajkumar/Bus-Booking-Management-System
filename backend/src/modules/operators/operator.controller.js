import {
  createOperator,
  getOperators,
} from "./operator.service.js";

import ApiResponse from "../../utils/ApiResponse.js";

export const createOperatorController = async (req, res) => {
  const operator = await createOperator(req.body, req.user);

  return res.status(201).json(
    new ApiResponse(201, operator, "Operator created successfully.")
  );
};

export const getOperatorsController = async (req, res) => {
  const operators = await getOperators();

  return res.status(200).json(
    new ApiResponse(200, operators, "Operators fetched successfully.")
  );
};