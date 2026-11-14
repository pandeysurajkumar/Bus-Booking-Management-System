const mongoose = require('mongoose');

const cancellationSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reason: {
      type: String,
      default: 'Customer requested cancellation',
      trim: true
    },
    cancelledSeats: [
      {
        type: String,
        required: true
      }
    ],
    originalAmount: {
      type: Number,
      required: true
    },
    refundAmount: {
      type: Number,
      required: true
    },
    cancellationFee: {
      type: Number,
      required: true
    },
    refundPercentage: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected'],
      default: 'completed'
    },
    cancelledAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

cancellationSchema.index({ bookingId: 1 });
cancellationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Cancellation', cancellationSchema);
