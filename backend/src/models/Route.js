const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    originCityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
      index: true
    },
    originStateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: true,
      index: true
    },
    destinationCityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
      index: true
    },
    destinationStateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: true,
      index: true
    },
    distanceKm: {
      type: Number,
      required: true,
      min: 1
    },
    estimatedDurationMinutes: {
      type: Number,
      required: true,
      min: 10
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

routeSchema.index({ originCityId: 1, destinationCityId: 1, isActive: 1 });
routeSchema.index({ originStateId: 1, destinationStateId: 1 });

module.exports = mongoose.model('Route', routeSchema);
