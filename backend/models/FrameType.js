const mongoose = require('mongoose');

const frameTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    subFrameTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubFrameType' }],
  },
  { timestamps: true }
);


// Sub Frame Type Schema
const subFrameTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    frameType: { type: mongoose.Schema.Types.ObjectId, ref: 'FrameType', required: true },
    description: { type: String },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

const FrameType = mongoose.model('FrameType', frameTypeSchema);
const SubFrameType = mongoose.model('SubFrameType', subFrameTypeSchema);

module.exports = { FrameType, SubFrameType };