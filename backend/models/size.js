const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Size = mongoose.model('Size', sizeSchema);

module.exports = Size;