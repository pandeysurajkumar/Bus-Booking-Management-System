import Stop from "./stop.model.js";
import ApiError from "../../utils/ApiError.js";

export const createStop = async (data, user) => {
  const stop = await Stop.create({
    ...data,
    createdBy: user._id,
  });

  return stop;
};

export const getStops = async (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

  const filter = { status: "active" };

  if (query.city) {
    filter.city = { $regex: query.city.trim(), $options: "i" };
  }

  if (query.search) {
    const search = query.search.trim();

    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
    ];
  }

  const [stops, total] = await Promise.all([
    Stop.find(filter)
      .sort({ city: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit),

    Stop.countDocuments(filter),
  ]);

  return {
    stops,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getStopById = async (id) => {
  const stop = await Stop.findById(id);

  if (!stop) {
    throw new ApiError(404, "Stop not found.");
  }

  return stop;
};