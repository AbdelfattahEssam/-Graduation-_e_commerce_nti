const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const ORDER_STATUSES = [
  "pending",
  "preparing",
  "shipped",
  "delivered",
  "received",
  "cancelled by admin",
  "cancelled by client",
  "rejected",
  "refunded",
];

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressId: { type: mongoose.Schema.Types.ObjectId, required: true },
    addressSnapshot: { type: Object, required: true },
    mobileSnapshot: { type: String, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    shippingCost: { type: Number, required: true, min: 0, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    timestamp: { type: Number, default: () => Date.now() },
    date: { type: Date, default: () => new Date() },
    orderItems: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, "Order must have at least one item"],
    },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
