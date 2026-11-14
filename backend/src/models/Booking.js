const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../config/constants');

const bookingSchema = new mongoose.Schema(
  {
    pnr: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
      index: true
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true
    },
    journeyDate: {
      type: Date,
      required: true,
      index: true
    },
    seats: [
      {
        type: String,
        required: true
      }
    ],
    passengerCount: {
      type: Number,
      required: true
    },
    passengers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passenger'
      }
    ],
    contactInfo: {
      email: { type: String, required: true },
      phone: { type: String, required: true }
    },
    boardingPoint: {
      name: { type: String, required: true },
      time: { type: Date, required: true },
      landmark: { type: String, default: '' }
    },
    dropPoint: {
      name: { type: String, required: true },
      time: { type: Date, required: true },
      landmark: { type: String, default: '' }
    },
    baseAmount: {
      type: Number,
      required: true
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
      index: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null
    },
    cancellationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cancellation',
      default: null
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ operatorId: 1, journeyDate: 1 });
bookingSchema.index({ tripId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
