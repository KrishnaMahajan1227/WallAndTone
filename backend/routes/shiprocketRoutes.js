const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// ✅ Create Shiprocket Order
router.post("/create-order", async (req, res) => {
  try {
    const { token, orderData } = req.body; // Get token & order details from request

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      orderData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json({ success: true, orderResponse: response.data });
  } catch (error) {
    console.error("Error creating order in Shiprocket:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

module.exports = router;
