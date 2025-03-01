const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// Shiprocket Authentication Endpoint
router.post("/auth", async (req, res) => {
  try {
    // Get email & password from request body; fallback to environment variables
    const { email, password } = req.body;
    const shiprocketEmail = email || process.env.SHIPROCKET_EMAIL;
    const shiprocketPassword = password || process.env.SHIPROCKET_PASSWORD;

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      { email: shiprocketEmail, password: shiprocketPassword },
      { headers: { "Content-Type": "application/json" } }
    );

    res.json({ token: response.data.token });
  } catch (error) {
    console.error(
      "Error authenticating with Shiprocket:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ message: "Failed to authenticate with Shiprocket" });
  }
});

module.exports = router;
