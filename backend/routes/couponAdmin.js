// routes/couponAdmin.js
const express = require("express");
const router = express.Router();
const { addCoupon, getCoupons, updateCoupon, deleteCoupon } = require("../controllers/CouponAdminController");

router.post("/add", addCoupon);
router.get("/get", getCoupons);
router.put("/update/:id", updateCoupon);
router.delete("/delete/:id", deleteCoupon);

router.post("/apply", async (req, res) => {
    try {
      const { code } = req.body;
  
      if (!code) {
        return res.status(400).json({ success: false, message: "Coupon code is required" });
      }
  
      const coupon = await Coupon.findOne({ code });
  
      if (!coupon) {
        return res.status(400).json({ success: false, message: "Invalid coupon code" });
      }
  
      // Check if the coupon is expired
      const now = new Date();
      if (new Date(coupon.expirationDateTime) < now) {
        return res.status(400).json({ success: false, message: "Coupon has expired" });
      }
  
      res.status(200).json({
        success: true,
        discount: coupon.discount,
        message: "Coupon applied successfully!",
      });
  
    } catch (error) {
      console.error("Error applying coupon:", error);
      res.status(500).json({ success: false, message: "Server error, please try again" });
    }
  });

module.exports = router;
