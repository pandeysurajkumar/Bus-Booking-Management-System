const { z } = require('zod');

const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().optional().default('Customer requested cancellation')
});

module.exports = {
  cancelBookingSchema
};
