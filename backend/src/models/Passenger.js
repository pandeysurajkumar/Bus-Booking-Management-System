const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    fullName: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Passenger age is required'],
      min: 1,
      max: 120
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Passenger gender is required']
    },
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

passengerSchema.index({ bookingId: 1, seatNumber: 1 });

module.exports = mongoose.model('Passenger', passengerSchema);
