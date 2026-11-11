import Trip from "./trip.model.js";

export const createTripIndexes = async () => {
  await Trip.collection.createIndex(
    {
      busId: 1,
      departureAt: 1,
      arrivalAt: 1
    },
    {
      name: "bus_trip_schedule_lookup"
    }
  );

  await Trip.collection.createIndex(
    {
      operatorId: 1,
      departureAt: 1,
      status: 1
    },
    {
      name: "operator_trip_schedule_lookup"
    }
  );
};