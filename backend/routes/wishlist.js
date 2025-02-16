const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/product');
const { protectAdmin, protectUser  } = require('../middleware/authMiddleware');

// Add to Wishlist
router.post('/add', protectUser , async (req, res) => {
  try {
    const { productId, category, subcategory } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ message: 'Invalid product.' });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    const existingProduct = wishlist.items.find(item => item.productId.toString() === productId);
    if (existingProduct) {
      return res.status(400).json({ message: 'Product already in wishlist.' });
    }

    wishlist.items.push({ productId, category, subcategory });
    await wishlist.save();

    const wishlistCount = wishlist.items.length;
    res.status(200).json({ wishlist, wishlistCount, message: 'Product added to wishlist.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Wishlist
router.get('/', protectUser , async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id }).populate('items.productId');
    const wishlistCount = wishlist ? wishlist.items.length : 0;
    res.status(200).json({ items: wishlist ? wishlist.items : [], wishlistCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from Wishlist
router.delete('/remove/:productId', protectUser , async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found.' });
    }

    const productItem = wishlist.items.find(item => item.productId.toString() === req.params.productId);
    if (!productItem) {
      return res.status(404).json({ message: 'Product not found in wishlist.' });
    }

    wishlist.items = wishlist.items.filter(item => item.productId.toString() !== req.params.productId);
    await wishlist.save();

    const wishlistCount = wishlist.items.length;
    res.status(200).json({ message: 'Product removed from wishlist.', wishlist, wishlistCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;