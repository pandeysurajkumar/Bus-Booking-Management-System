const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    cancellationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cancellation',
      required: true,
      index: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0
    },
    refundTransactionId: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed',
      index: true
    },
    processedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: 'Simulated instant refund to source payment method'
    }
  },
  {
    timestamps: true
  }
);

refundSchema.index({ bookingId: 1, status: 1 });

module.exports = mongoose.model('Refund', refundSchema);
