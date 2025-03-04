const express = require("express");
const router = express.Router();
const { protectUser } = require("../middleware/authMiddleware"); // Use protectUser for user-protected routes
const promptPaymentController = require("../controllers/promptPaymentController");

router.post("/create-prompt-order", protectUser, promptPaymentController.createPromptOrder);
router.post("/verify-prompt-payment", protectUser, promptPaymentController.verifyPromptPayment);

module.exports = router;
