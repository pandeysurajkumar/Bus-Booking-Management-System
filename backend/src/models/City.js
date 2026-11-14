const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
      required: [true, 'State reference is required'],
      index: true
    },
    code: {
      type: String,
      trim: true,
      uppercase: true
    },
    isPopular: {
      type: Boolean,
      default: false,
      index: true
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

citySchema.index({ name: 1, stateId: 1 }, { unique: true });

module.exports = mongoose.model('City', citySchema);
