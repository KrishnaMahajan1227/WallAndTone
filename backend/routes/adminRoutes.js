const express = require('express');
const router = express.Router();
const protectAdmin = require('../middleware/authMiddleware');

// Example of a protected admin route
router.get('/dashboard', protectAdmin, async (req, res) => {
  res.status(200).json({ message: 'Welcome to the admin dashboard!' });
});

module.exports = router;
