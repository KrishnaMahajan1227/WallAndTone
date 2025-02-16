const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },
  expirationDate: { type: String, required: true },
  expirationTime: {
    hours: { type: Number, required: true },
    minutes: { type: Number, required: true },
    seconds: { type: Number, required: true }
  }
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;

