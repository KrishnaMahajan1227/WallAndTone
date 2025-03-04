const mongoose = require('mongoose');
const { Schema } = mongoose;

// ---------------------
// Review Schema
// ---------------------
const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now, index: true }
});

// ---------------------
// Product Schema
// ---------------------
const productSchema = new Schema(
  {
    productName: { type: String, required: true },
    description: { type: String, required: true },
    mainImage: { type: String, required: true },
    thumbnails: { type: [String], default: [] },
    quantity: { type: Number, required: true },
    startFromPrice: { type: Number, required: true },
    // SEO fields
    primaryKeyword: { type: String },
    shortTailKeywords: { type: [String], default: [] },
    longTailKeywords: { type: [String], default: [] },
    // Updated Frame related references
    frameTypes: [{ type: Schema.Types.ObjectId, ref: 'FrameType', required: true }],
    subFrameTypes: [{ type: Schema.Types.ObjectId, ref: 'SubFrameType' }],
    // List of available frame sizes
    sizes: [{ type: Schema.Types.ObjectId, ref: 'FrameSize', required: true }],
    // Additional fields
    colors: [
      {
        type: String,
        enum: [
          'Black', 'White', 'Gold', 'Gray', 'Pink', 'Green', 'Orange', 'Red', 'Blue',
          'Beige', 'Brown', 'Yellow', 'Purple', 'Neon Green', 'Soft Pastels',
          'Earth Tones', 'Muted Tones', 'Cool Tones', 'Fiery Orange', 'Deep Blue',
          'Silver', 'Peach', 'Coral', 'Lavender', 'Dark Green', 'Light Brown',
          'Terracotta', 'Navy', 'Dusty Rose', 'Indigo', 'Sepia', 'Red Chalk'
        ]
      }
    ],
    orientations: [
      {
        type: String,
        enum: ['Portrait', 'Landscape', 'Square']
      }
    ],
    categories: [
      {
        type: String,
        enum: [
          'Abstract', 'Surrealism', 'Expressionism', 'Minimalist', 'Fluid Art',
          'Optical Art', 'Nature Art', 'Botanical', 'Seascape', 'Wildlife', 'Scenic',
          'Marine Art', 'Animal Portraits', 'Birds', 'Fantasy Creatures', 'Cityscape',
          'Urban Art', 'Landmark', 'Classical Architecture', 'Figurative', 'Portraits',
          'Classical Art', 'Realism', 'Ukiyo-e', 'Renaissance', 'Baroque',
          'Impressionism', 'Post-Impressionism', 'Space Art', 'Cyberpunk', 'Steampunk',
          'Futuristic', 'Retro-Futurism', 'Religious Art', 'Mandalas', 'Symbolism',
          'Calligraphy', 'Fine Art Photography', 'Black & White', 'Conceptual Photography',
          'Digital Illustration', 'Pop Art', 'Vintage', 'Whimsical', 'Caricature',
          'Cartoon', 'Modern Art', 'Geometric', 'Contemporary', 'Modernism',
          'Hand-Drawn', 'Calligraphy', 'Text Art', 'Line Art', 'Food Art', 'Gourmet', 'Drinks',
          'Classic Still Life', 'Asian Art', 'Ukiyo-e', 'Tribal', 'Cultural Paintings',
          'Love & Romance', 'Seasonal Art', 'Nautical'
        ]
      }
    ],
    // New field: Medium
    medium: [
      {
        type: String,
        enum: [
          "Acrylic Painting",
          "Oil Painting",
          "Watercolor Painting",
          "Cubist Painting",
          "Fresco",
          "Ink Drawing / Illustration / Sketch",
          "Charcoal Drawing",
          "Chalk Drawing",
          "Pencil Drawing / Sketch",
          "Hand-Drawn Illustration",
          "Digital Painting",
          "Digital Illustration / Drawing",
          "Digital Mixed Media",
          "3D Digital Art / Illustration",
          "Digital Photography",
          "Digital Print",
          "Photography / Photography Print",
          "Woodblock Print / Woodcut Print",
          "Printmaking",
          "Printed Art",
          "Mixed Media",
          "Ink & Watercolor",
          "Painting (Oil or Acrylic)",
          "Sketch & Mixed Media"
        ]
      }
    ],
    // New field: Rooms
    rooms: [
      {
        type: String,
        enum: [
          "Living Room",
          "Cozy Living Room",
          "Luxury Living Room",
          "Lounge",
          "Bedroom",
          "Contemporary Bedroom",
          "Cozy Bedroom",
          "Tranquil Bedroom",
          "Nursery",
          "Office / Workspace",
          "Art Studio",
          "Creative Studio",
          "Library & Study Room",
          "Music Room",
          "Dining Room",
          "Kitchen",
          "Café & Coffee Shop",
          "Bar & Lounge",
          "Hotel & Lobby",
          "Yoga & Meditation Room",
          "Spa & Relaxation Space",
          "Gym",
          "Zen Garden",
          "Outdoor & Nature-Inspired Spaces"
        ]
      }
    ],
    // Sub-frame images for specific frame and subframe combinations
    subFrameImages: [
      {
        subFrameType: { type: Schema.Types.ObjectId, ref: 'SubFrameType', required: true },
        frameType: { type: Schema.Types.ObjectId, ref: 'FrameType', required: true },
        imageUrl: { type: String, required: true }
      }
    ],
    reviews: { type: [reviewSchema], default: [] },
    rating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Instance method to update the average rating based on reviews
productSchema.methods.updateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
  } else {
    const totalRatings = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = totalRatings / this.reviews.length;
  }
};

// Pre-save hook to update the product rating whenever reviews change
productSchema.pre('save', function (next) {
  if (this.isModified('reviews')) {
    this.updateAverageRating();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
