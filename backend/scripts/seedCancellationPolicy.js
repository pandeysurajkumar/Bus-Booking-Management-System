import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import CancellationPolicy from "../src/modules/cancellation/cancellation-policy.model.js";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await CancellationPolicy.findOneAndUpdate(
      { key: "default" },
      {
        $setOnInsert: {
          key: "default",
          enabled: true,
          rules: [
            {
              minHoursBeforeDeparture: 24,
              refundPercentage: 100,
            },
            {
              minHoursBeforeDeparture: 6,
              refundPercentage: 50,
            },
            {
              minHoursBeforeDeparture: 0,
              refundPercentage: 0,
            },
          ],
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log("Cancellation policy seeded successfully");
  } catch (error) {
    console.error("Cancellation policy seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();