import { randomUUID } from "crypto";
import Bus from "../buses/bus.model.js";
import ApiError from "../../utils/ApiError.js";

export const withBusScheduleLock = async (busId, callback) => {
  const token = randomUUID();
  const now = new Date();
  const lockUntil = new Date(now.getTime() + 30000);

  const bus = await Bus.findOneAndUpdate(
    {
      _id: busId,
      $or: [
        { scheduleLockUntil: null },
        { scheduleLockUntil: { $exists: false } },
        { scheduleLockUntil: { $lt: now } },
      ],
    },
    {
      $set: {
        scheduleLockToken: token,
        scheduleLockUntil: lockUntil,
      },
    },
    { new: true }
  );

  if (!bus) {
    throw new ApiError(409, "Bus schedule is currently being modified. Try again.");
  }

  try {
    return await callback(bus);
  } finally {
    await Bus.updateOne(
      {
        _id: busId,
        scheduleLockToken: token,
      },
      {
        $set: {
          scheduleLockToken: null,
          scheduleLockUntil: null,
        },
      }
    );
  }
};