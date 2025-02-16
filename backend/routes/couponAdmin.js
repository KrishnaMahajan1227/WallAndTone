// routes/couponAdmin.js
const express = require("express");
const router = express.Router();
const { addCoupon, getCoupons, updateCoupon, deleteCoupon } = require("../controllers/CouponAdminController");

router.post("/add", addCoupon);
router.get("/get", getCoupons);
router.put("/update/:id", updateCoupon);
router.delete("/delete/:id", deleteCoupon);

module.exports = router;
