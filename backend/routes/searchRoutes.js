const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Search suggestions endpoint
router.get('/suggestions', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.length < 2) {
      return res.json([]);
    }

    const products = await Product.find({
      $or: [
        { productName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .select('_id productName price mainImage')
    .limit(10);

    res.json(products);
  } catch (err) {
    console.error('Error fetching search suggestions:', err);
    res.status(500).json({ message: 'Error fetching search suggestions' });
  }
});

// Full search endpoint
router.get('/', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const products = await Product.find({
      $or: [
        { productName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('frameTypes', 'name')
    .populate('subFrameTypes', 'name')
    .populate('sizes', 'width height price');

    console.log('Search results:', products.length, 'products found');
    res.json(products);
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ message: 'Error searching products' });
  }
});

module.exports = router;