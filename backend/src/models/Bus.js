const mongoose = require('mongoose');

const seatTemplateSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
      trim: true
    },
    row: {
      type: Number,
      required: true
    },
    column: {
      type: Number,
      required: true
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
    priceMultiplier: {
      type: Number,
      default: 1.0
    }
  },
  { _id: false }
);

const busSchema = new mongoose.Schema(
  {
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
      required: [true, 'Operator is required'],
      index: true
    },
    busNumber: {
      type: String,
      required: [true, 'Bus number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    modelName: {
      type: String,
      required: true,
      trim: true
    },
    busType: {
      type: String,
      required: true,
      trim: true
    },
    layoutType: {
      type: String,
      enum: ['seater', 'sleeper', 'mixed'],
      default: 'seater'
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 10,
      max: 60
    },
    amenities: {
      hasAc: { type: Boolean, default: true },
      hasWifi: { type: Boolean, default: false },
      hasCharging: { type: Boolean, default: true },
      hasWaterBottle: { type: Boolean, default: false },
      hasBlanket: { type: Boolean, default: false },
      hasLiveTracking: { type: Boolean, default: true }
    },
    seatLayout: [seatTemplateSchema],
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

busSchema.index({ operatorId: 1, isActive: 1 });

module.exports = mongoose.model('Bus', busSchema);
