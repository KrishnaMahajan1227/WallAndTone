const Size = require('../models/size');

const getAllSizes = async (req, res) => {
  try {
    const sizes = await Size.find().sort({ createdAt: -1 });
    return res.status(200).json(sizes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error fetching sizes' });
  }
};

const createSize = async (req, res) => {
  try {
    const size = new Size({
      width: req.body.width,
      height: req.body.height,
      price: req.body.price,
    });
    await size.save();
    return res.status(201).json(size);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating size' });
  }
};

const updateSize = async (req, res) => {
  try {
    const size = await Size.findById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: 'Size not found' });
    }
    size.width = req.body.width;
    size.height = req.body.height;
    size.price = req.body.price;
    await size.save();
    return res.status(200).json(size);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating size' });
  }
};

const deleteSize = async (req, res) => {
  try {
    const size = await Size.deleteOne({ _id: req.params.id });
    if (size.deletedCount === 0) {
      return res.status(404).json({ message: 'Size not found' });
    }
    return res.status(200).json({ message: 'Size deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error deleting size' });
  }
};

module.exports = {
  getAllSizes,
  createSize,
  updateSize,
  deleteSize,
};