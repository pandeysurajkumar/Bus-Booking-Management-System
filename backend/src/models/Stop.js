const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Stop name is required'],
      trim: true
    },
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
      index: true
    },
    landmark: {
      type: String,
      default: '',
      trim: true
    },
    stopType: {
      type: String,
      enum: ['boarding', 'drop', 'both'],
      default: 'both'
    },
    address: {
      type: String,
      default: ''
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

stopSchema.index({ cityId: 1, isActive: 1 });

module.exports = mongoose.model('Stop', stopSchema);
