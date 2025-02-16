const Coupon = require("../models/Coupon");

const addCoupon = async (req, res) => {
  try {
    const { code, discount, expirationDate, expirationTime } = req.body;

    if (!code || !discount || !expirationDate || !expirationTime) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Ensure expirationTime has valid numbers
    if (
      isNaN(expirationTime.hours) ||
      isNaN(expirationTime.minutes) ||
      isNaN(expirationTime.seconds)
    ) {
      return res.status(400).json({ message: "Invalid expiration time format." });
    }

    const coupon = new Coupon({
      code,
      discount,
      expirationDate,
      expirationTime
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    console.error("Error adding coupon:", error);
    res.status(500).json({ message: "Failed to add coupon" });
  }
};

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find(); // Fetch all coupons
    res.json(coupons);
  } catch (error) {
    console.error("Failed to get coupons:", error.message);
    res.status(500).json({ message: "Failed to get coupons." });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discount, expirationDate, expirationTime } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { code, discount, expirationDate, expirationTime },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json(coupon);
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({ message: "Failed to update coupon" });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Failed to delete coupon:", error);
    res.status(500).json({ message: "Failed to delete coupon" });
  }
};

module.exports = { addCoupon, getCoupons, updateCoupon, deleteCoupon };
