const mongoose = require('mongoose');

// Review Schema
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

// Product Schema
const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    description: { type: String, required: true },
    mainImage: { type: String, required: true },
    thumbnails: { type: [String], default: [] },
    quantity: { type: Number, required: true },
    startFromPrice: { type: Number, required: true },
    frameTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FrameType', required: true }],
    subFrameTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubFrameType' }],
    colors: [{
      type: String,
      enum: [
        'Black', 'White', 'Gold', 'Gray', 'Pink', 'Green', 'Orange', 'Red', 'Blue',
        'Beige', 'Brown', 'Yellow', 'Purple', 'Neon Green', 'Soft Pastels',
        'Earth Tones', 'Muted Tones', 'Cool Tones', 'Fiery Orange', 'Deep Blue',
        'Silver', 'Peach', 'Coral', 'Lavender', 'Dark Green', 'Light Brown',
        'Terracotta', 'Navy', 'Dusty Rose', 'Indigo', 'Sepia', 'Red Chalk'
      ]
    }],
     orientations: [{
      type: String,
      enum: ['Portrait', 'Landscape', 'Square']
    }],
    subFrameImages: [
      {
        subFrameType: { type: mongoose.Schema.Types.ObjectId, ref: 'SubFrameType', required: true },
        frameType: { type: mongoose.Schema.Types.ObjectId, ref: 'FrameType', required: true },
        imageUrl: { type: String, required: true },
      },
    ],
    sizes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Size', required: true }],
    reviews: { type: [reviewSchema], default: [] },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.methods.updateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
  } else {
    const totalRatings = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRatings / this.reviews.length;
  }
};

productSchema.pre('save', function (next) {
  if (this.isModified('reviews')) {
    this.updateAverageRating();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);