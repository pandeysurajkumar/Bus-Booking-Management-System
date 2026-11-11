import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import  connectDB  from "../src/config/database.js";
import { createTripIndexes } from "../src/modules/trips/trip.indexes.js";

const run = async () => {
  try {
    await connectDB();
    await createTripIndexes();

    console.log("Trip indexes created successfully.");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();