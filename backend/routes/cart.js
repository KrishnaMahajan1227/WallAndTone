const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/product');
const { protectUser } = require('../middleware/authMiddleware');

// Add to Cart
router.post('/add', protectUser, async (req, res) => {
  try {
    const { quantity, frameType, subFrameType, size, image, isCustom, productId } = req.body;

    // Validate input
    if (!quantity || !frameType || !subFrameType || !size) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    // For custom images, validate image
    if (isCustom && !image) {
      return res.status(400).json({
        message: 'Image is required for custom artwork'
      });
    }

    // For regular products, check if product exists
    if (!isCustom && productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Check if item already exists in cart with same frame configuration
    const existingItemIndex = cart.items.findIndex(item => {
      const sameFrameConfig = 
        item.frameType.toString() === frameType &&
        item.subFrameType.toString() === subFrameType &&
        item.size.toString() === size;

      if (isCustom) {
        return sameFrameConfig && item.isCustom && item.image === image;
      } else {
        return sameFrameConfig && !item.isCustom && item.productId?.toString() === productId;
      }
    });

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem = {
        quantity,
        frameType,
        subFrameType,
        size,
        isCustom
      };

      if (isCustom) {
        newItem.image = image;
      } else {
        newItem.productId = productId;
      }

      cart.items.push(newItem);
    }

    await cart.save();

    // Populate cart items with details
    await cart.populate([
      {
        path: 'items.productId',
        select: 'productName price mainImage'
      },
      {
        path: 'items.frameType',
        select: 'name price'
      },
      {
        path: 'items.subFrameType',
        select: 'name price'
      },
      {
        path: 'items.size',
        select: 'width height price'
      }
    ]);

    // Calculate total price
    const totalPrice = cart.items.reduce((total, item) => {
      const frameTypePrice = item.frameType?.price || 0;
      const subFrameTypePrice = item.subFrameType?.price || 0;
      const sizePrice = item.size?.price || 0;
      const productPrice = item.productId?.price || 0;
      return total + (item.quantity * (frameTypePrice + subFrameTypePrice + sizePrice + productPrice));
    }, 0);

    res.status(200).json({
      cart: {
        items: cart.items,
        totalPrice,
        cartCount: cart.items.length
      },
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Cart
router.get('/', protectUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.productId', 'productName price mainImage')
      .populate('items.frameType', 'name price')
      .populate('items.subFrameType', 'name price')
      .populate('items.size', 'width height price');

    if (!cart) {
      return res.status(200).json({
        items: [],
        totalPrice: 0,
        cartCount: 0
      });
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((total, item) => {
      const frameTypePrice = item.frameType?.price || 0;
      const subFrameTypePrice = item.subFrameType?.price || 0;
      const sizePrice = item.size?.price || 0;
      const productPrice = item.productId?.price || 0;
      return total + (item.quantity * (frameTypePrice + subFrameTypePrice + sizePrice + productPrice));
    }, 0);

    res.status(200).json({
      items: cart.items,
      totalPrice,
      cartCount: cart.items.length
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Cart Item
router.put('/update/:itemId', protectUser, async (req, res) => {
  try {
    const { quantity, frameType, subFrameType, size } = req.body;
    const itemId = req.params.itemId;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Check if updated configuration matches any existing item
    const existingItemIndex = cart.items.findIndex((item, index) => {
      if (index === itemIndex) return false; // Skip the current item

      const sameFrameConfig = 
        (frameType ? item.frameType.toString() === frameType : item.frameType.toString() === cart.items[itemIndex].frameType.toString()) &&
        (subFrameType ? item.subFrameType.toString() === subFrameType : item.subFrameType.toString() === cart.items[itemIndex].subFrameType.toString()) &&
        (size ? item.size.toString() === size : item.size.toString() === cart.items[itemIndex].size.toString());

      if (cart.items[itemIndex].isCustom) {
        return sameFrameConfig && item.isCustom && item.image === cart.items[itemIndex].image;
      } else {
        return sameFrameConfig && !item.isCustom && item.productId?.toString() === cart.items[itemIndex].productId?.toString();
      }
    });

    if (existingItemIndex > -1) {
      // Merge quantities and remove the current item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items.splice(itemIndex, 1);
    } else {
      // Update the current item
      cart.items[itemIndex].quantity = quantity;
      if (frameType) cart.items[itemIndex].frameType = frameType;
      if (subFrameType) cart.items[itemIndex].subFrameType = subFrameType;
      if (size) cart.items[itemIndex].size = size;
    }

    await cart.save();

    await cart.populate([
      {
        path: 'items.productId',
        select: 'productName price mainImage'
      },
      {
        path: 'items.frameType',
        select: 'name price'
      },
      {
        path: 'items.subFrameType',
        select: 'name price'
      },
      {
        path: 'items.size',
        select: 'width height price'
      }
    ]);

    // Calculate total price
    const totalPrice = cart.items.reduce((total, item) => {
      const frameTypePrice = item.frameType?.price || 0;
      const subFrameTypePrice = item.subFrameType?.price || 0;
      const sizePrice = item.size?.price || 0;
      const productPrice = item.productId?.price || 0;
      return total + (item.quantity * (frameTypePrice + subFrameTypePrice + sizePrice + productPrice));
    }, 0);

    res.status(200).json({
      cart: {
        items: cart.items,
        totalPrice,
        cartCount: cart.items.length
      },
      message: 'Cart updated successfully'
    });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from Cart
router.delete('/remove/:itemId', protectUser, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    await cart.populate([
      {
        path: 'items.productId',
        select: 'productName price mainImage'
      },
      {
        path: 'items.frameType',
        select: 'name price'
      },
      {
        path: 'items.subFrameType',
        select: 'name price'
      },
      {
        path: 'items.size',
        select: 'width height price'
      }
    ]);

    // Calculate total price
    const totalPrice = cart.items.reduce((total, item) => {
      const frameTypePrice = item.frameType?.price || 0;
      const subFrameTypePrice = item.subFrameType?.price || 0;
      const sizePrice = item.size?.price || 0;
      const productPrice = item.productId?.price || 0;
      return total + (item.quantity * (frameTypePrice + subFrameTypePrice + sizePrice + productPrice));
    }, 0);

    res.status(200).json({
      cart: {
        items: cart.items,
        totalPrice,
        cartCount: cart.items.length
      },
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;