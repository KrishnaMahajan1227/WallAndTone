const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");

router.post("/apply", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: "Please enter a coupon code to apply." 
      });
    }

    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid coupon code. Please check and try again." 
      });
    }

    // Check if the coupon is expired
    const now = new Date();
    if (new Date(coupon.expirationDateTime) < now) {
      return res.status(400).json({ 
        success: false, 
        message: `Coupon "${code}" has expired. Please use a valid coupon.` 
      });
    }

    res.status(200).json({
      success: true,
      discount: coupon.discount,
      message: `Coupon "${code}" applied successfully! You got ${coupon.discount}% off.`,
    });

  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error, please try again later." 
    });
  }
});

module.exports = router;
