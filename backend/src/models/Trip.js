const mongoose = require('mongoose');

const tripStopSchema = new mongoose.Schema(
  {
    stopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    time: {
      type: Date,
      required: true
    },
    landmark: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true,
      index: true
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
      index: true
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true,
      index: true
    },
    departureDate: {
      type: Date,
      required: true,
      index: true
    },
    departureTime: {
      type: Date,
      required: true
    },
    arrivalTime: {
      type: Date,
      required: true
    },
    baseFare: {
      type: Number,
      required: true,
      min: 0
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0
    },
    totalSeats: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'running', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true
    },
    boardingPoints: [tripStopSchema],
    dropPoints: [tripStopSchema],
    cancellationPolicyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CancellationPolicy'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

tripSchema.index({ routeId: 1, departureDate: 1, status: 1 });
tripSchema.index({ operatorId: 1, departureDate: 1 });

module.exports = mongoose.model('Trip', tripSchema);
