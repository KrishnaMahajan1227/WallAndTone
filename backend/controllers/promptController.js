const User = require("../models/user");

// Get remaining prompts for the authenticated user
exports.getRemainingPrompts = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ remainingPrompts: user.remainingPrompts });
    } catch (error) {
      console.error("Error in getRemainingPrompts:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

// Decrement prompt count if available
exports.usePrompt = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.remainingPrompts > 0) {
      user.remainingPrompts -= 1;
      await user.save();
      return res.json({ success: true, remainingPrompts: user.remainingPrompts });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Prompt limit exceeded. Please purchase additional prompts to continue." 
      });
    }
  } catch (error) {
    console.error("Error in usePrompt:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reset or update prompt count after successful payment
exports.addPrompts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.remainingPrompts = 10; // Adjust as per your business rules (for example, add 10 prompts)
    await user.save();
    return res.json({ success: true, remainingPrompts: user.remainingPrompts });
  } catch (error) {
    console.error("Error in addPrompts:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
