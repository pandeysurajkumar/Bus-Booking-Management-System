const mongoose = require('mongoose');

const seatLockSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    seatNumbers: [
      {
        type: String,
        required: true
      }
    ],
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index: MongoDB auto-removes expired lock documents
    },
    sessionId: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

seatLockSchema.index({ tripId: 1, userId: 1 });

module.exports = mongoose.model('SeatLock', seatLockSchema);
