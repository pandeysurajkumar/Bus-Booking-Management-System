const { z } = require('zod');

const searchTripsSchema = z.object({
  fromCity: z.string().optional(),
  toCity: z.string().optional(),
  fromState: z.string().optional(),
  toState: z.string().optional(),
  date: z.string().optional(), // YYYY-MM-DD
  busType: z.string().optional(),
  hasAc: z.enum(['true', 'false']).optional(),
  hasSleeper: z.enum(['true', 'false']).optional(),
  operatorId: z.string().optional(),
  sortBy: z.enum(['fare_asc', 'fare_desc', 'departure_asc', 'departure_desc', 'rating_desc']).optional().default('departure_asc'),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20')
});

const createTripSchema = z.object({
  busId: z.string().min(1, 'Bus ID is required'),
  operatorId: z.string().min(1, 'Operator ID is required'),
  routeId: z.string().min(1, 'Route ID is required'),
  departureDate: z.string().min(1, 'Departure date is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  arrivalTime: z.string().min(1, 'Arrival time is required'),
  baseFare: z.number().min(50, 'Base fare must be at least 50'),
  boardingPoints: z.array(z.object({
    stopId: z.string(),
    name: z.string(),
    time: z.string(),
    landmark: z.string().optional()
  })).min(1, 'At least one boarding point is required'),
  dropPoints: z.array(z.object({
    stopId: z.string(),
    name: z.string(),
    time: z.string(),
    landmark: z.string().optional()
  })).min(1, 'At least one drop point is required')
});

module.exports = {
  searchTripsSchema,
  createTripSchema
};
