const { z } = require('zod');
const { PAYMENT_METHODS } = require('../config/constants');

const passengerItemSchema = z.object({
  fullName: z.string().min(2, 'Passenger name is required (min 2 chars)'),
  age: z.number().int().min(1, 'Age must be between 1 and 120').max(120),
  gender: z.enum(['male', 'female', 'other']),
  seatNumber: z.string().min(1, 'Seat number is required')
});

const createBookingSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
  seats: z.array(z.string().min(1)).min(1, 'At least one seat is required').max(6, 'Maximum 6 seats allowed'),
  passengers: z.array(passengerItemSchema).min(1, 'Passenger details are required'),
  boardingPoint: z.object({
    name: z.string().min(1),
    time: z.string().min(1),
    landmark: z.string().optional()
  }),
  dropPoint: z.object({
    name: z.string().min(1),
    time: z.string().min(1),
    landmark: z.string().optional()
  }),
  contactInfo: z.object({
    email: z.string().email('Valid contact email is required'),
    phone: z.string().min(10, 'Valid contact phone number is required')
  }),
  paymentMethod: z.enum(Object.values(PAYMENT_METHODS)),
  simulatedSuccess: z.boolean().optional().default(true),
  idempotencyKey: z.string().optional()
});

module.exports = {
  createBookingSchema
};
