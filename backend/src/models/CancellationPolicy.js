const mongoose = require('mongoose');
const { REFUND_POLICY_DEFAULT } = require('../config/constants');

const policyRuleSchema = new mongoose.Schema(
  {
    minHoursBeforeDeparture: {
      type: Number,
      required: true,
      min: 0
    },
    refundPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    cancellationFeePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    description: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const cancellationPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    rules: {
      type: [policyRuleSchema],
      default: REFUND_POLICY_DEFAULT
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

module.exports = mongoose.model('CancellationPolicy', cancellationPolicySchema);
