import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  cancelBooking,
  getCancellationPolicy,
  simulatePayment,
  updateCancellationPolicy,
} from "./cancellation.service.js";

export const cancelBookingController = asyncHandler(
  async (req, res) => {
    const booking = await cancelBooking(
      req.params.pnr,
      req.user
    );

    res.status(200).json(
      new ApiResponse(
        200,
        booking,
        "Booking cancelled successfully"
      )
    );
  }
);

export const simulatePaymentController = asyncHandler(
  async (req, res) => {
    const booking = await simulatePayment(
      req.params.pnr,
      req.user._id
    );

    res.status(200).json(
      new ApiResponse(
        200,
        booking,
        "Simulated payment successful"
      )
    );
  }
);

export const getCancellationPolicyController = asyncHandler(
  async (req, res) => {
    const policy = await getCancellationPolicy();

    res.status(200).json(
      new ApiResponse(
        200,
        policy,
        "Cancellation policy fetched"
      )
    );
  }
);

export const updateCancellationPolicyController = asyncHandler(
  async (req, res) => {
    const policy = await updateCancellationPolicy(
      req.body,
      req.user._id
    );

    res.status(200).json(
      new ApiResponse(
        200,
        policy,
        "Cancellation policy updated"
      )
    );
  }
);