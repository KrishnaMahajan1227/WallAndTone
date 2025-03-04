const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/user");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order for prompt purchase
exports.createPromptOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    const order = await razorpay.orders.create({
      amount, // Amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    });
    return res.status(201).json({ success: true, message: "Razorpay order for prompt purchase created", order });
  } catch (error) {
    console.error("Error creating prompt order:", error);
    return res.status(500).json({ success: false, message: "Failed to create prompt order" });
  }
};

// Verify Prompt Payment Signature and update prompt count
exports.verifyPromptPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Prompt payment verification failed" });
    }
    
    // Payment verified; update user's prompt count
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.remainingPrompts = 10; // Adjust as needed (e.g. add 10 new prompts)
    await user.save();
    return res.status(200).json({ 
      success: true, 
      message: "Prompt payment verified and prompt balance updated successfully", 
      remainingPrompts: user.remainingPrompts 
    });
  } catch (error) {
    console.error("Error verifying prompt payment:", error);
    return res.status(500).json({ success: false, message: "Failed to verify prompt payment" });
  }
};
