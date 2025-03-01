const express = require("express");
const Razorpay = require("razorpay");
require("dotenv").config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount, // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    });

    res.status(201).json({ success: true, message: "Razorpay order created", order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
  }
});

// ✅ Step 2: Verify Payment
router.post("/verify-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
  
      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed" });
      }
  
      res.status(200).json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ success: false, message: "Failed to verify payment" });
    }
  });

module.exports = router;
