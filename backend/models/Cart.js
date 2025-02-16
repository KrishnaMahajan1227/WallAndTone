const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    frameType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FrameType',
      required: true
    },
    subFrameType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubFrameType',
      required: true
    },
    size: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Size',
      required: true
    },
    isCustom: {
      type: Boolean,
      default: false
    },
    image: {
      type: String
    }
  }],
}, {
  timestamps: true
});

// Add a method to calculate total price
cartSchema.methods.calculateTotalPrice = function() {
  return this.items.reduce((total, item) => {
    // For custom images, only include frame prices
    const basePrice = item.isCustom ? 0 : (item.productId?.price || 0);
    const itemPrice = basePrice + 
                     (item.frameType?.price || 0) + 
                     (item.subFrameType?.price || 0) + 
                     (item.size?.price || 0);
    return total + (itemPrice * item.quantity);
  }, 0);
};

module.exports = mongoose.model('Cart', cartSchema);