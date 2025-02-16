// history.js
const express = require('express');
const router = express.Router();
const History = require('../models/History');
const { protectUser } = require('../middleware/authMiddleware');

// Get user's history
router.get('/', protectUser  , async (req, res) => {
  try {
    const history = await History.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('productId', 'productName mainImage');

    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ message: 'Error fetching history' });
  }
});

// Add to history
router.post('/add', protectUser , async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if the product is already in history
    const existingEntry = await History.findOne({
      userId: req.user._id,
      productId: productId,
    });

    if (existingEntry) {
      // Check if the product has been visited recently
      const recentVisitThreshold = 60 * 1000; // 1 minute
      const timeSinceLastVisit = new Date() - existingEntry.createdAt;
      if (timeSinceLastVisit < recentVisitThreshold) {
        return res.json(existingEntry);
      }

      // Update timestamp of existing entry
      existingEntry.createdAt = new Date();
      await existingEntry.save();
      return res.json(existingEntry);
    }

    // Create new history entry
    const historyEntry = new History({
      userId: req.user._id,
      productId,
    });

    await historyEntry.save();

    // Remove oldest entry if more than 5
    const count = await History.countDocuments({ userId: req.user._id });
    if (count > 5) {
      const oldestEntry = await History.findOne({ userId: req.user._id })
        .sort({ createdAt: 1 });
      await History.findByIdAndDelete(oldestEntry._id);
    }

    res.status(201).json(historyEntry);
  } catch (err) {
    console.error('Error adding to history:', err);
    res.status(500).json({ message: 'Error adding to history' });
  }
});

module.exports = router;