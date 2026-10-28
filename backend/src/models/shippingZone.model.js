const mongoose = require('mongoose');

const shippingZoneSchema = new mongoose.Schema(
  {
    governorate: {
      type: String,
      required: [true, 'Governorate is required'],
      trim: true,
      unique: true,
    },
    cost: {
      type: Number,
      required: [true, 'Shipping cost is required'],
      min: [0, 'Shipping cost cannot be negative'],
      default: 0,
    },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShippingZone', shippingZoneSchema);