const mongoose = require("mongoose");

const orderItemSchema = mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, required: true },
    mainImage: { type: String, required: true },
    quantity: { type: Number, required: true },
    frameType: { type: mongoose.Schema.Types.ObjectId, ref: "FrameType" },
    subFrameType: { type: mongoose.Schema.Types.ObjectId, ref: "SubFrameType" },
    size: { type: mongoose.Schema.Types.ObjectId, ref: "Size" },
    itemTotal: { type: Number, required: true },
    isCustom: { type: Boolean, default: false },
  },
  { _id: false }
);

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    discountAmount: { type: Number, required: true },
    finalTotal: { type: Number, required: true },
    paymentStatus: { type: String, default: "Pending" },
    orderStatus: { type: String, default: "Processing" },
    trackingId: { type: String },
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
