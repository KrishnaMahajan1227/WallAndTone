// freepikRoutes.js
const express = require('express');
const { generateImage } = require('../controllers/freepikController');
const { protectAdmin, protectUser  } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware
router.post('/generate-image', protectUser, generateImage);

module.exports = router;
