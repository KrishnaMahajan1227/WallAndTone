// productSchema
const mongoose = require('mongoose');

// Review Schema
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  rating: { type: Number, required: true, min: 1, max: 5 }, // Rating between 1 and 5
  comment: { type: String, required: true }, // Review comment
  images: { type: [String], default: [] }, // Store image URLs if reviews contain images
  createdAt: { type: Date, default: Date.now },
});

// Product Schema
const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    description: { type: String, required: true },
    mainImage: { type: String, required: true }, // Main product image
    thumbnails: { type: [String], default: [] }, // Array of thumbnail images
    quantity: { type: Number, required: true },
    startFromPrice: { type: Number, required: true }, // Base starting price of the product
    frameTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FrameType', required: true }], // Multiple frame types
    subFrameTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubFrameType' }], // Multiple sub frame types

    // SubFrame Images - Storing images specific to a product's subframes
    subFrameImages: [
      {
        subFrameType: { type: mongoose.Schema.Types.ObjectId, ref: 'SubFrameType', required: true }, // Related subframe
        frameType: { type: mongoose.Schema.Types.ObjectId, ref: 'FrameType', required: true }, // Related frame type
        imageUrl: { type: String, required: true }, // Image specific to this subframe for this product
      },
    ],

    sizes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Size', required: true }], // Multiple sizes

    reviews: { type: [reviewSchema], default: [] }, // Array of reviews
    rating: { type: Number, default: 0 }, // Average rating
  },
  { timestamps: true }
);

// Ensure product's average rating is updated when a review is added
productSchema.methods.updateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
  } else {
    const totalRatings = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRatings / this.reviews.length;
  }
};

// Middleware to update the average rating before saving the product
productSchema.pre('save', function (next) {
  if (this.isModified('reviews')) {
    this.updateAverageRating();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);