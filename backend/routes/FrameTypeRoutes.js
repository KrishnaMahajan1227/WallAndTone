const express = require('express');
const router = express.Router();
const {
  addFrameType,
  addSubFrameType,
  getAllFrameTypes,
  getAllSubFrameTypes,
  getSubFrameTypesByFrameType,
  updateFrameType,
  updateSubFrameType,
  deleteFrameType,
  deleteSubFrameType,
  getFrameTypeById,
  addFrameSize,
  getAllFrameSizes,
  getFrameSizesByFrameType,
  updateFrameSize,
  deleteFrameSize
} = require('../controllers/FrameTypeController');

// Routes for Frame Types
router.post('/frame-types', addFrameType); // Add a new frame type
router.get('/frame-types', getAllFrameTypes); // Get all frame types
router.get('/frame-types/:id', getFrameTypeById); // Get frame type by ID
router.put('/frame-types/:id', updateFrameType); // Update a frame type
router.delete('/frame-types/:id', deleteFrameType); // Delete a frame type

// Routes for Sub Frame Types
// Note: The addSubFrameType and updateSubFrameType endpoints now support multiple images via an "images" array in the request body.
router.post('/sub-frame-types', addSubFrameType); // Add a new sub frame type
router.get('/sub-frame-types', getAllSubFrameTypes); // Get all sub frame types
router.get('/sub-frame-types/:frameTypeId', getSubFrameTypesByFrameType); // Get sub frame types by frame type
router.put('/sub-frame-types/:id', updateSubFrameType); // Update a sub frame type
router.delete('/sub-frame-types/:id', deleteSubFrameType); // Delete a sub frame type

// Routes for Frame Sizes
router.post('/frame-sizes', addFrameSize); // Add a new frame size
router.get('/frame-sizes', getAllFrameSizes); // Get all frame sizes
router.get('/frame-sizes/:frameTypeId', getFrameSizesByFrameType); // Get frame sizes by frame type
router.put('/frame-sizes/:id', updateFrameSize); // Update a frame size
router.delete('/frame-sizes/:id', deleteFrameSize); // Delete a frame size

module.exports = router;
