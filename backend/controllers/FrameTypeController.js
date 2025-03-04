const { FrameType, SubFrameType, FrameSize } = require('../models/FrameType');

// ---------------------- FrameType Controllers ----------------------
const addFrameType = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !description || price === undefined) {
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

const getAllFrameTypes = async (req, res) => {
  try {
    const frameTypes = await FrameType.find()
      .populate('subFrameTypes')
      .populate('frameSizes'); // Populating associated sizes
    res.status(200).json(frameTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching frame types', error: err.message });
  }
};

const getFrameTypeById = async (req, res) => {
  try {
    const frameType = await FrameType.findById(req.params.id)
      .populate('frameSizes', 'name price'); // populate frameSizes with name and price
    if (!frameType) {
      return res.status(404).json({ message: 'Frame type not found' });
    }
    res.status(200).json(frameType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching frame type', error: err.message });
  }
};


const updateFrameType = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !description || price === undefined) {
      return res.status(400).json({ message: 'Please provide name, description, and price for the frame type' });
    }
    const updatedFrameType = await FrameType.findByIdAndUpdate(
      req.params.id,
      { name, description, price },
      { new: true }
    );
    if (!updatedFrameType) {
      return res.status(404).json({ message: 'Frame type not found' });
    }
    res.status(200).json(updatedFrameType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating frame type', error: err.message });
  }
};

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

// ---------------------- SubFrameType Controllers ----------------------
const addSubFrameType = async (req, res) => {
  try {
    const { name, frameType, description, price, images } = req.body;
    if (!name || !frameType || !description || price === undefined) {
      return res.status(400).json({ message: 'Please provide name, frame type, description, and price for the sub frame type' });
    }
    const parentFrameType = await FrameType.findById(frameType);
    if (!parentFrameType) {
      return res.status(404).json({ message: 'Frame type not found' });
    }
    const newSubFrameType = new SubFrameType({
      name,
      frameType,
      description,
      price,
      images: images || [] // Accept multiple images as an array
    });
    await newSubFrameType.save();
    // Optionally update the parent FrameType with the new subFrameType
    parentFrameType.subFrameTypes.push(newSubFrameType._id);
    await parentFrameType.save();
    res.status(201).json(newSubFrameType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding sub frame type', error: err.message });
  }
};

const getAllSubFrameTypes = async (req, res) => {
  try {
    const subFrameTypes = await SubFrameType.find().populate('frameType', 'name').exec();
    res.status(200).json(subFrameTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching sub frame types', error: err.message });
  }
};

const getSubFrameTypesByFrameType = async (req, res) => {
  try {
    const { frameTypeId } = req.params;
    const subFrameTypes = await SubFrameType.find({ frameType: frameTypeId })
      .populate('frameType', 'name')
      .exec();
    if (!subFrameTypes) {
      return res.status(404).json({ message: 'No sub frame types found for this frame type' });
    }
    res.status(200).json(subFrameTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching sub frame types', error: err.message });
  }
};

const updateSubFrameType = async (req, res) => {
  try {
    const { name, frameType, description, price, images } = req.body;
    if (name === undefined || frameType === undefined || description === undefined || price === undefined) {
      return res.status(400).json({ message: 'Please provide name, frame type, description, and price for the sub frame type' });
    }
    const updatedSubFrameType = await SubFrameType.findByIdAndUpdate(
      req.params.id,
      { name, frameType, description, price, images: images || [] },
      { new: true }
    );
    if (!updatedSubFrameType) {
      return res.status(404).json({ message: 'Sub frame type not found' });
    }
    res.status(200).json(updatedSubFrameType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating sub frame type', error: err.message });
  }
};

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

// ---------------------- FrameSize Controllers ----------------------
const addFrameSize = async (req, res) => {
  try {
    const { name, frameType, price } = req.body;
    if (!name || !frameType || price === undefined) {
      return res.status(400).json({ message: 'Please provide name, frame type, and price for the frame size' });
    }
    
    // Duplicate check for the same frame type and size name.
    const existingSize = await FrameSize.findOne({ name: name, frameType: frameType });
    if (existingSize) {
      return res.status(400).json({ message: 'Frame size already exists for this frame type' });
    }
    
    const parentFrameType = await FrameType.findById(frameType);
    if (!parentFrameType) {
      return res.status(404).json({ message: 'Frame type not found' });
    }
    
    const newFrameSize = new FrameSize({ name, frameType, price });
    await newFrameSize.save();
    
    // Automatically update the parent FrameType's frameSizes array.
    parentFrameType.frameSizes.push(newFrameSize._id);
    await parentFrameType.save();
    
    res.status(201).json(newFrameSize);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding frame size', error: err.message });
  }
};

const getAllFrameSizes = async (req, res) => {
  try {
    const frameSizes = await FrameSize.find().populate('frameType', 'name').exec();
    res.status(200).json(frameSizes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching frame sizes', error: err.message });
  }
};

const getFrameSizesByFrameType = async (req, res) => {
  try {
    const { frameTypeId } = req.params;
    const frameSizes = await FrameSize.find({ frameType: frameTypeId }).populate('frameType', 'name').exec();
    if (!frameSizes) {
      return res.status(404).json({ message: 'No frame sizes found for this frame type' });
    }
    res.status(200).json(frameSizes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching frame sizes', error: err.message });
  }
};

const updateFrameSize = async (req, res) => {
  try {
    const { name, frameType, price } = req.body;
    if (!name || !frameType || price === undefined) {
      return res.status(400).json({ message: 'Please provide name, frame type, and price for the frame size' });
    }
    const updatedFrameSize = await FrameSize.findByIdAndUpdate(
      req.params.id,
      { name, frameType, price },
      { new: true }
    );
    if (!updatedFrameSize) {
      return res.status(404).json({ message: 'Frame size not found' });
    }
    res.status(200).json(updatedFrameSize);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating frame size', error: err.message });
  }
};

const deleteFrameSize = async (req, res) => {
  try {
    const deletedFrameSize = await FrameSize.findByIdAndDelete(req.params.id);
    if (!deletedFrameSize) {
      return res.status(404).json({ message: 'Frame size not found' });
    }
    // Remove the deleted frame size from the parent FrameType's frameSizes array.
    await FrameType.findByIdAndUpdate(deletedFrameSize.frameType, { $pull: { frameSizes: deletedFrameSize._id } });
    res.status(200).json({ message: 'Frame size deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting frame size', error: err.message });
  }
};

module.exports = {
  addFrameType,
  addSubFrameType,
  getAllFrameTypes,
  getAllSubFrameTypes: getAllSubFrameTypes, // Alias if needed
  getSubFrameTypesByFrameType,
  updateFrameType,
  updateSubFrameType,
  deleteFrameType,
  deleteSubFrameType: deleteSubFrameType, // Alias if needed
  getFrameTypeById,
  addFrameSize,
  getAllFrameSizes,
  getFrameSizesByFrameType,
  updateFrameSize,
  deleteFrameSize
};
