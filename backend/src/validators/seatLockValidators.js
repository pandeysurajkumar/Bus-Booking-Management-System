const { z } = require('zod');

const lockSeatsSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
  seatNumbers: z.array(z.string().min(1)).min(1, 'At least one seat must be selected').max(6, 'Cannot select more than 6 seats at once')
});

const releaseSeatsSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
  seatNumbers: z.array(z.string().min(1)).min(1)
});

module.exports = {
  lockSeatsSchema,
  releaseSeatsSchema
};
