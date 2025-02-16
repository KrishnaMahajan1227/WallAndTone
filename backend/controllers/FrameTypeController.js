const { FrameType, SubFrameType } = require('../models/FrameType');

// Add a new frame type
const addFrameType = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Please provide name, description, and price for the frame type' });
    }
    const newFrameType = new FrameType({ name, description, price });
    await newFrameType.save();
    res.status(201).json(newFrameType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding frame type', error: err.message });
  }
};

// Add a new sub frame type
const addSubFrameType = async (req, res) => {
  try {
    const { name, frameType, description, price } = req.body;
    if (!name || !frameType || !description || !price) {
      return res.status(400).json({ message: 'Please provide name, frame type, description, and price for the sub frame type' });
    }
    const parentFrameType = await FrameType.findById(frameType);
    if (!parentFrameType) {
      return res.status(404).json({ message: 'Frame type not found' });
    }
    const newSubFrameType = new SubFrameType({ name, frameType, description, price });
    await newSubFrameType.save();
    res.status(201).json(newSubFrameType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding sub frame type', error: err.message });
  }
};

// Get all frame types
const getAllFrameTypes = async (req, res) => {
  try {
    const frameTypes = await FrameType.find().populate('subFrameTypes');
    res.status(200).json(frameTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching frame types', error: err.message });
  }
};

// Get all sub frame types (with frame type details populated)
const getAllSubFrameTypes = async (req, res) => {
  try {
    const subFrameTypes = await SubFrameType.find().populate('frameType', 'name').exec();
    res.status(200).json(subFrameTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching sub frame types', error: err.message });
  }
};

// Get sub frame types for a specific frame type
const getSubFrameTypesByFrameType = async (req, res) => {
  try {
    const { frameTypeId } = req.params;
    const subFrameTypes = await SubFrameType.find({ frameType: frameTypeId }).populate('frameType', 'name').exec();
    if (!subFrameTypes) {
      return res.status(404).json({ message: 'No sub frame types found for this frame type' });
    }
    res.status(200).json(subFrameTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching sub frame types', error: err.message });
  }
};

// Update frame type
const updateFrameType = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Please provide name, description, and price for the frame type' });
    }
    const updatedFrameType = await FrameType.findByIdAndUpdate(req.params.id, { name, description, price }, { new: true });
    if (!updatedFrameType) {
      return res.status(404).json({ message: 'Frame type not found' });
    }
    res.status(200).json(updatedFrameType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating frame type', error: err.message });
  }
};

// Update sub frame type
const updateSubFrameType = async (req, res) => {
  try {
    const { name, frameType, description, price } = req.body;
    if (!name || !frameType || !description || !price) {
      return res.status(400).json({ message: 'Please provide name, frame type, description, and price for the sub frame type' });
    }
    const updatedSubFrameType = await SubFrameType.findByIdAndUpdate(req.params.id, { name, frameType, description, price }, { new: true });
    if (!updatedSubFrameType) {
      return res.status(404).json({ message: 'Sub frame type not found' });
    }
    res.status(200).json(updatedSubFrameType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating sub frame type', error: err.message });
  }
};

// Delete frame type
const deleteFrameType = async (req, res) => {
  try {
    const deletedFrameType = await FrameType.findByIdAndDelete(req.params.id);
    if (!deletedFrameType) {
      return res.status(404).json({ message: 'Frame type not found' });
    }
    res.status(200).json({ message: 'Frame type deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting frame type', error: err.message });
  }
};

// Delete sub frame type
const deleteSubFrameType = async (req, res) => {
  try {
    const deletedSubFrameType = await SubFrameType.findByIdAndDelete(req.params.id);
    if (!deletedSubFrameType) {
      return res.status(404).json({ message: 'Sub frame type not found' });
    }
    res.status(200).json({ message: 'Sub frame type deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting sub frame type', error: err.message });
  }
};

// Get frame type by ID
const getFrameTypeById = async (req, res) => {
  try {
    const frameType = await FrameType.findById(req.params.id).select('name description price');
    if (!frameType) {
      return res.status(404).json({ message: 'Frame type not found' });
    }
    res.status(200).json(frameType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching frame type', error: err.message });
  }
};

module.exports = {
  addFrameType,
  addSubFrameType,
  getAllFrameTypes,
  getAllSubFrameTypes,
  getSubFrameTypesByFrameType,
  updateFrameType,
  updateSubFrameType,
  deleteFrameType,
  deleteSubFrameType,
  getFrameTypeById
};