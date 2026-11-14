const mongoose = require('mongoose');
const { SEAT_STATUS } = require('../config/constants');

const tripSeatSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true
    },
    deck: {
      type: String,
      enum: ['lower', 'upper'],
      default: 'lower'
    },
    seatType: {
      type: String,
      enum: ['seater', 'sleeper'],
      default: 'seater'
    },
    row: {
      type: Number,
      required: true
    },
    column: {
      type: Number,
      required: true
    },
    fare: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(SEAT_STATUS),
      default: SEAT_STATUS.AVAILABLE,
      index: true
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    lockExpiresAt: {
      type: Date,
      default: null,
      index: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    },
    genderPreference: {
      type: String,
      enum: ['none', 'male', 'female'],
      default: 'none'
    }
  },
  {
    timestamps: true
  }
);

// Crucial compound unique constraint to guarantee no two records exist for the same trip seat
tripSeatSchema.index({ tripId: 1, seatNumber: 1 }, { unique: true });
tripSeatSchema.index({ tripId: 1, status: 1 });
tripSeatSchema.index({ status: 1, lockExpiresAt: 1 });

module.exports = mongoose.model('TripSeat', tripSeatSchema);
