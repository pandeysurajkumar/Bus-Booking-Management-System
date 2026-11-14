const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'State name is required'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: [true, 'State code is required'],
      unique: true,
      uppercase: true,
      trim: true
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

module.exports = mongoose.model('State', stateSchema);
