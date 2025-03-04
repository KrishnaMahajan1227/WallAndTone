const express = require("express");
const router = express.Router();
const { protectUser } = require("../middleware/authMiddleware"); // Adjust path as needed
const promptController = require("../controllers/promptController");

router.get("/prompts", protectUser, promptController.getRemainingPrompts);
router.post("/use-prompt", protectUser, promptController.usePrompt);
router.post("/add-prompts", protectUser, promptController.addPrompts);

module.exports = router;
