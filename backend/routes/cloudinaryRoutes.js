const express = require("express");
const crypto = require("crypto");
require("dotenv").config();

const router = express.Router();

// **🔹 Generate Cloudinary Signature**
router.post("/cloudinary-signature", (req, res) => {
  const { timestamp, folder } = req.body;

  if (!timestamp) {
    return res.status(400).json({ message: "Timestamp is required" });
  }

  // Construct the **exact** string to sign as per Cloudinary’s docs
  const stringToSign = `folder=${folder}&timestamp=${timestamp}`;

  // Generate signature using Cloudinary API secret
  const signature = crypto
    .createHash("sha256")
    .update(stringToSign + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");

  res.status(200).json({ signature });
});

module.exports = router;
