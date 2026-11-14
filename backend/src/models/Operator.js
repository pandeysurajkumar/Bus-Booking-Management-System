const mongoose = require('mongoose');

const operatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Operator name is required'],
      trim: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    logo: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

operatorSchema.index({ companyName: 1, isActive: 1 });

module.exports = mongoose.model('Operator', operatorSchema);
