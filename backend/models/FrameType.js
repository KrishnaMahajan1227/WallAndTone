const mongoose = require('mongoose');

// FrameSize Schema
const frameSizeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true},
    frameType: { type: mongoose.Schema.Types.ObjectId, ref: 'FrameType', required: true },
    price: { type: Number, required: true }
  },
  { timestamps: true }
);

frameSizeSchema.index({ frameType: 1, name: 1 }, { unique: true });

// SubFrameType Schema
const subFrameTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    frameType: { type: mongoose.Schema.Types.ObjectId, ref: 'FrameType', required: true },
    description: { type: String },
    price: { type: Number, required: true },
    images: { type: [String], default: [] } // Updated: Allow multiple images.
  },
  { timestamps: true }
);

// FrameType Schema (updated to include frameSizes)
const frameTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    subFrameTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubFrameType' }],
    frameSizes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FrameSize' }]
  },
  { timestamps: true }
);

const FrameType = mongoose.model('FrameType', frameTypeSchema);
const SubFrameType = mongoose.model('SubFrameType', subFrameTypeSchema);
const FrameSize = mongoose.model('FrameSize', frameSizeSchema);

module.exports = { FrameType, SubFrameType, FrameSize };
