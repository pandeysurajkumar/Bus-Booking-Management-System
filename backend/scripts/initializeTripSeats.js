import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

import  connectDB  from "../src/config/database.js";
import Trip from "../src/modules/trips/trip.model.js";
import TripSeat from "../src/modules/seats/trip-seat.model.js";
import { initializeTripSeats } from "../src/modules/seats/seat.service.js";

const run = async () => {
  try {
    await connectDB();

    const trips = await Trip.find({
      status: "scheduled",
    });

    for (const trip of trips) {
      const existingCount = await TripSeat.countDocuments({
        tripId: trip._id,
      });

      if (existingCount > 0) continue;

      await initializeTripSeats(trip);

      console.log(`Initialized seats for trip: ${trip._id}`);
    }

    console.log("Trip seat initialization completed.");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();