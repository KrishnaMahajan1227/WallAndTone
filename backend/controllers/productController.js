// ProductController.js

const { FrameType, SubFrameType } = require('../models/FrameType');
const xlsx = require('xlsx');
const Product = require('../models/product');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Size = require('../models/size');
const { uploadExcel, uploadImage, uploadLocalToCloudinary } = require('../middleware/upload.js');

// Frame Type Controllers
const addFrameType = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Please provide name, description, and price for the frame type' });
    }
    const newFrameType = new FrameType({ name, description, price });
    await newFrameType.save();
    res.status(201).json(newFrameType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding frame type', error: err.message });
  }
};

const addSubFrameType = async (req, res) => {
  try {
    const { name, frameType, description, price, images } = req.body;
    if (!name || !frameType || !description || !price) {
      return res.status(400).json({ message: 'Please provide name, frame type, description, and price for the sub frame type' });
    }
    const parentFrameType = await FrameType.findById(frameType);
    if (!parentFrameType) {
      return res.status(404).json({ message: 'Frame type not found' });
    }
    const newSubFrameType = new SubFrameType({
      name,
      frameType,
      description,
      price,
      images: images || [] // Accept multiple images as an array
    });
    await newSubFrameType.save();
    res.status(201).json(newSubFrameType);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding sub frame type', error: err.message });
  }
};

const getAllFrameTypes = async (req, res) => {
  try {
    const frameTypes = await FrameType.find().populate('subFrameTypes');
    res.status(200).json(frameTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching frame types', error: err.message });
  }
};

const getSubFrameTypesByFrameType = async (req, res) => {
  try {
    const { frameTypeId } = req.params;
    const subFrameTypes = await SubFrameType.find({ frameType: frameTypeId }).populate('frameType', 'name').exec();
    if (!subFrameTypes) {
      return res.status(404).json({ message: 'No sub frame types found for this frame type' });
    }
    res.status(200).json(subFrameTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching sub frame types', error: err.message });
  }
};

// addProduct
const addProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      quantity,
      frameTypes,
      subFrameTypes,
      sizes,
      startFromPrice,
      colors,
      orientations,
      categories,
      medium,
      rooms,
      primaryKeyword,      // new SEO field
      shortTailKeywords,   // new SEO field (array)
      longTailKeywords     // new SEO field (array)
    } = req.body;

    // Validate required fields
    if (!productName || !description || !startFromPrice) {
      return res.status(400).json({ message: 'Missing required fields: productName, description, or startFromPrice' });
    }

    // Validate colors
    const validColors = [
      'Black', 'White', 'Gold', 'Gray', 'Pink', 'Green', 'Orange', 'Red', 'Blue',
      'Beige', 'Brown', 'Yellow', 'Purple', 'Neon Green', 'Soft Pastels',
      'Earth Tones', 'Muted Tones', 'Cool Tones', 'Fiery Orange', 'Deep Blue',
      'Silver', 'Peach', 'Coral', 'Lavender', 'Dark Green', 'Light Brown',
      'Terracotta', 'Navy', 'Dusty Rose', 'Indigo', 'Sepia', 'Red Chalk'
    ];
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({ message: 'At least one color must be selected' });
    }
    const invalidColors = colors.filter(color => !validColors.includes(color));
    if (invalidColors.length > 0) {
      return res.status(400).json({ message: `Invalid colors: ${invalidColors.join(', ')}` });
    }

    // Validate orientations
    const validOrientations = ['Portrait', 'Landscape', 'Square'];
    if (!orientations || !Array.isArray(orientations) || orientations.length === 0) {
      return res.status(400).json({ message: 'At least one orientation must be selected' });
    }
    const invalidOrientations = orientations.filter(orientation => !validOrientations.includes(orientation));
    if (invalidOrientations.length > 0) {
      return res.status(400).json({ message: `Invalid orientations: ${invalidOrientations.join(', ')}` });
    }

    // Validate categories
    const validCategories = [        
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
    ];
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'At least one category must be selected' });
    }
    const invalidCategories = categories.filter(category => !validCategories.includes(category));
    if (invalidCategories.length > 0) {
      return res.status(400).json({ message: `Invalid categories: ${invalidCategories.join(', ')}` });
    }

    // Validate medium if provided
    const validMediumArray = [
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
    ];
    if (medium) {
      if (!Array.isArray(medium) || medium.length === 0) {
        return res.status(400).json({ message: 'If provided, at least one medium must be selected.' });
      }
      const invalidMediums = medium.filter(m => !validMediumArray.includes(m));
      if (invalidMediums.length > 0) {
        return res.status(400).json({ message: `Invalid mediums: ${invalidMediums.join(', ')}` });
      }
    }

    // Validate rooms if provided
    const validRooms = [
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
    ];
    if (rooms) {
      if (!Array.isArray(rooms) || rooms.length === 0) {
        return res.status(400).json({ message: 'If provided, at least one room must be selected.' });
      }
      const invalidRooms = rooms.filter(r => !validRooms.includes(r));
      if (invalidRooms.length > 0) {
        return res.status(400).json({ message: `Invalid rooms: ${invalidRooms.join(', ')}` });
      }
    }

    // Handle file uploads for main image and thumbnails
    let mainImageUrl = '';
    if (req.files && req.files.mainImage) {
      mainImageUrl = await uploadImage(req.files.mainImage[0]);
    }
    let thumbnailUrls = [];
    if (req.files && req.files.thumbnails) {
      thumbnailUrls = await Promise.all(req.files.thumbnails.map(file => uploadImage(file)));
    }
    // For subframe images, assume file uploads if provided (no grouping here)
    let subframeImageMap = [];
    if (req.files && req.files.subframeImages) {
      subframeImageMap = await Promise.all(req.files.subframeImages.map(async (file) => {
        try {
          const publicId = path.basename(file.path).replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
          const imageUrl = await uploadImage(file);
          return { imageUrl };
        } catch (error) {
          console.error(`Error uploading subframe image:`, error);
          return null;
        }
      }));
      subframeImageMap = subframeImageMap.filter(Boolean);
    }

    // Validate sub frame types
    if (!subFrameTypes || !Array.isArray(subFrameTypes) || subFrameTypes.length === 0) {
      return res.status(400).json({ message: 'Sub frame types must be an array with at least one valid ID.' });
    }
    const validSubFrameTypes = await SubFrameType.find({ '_id': { $in: subFrameTypes } }).select('_id');
    const validSubFrameTypeIds = validSubFrameTypes.map(sft => sft._id.toString());
    const invalidSubFrameTypes = subFrameTypes.filter(subFrameTypeId => !validSubFrameTypeIds.includes(subFrameTypeId.toString()));
    if (invalidSubFrameTypes.length > 0) {
      return res.status(400).json({ message: `Invalid sub frame type IDs: ${invalidSubFrameTypes.join(', ')}` });
    }

    // Validate sizes
    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({ message: 'Sizes must be an array with at least one valid ID.' });
    }
    const validSizes = await Size.find({ '_id': { $in: sizes } }).select('_id');
    const validSizeIds = validSizes.map(size => size._id.toString());
    const invalidSizes = sizes.filter(sizeId => !validSizeIds.includes(sizeId.toString()));
    if (invalidSizes.length > 0) {
      return res.status(400).json({ message: `Invalid size IDs: ${invalidSizes.join(', ')}` });
    }

    // Fetch and validate frame types (if provided as names)
    let frameTypeMap = {};
    let frameTypesArray = [];
    if (frameTypes) {
      frameTypesArray = Array.isArray(frameTypes) ? frameTypes : frameTypes.split(',').map(ft => ft.trim());
      const frameTypeDocs = await FrameType.find({ name: { $in: frameTypesArray } });
      frameTypeMap = Object.fromEntries(frameTypeDocs.map(ft => [ft.name, ft._id]));
      frameTypesArray = frameTypesArray.map(ft => frameTypeMap[ft]).filter(Boolean);
    }

    // Construct the product object including the new SEO fields
    const product = {
      productName,
      description,
      quantity: parseInt(quantity, 10) || 0,
      startFromPrice: parseFloat(startFromPrice) || 0,
      frameTypes: frameTypesArray,
      subFrameTypes,
      sizes,
      colors,
      orientations,
      categories,
      medium: medium || [],
      rooms: rooms || [],
      mainImage: mainImageUrl,
      thumbnails: thumbnailUrls,
      subFrameImages: subframeImageMap,
      // SEO fields
      primaryKeyword,
      shortTailKeywords: shortTailKeywords || [],
      longTailKeywords: longTailKeywords || []
    };

    const savedProduct = await Product.create(product);
    
    res.status(200).json({ 
      message: 'Product added successfully', 
      product: savedProduct
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ 
      message: 'Error adding product', 
      error: err.message 
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { search, colors, categories, orientation, medium, rooms } = req.query;
    const filterQuery = {};

    // Handle search
    if (search) {
      filterQuery.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Handle filtering by colors
    if (colors) {
      const colorsArray = colors.split(',').map(c => c.trim());
      filterQuery.colors = { $in: colorsArray };
    }

    // Handle filtering by categories
    if (categories) {
      const categoriesArray = categories.split(',').map(c => c.trim());
      filterQuery.categories = { $in: categoriesArray };
    }

    // Handle filtering by orientations
    if (orientation) {
      const orientationArray = orientation.split(',').map(o => o.trim());
      filterQuery.orientations = { $in: orientationArray };
    }

    // Handle filtering by medium
    if (medium) {
      const mediumArray = medium.split(',').map(m => m.trim());
      filterQuery.medium = { $in: mediumArray };
    }

    // Handle filtering by rooms
    if (rooms) {
      const roomsArray = rooms.split(',').map(r => r.trim());
      filterQuery.rooms = { $in: roomsArray };
    }

    const products = await Product.find(filterQuery)
      .populate('frameTypes', 'name price')
      .populate('subFrameTypes', 'name price', null, { strictPopulate: false })
      .populate('sizes', 'width height price', null, { strictPopulate: false })
      .populate('thumbnails', 'filename', null, { strictPopulate: false });
    
    // Compute totalPrice for each product
    products.forEach(product => {
      const frameTypePrice = product.frameTypes.reduce((sum, frameType) => sum + frameType.price, 0);
      const subFrameTypePrice = product.subFrameTypes.reduce((sum, subFrameType) => sum + subFrameType.price, 0);
      const sizePrice = product.sizes.reduce((sum, size) => sum + size.price, 0);
      product.totalPrice = frameTypePrice + subFrameTypePrice + sizePrice;
    });
    
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(`Fetching product with ID: ${productId}`);

    const product = await Product.findById(productId)
      .populate('frameTypes', 'name')
      .populate('subFrameTypes', 'name', null, { strictPopulate: false })
      .populate({
        path: 'sizes',
        model: 'Size',
        select: 'width height price',
      })
      .populate({
        path: "reviews.user",
        select: "firstName", // Fetch only necessary fields
      })
      .populate('thumbnails', 'filename', null, { strictPopulate: false });

    if (!product) {
      console.log(`Product with ID ${productId} not found`);
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log(`Product with ID ${productId} found`);
    res.status(200).json(product);
  } catch (err) {
    console.error(`Error fetching product: ${err.message}`);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

// updateProduct
const updateProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      quantity,
      frameTypes,
      subFrameTypes,
      sizes,
      startFromPrice,
      colors,
      orientations,
      categories,
      medium,
      rooms,
      primaryKeyword,      // new SEO field
      shortTailKeywords,   // new SEO field
      longTailKeywords     // new SEO field
    } = req.body;
    let mainImage = null;
    let thumbnails = [];

    // Validate colors
    const validColors = [
      'Black', 'White', 'Gold', 'Gray', 'Pink', 'Green', 'Orange', 'Red', 'Blue',
      'Beige', 'Brown', 'Yellow', 'Purple', 'Neon Green', 'Soft Pastels',
      'Earth Tones', 'Muted Tones', 'Cool Tones', 'Fiery Orange', 'Deep Blue',
      'Silver', 'Peach', 'Coral', 'Lavender', 'Dark Green', 'Light Brown',
      'Terracotta', 'Navy', 'Dusty Rose', 'Indigo', 'Sepia', 'Red Chalk'
    ];
    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({ message: 'At least one color must be selected' });
    }
    const invalidColors = colors.filter(color => !validColors.includes(color));
    if (invalidColors.length > 0) {
      return res.status(400).json({ message: `Invalid colors: ${invalidColors.join(', ')}` });
    }

    // Validate orientations
    const validOrientations = ['Portrait', 'Landscape', 'Square'];
    if (!orientations || !Array.isArray(orientations) || orientations.length === 0) {
      return res.status(400).json({ message: 'At least one orientation must be selected' });
    }
    const invalidOrientations = orientations.filter(orientation => !validOrientations.includes(orientation));
    if (invalidOrientations.length > 0) {
      return res.status(400).json({ message: `Invalid orientations: ${invalidOrientations.join(', ')}` });
    }

    // Validate categories
    const validCategories = [        
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
    ];
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'At least one category must be selected' });
    }
    const invalidCategories = categories.filter(category => !validCategories.includes(category));
    if (invalidCategories.length > 0) {
      return res.status(400).json({ message: `Invalid categories: ${invalidCategories.join(', ')}` });
    }

    // Validate medium if provided
    if (medium) {
      if (!Array.isArray(medium) || medium.length === 0) {
        return res.status(400).json({ message: 'If provided, at least one medium must be selected.' });
      }
      const invalidMediums = medium.filter(m => !validMediumArray.includes(m));
      if (invalidMediums.length > 0) {
        return res.status(400).json({ message: `Invalid mediums: ${invalidMediums.join(', ')}` });
      }
    }

    // Validate rooms if provided
    if (rooms) {
      if (!Array.isArray(rooms) || rooms.length === 0) {
        return res.status(400).json({ message: 'If provided, at least one room must be selected.' });
      }
      const invalidRooms = rooms.filter(r => !validRooms.includes(r));
      if (invalidRooms.length > 0) {
        return res.status(400).json({ message: `Invalid rooms: ${invalidRooms.join(', ')}` });
      }
    }

    // Handle file uploads if provided
    if (req.files.mainImage) {
      mainImage = await uploadImage(req.files.mainImage[0]);
    }
    if (req.files.thumbnails) {
      thumbnails = await Promise.all(req.files.thumbnails.map(file => uploadImage(file)));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        productName, 
        description, 
        quantity, 
        frameTypes, 
        subFrameTypes, 
        sizes, 
        startFromPrice, 
        mainImage, 
        thumbnails, 
        colors, 
        orientations, 
        categories,
        medium: medium || [],
        rooms: rooms || [],
        // SEO fields update
        primaryKeyword,
        shortTailKeywords: shortTailKeywords || [],
        longTailKeywords: longTailKeywords || []
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required." });
    }

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Process uploaded images (Optional)
    let reviewImages = [];
    if (req.files && req.files.length > 0) {
      reviewImages = req.files.map(file => file.path.replace(/\\/g, '/'));
    }

    // Find the product
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not found." });
    }

    // Create new review
    const newReview = {
      user: req.user.id, // Store user ID
      rating,
      comment,
      images: reviewImages,
      createdAt: new Date(),
    };

    product.reviews.push(newReview);
    product.updateAverageRating();
    await product.save();

    res.status(201).json(newReview);
  } catch (err) {
    console.error("Error submitting review:", err);
    res.status(500).json({ message: "Error submitting review", error: err.message });
  }
};




const deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const userId = req.user.id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviewIndex = product.reviews.findIndex(
      (review) => review._id.toString() === reviewId && review.user.toString() === userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found or unauthorized' });
    }

    product.reviews.splice(reviewIndex, 1);

    product.rating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : 0;

    await product.save();

    res.status(200).json({ message: 'Review deleted successfully.', reviews: product.reviews });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review', error: err.message });
  }
};

const getProductSizes = async (req, res) => {
  try {
    console.log('Getting product sizes for product ID:', req.params.productId);
    const product = await Product.findById(req.params.productId).populate('sizes');
    console.log('Product found:', product);
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('Sizes found:', product.sizes);
    res.status(200).json(product.sizes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching sizes' });
  }
};

const getFrameTypesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate('frameTypes', 'name price');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product.frameTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching frame types', error: err.message });
  }
};

const getSubFrameTypesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate('subFrameTypes', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product.subFrameTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching sub frame types', error: err.message });
  }
};

const getSubframeImageById = async (req, res) => {
  try {
    const { productId, subframeImageId } = req.params;

    const product = await Product.findById(productId)
      .populate('subFrameImages.subFrameType')
      .populate('subFrameImages.frameType');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const subframeImage = product.subFrameImages.find(image => image._id.toString() === subframeImageId);
    if (!subframeImage) {
      return res.status(404).json({ message: 'Subframe image not found' });
    }

    res.status(200).json(subframeImage);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subframe image', error: err.message });
  }
};

const getProductSubframeImages = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId)
      .populate('subFrameTypes')
      .populate('subFrameImages');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const subframeImages = product.subFrameTypes.map(subFrameType => {
      const subframeImage = product.subFrameImages.find(image => 
        image.subFrameType.toString() === subFrameType._id.toString()
      );
      return subframeImage ? subframeImage.imageUrl : null;
    });
    
    res.status(200).json(subframeImages);
  } catch (err) {
    console.error('Error fetching subframe images:', err.message);
    res.status(500).json({ message: 'Error fetching subframe images' });
  }
};

// Returns all image URLs for subframe images matching the given subFrameTypeId.
const getSubframeImage = async (req, res) => {
  try {
    const { productId, subFrameTypeId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const matchingImages = product.subFrameImages.filter(img => 
      img.subFrameType.toString() === subFrameTypeId
    );
    if (matchingImages.length === 0) {
      return res.status(404).json({ message: 'Subframe images not found' });
    }
    // Flatten all imageUrls arrays from matching entries.
    const images = matchingImages.reduce((acc, img) => {
      if (Array.isArray(img.imageUrls)) {
        return acc.concat(img.imageUrls);
      } else if (img.imageUrl) {
        acc.push(img.imageUrl);
      }
      return acc;
    }, []);
    res.json({ images });
  } catch (err) {
    console.error('Error fetching subframe images:', err);
    res.status(500).json({ message: 'Error fetching subframe images' });
  }
};

// Updates a specific subframe image entry by its ID. Expects "imageUrls" in the body.
const updateSubframeImage = async (req, res) => {
  try {
    const { productId, subframeImageId } = req.params;
    const { subFrameType, frameType, imageUrls } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const index = product.subFrameImages.findIndex(img => img._id.toString() === subframeImageId);
    if (index === -1) {
      return res.status(404).json({ message: 'Subframe image not found' });
    }
    product.subFrameImages[index] = {
      subFrameType,
      frameType,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [imageUrls]
    };
    await product.save();
    res.status(200).json(product.subFrameImages[index]);
  } catch (err) {
    console.error('Error updating subframe image:', err.message);
    res.status(500).json({ message: 'Error updating subframe image', error: err.message });
  }
};

// Deletes a specific subframe image entry by its ID.
const deleteSubframeImage = async (req, res) => {
  try {
    const { productId, subframeImageId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const index = product.subFrameImages.findIndex(img => img._id.toString() === subframeImageId);
    if (index === -1) {
      return res.status(404).json({ message: 'Subframe image not found' });
    }
    product.subFrameImages.splice(index, 1);
    await product.save();
    res.status(200).json({ message: 'Subframe image deleted successfully' });
  } catch (err) {
    console.error('Error deleting subframe image:', err.message);
    res.status(500).json({ message: 'Error deleting subframe image', error: err.message });
  }
};

// Groups subframe images by their subFrameType for a given product.
const getSubframeImages = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId)
      .populate('subFrameImages.subFrameType')
      .populate('subFrameImages.frameType')
      .select('subFrameImages');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const groupedImages = product.subFrameImages.reduce((acc, img) => {
      const key = img.subFrameType._id.toString();
      if (!acc[key]) {
        acc[key] = [];
      }
      if (Array.isArray(img.imageUrls)) {
        acc[key] = acc[key].concat(img.imageUrls);
      } else if (img.imageUrl) {
        acc[key].push(img.imageUrl);
      }
      return acc;
    }, {});
    res.status(200).json(groupedImages);
  } catch (err) {
    console.error('Error fetching subframe images:', err.message);
    res.status(500).json({ message: 'Error fetching subframe images', error: err.message });
  }
};

// Adds a new subframe image entry to a product. Expects "imageUrls" in the body.
const addSubframeImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { subFrameType, frameType, imageUrls } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const images = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
    const newSubframeImage = {
      subFrameType,
      frameType,
      imageUrls: images
    };
    product.subFrameImages.push(newSubframeImage);
    await product.save();
    res.status(201).json(newSubframeImage);
  } catch (err) {
    console.error('Error adding subframe image:', err.message);
    res.status(500).json({ message: 'Error adding subframe image', error: err.message });
  }
};

const processExcelFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    if (!workbook.SheetNames.length) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Excel file is empty or invalid' });
    }
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    if (!sheetData.length) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Excel file is empty or invalid' });
    }

    // Define valid arrays for allowed values
    const validColors = [
      'Black', 'White', 'Gold', 'Gray', 'Pink', 'Green', 'Orange', 'Red', 'Blue',
      'Beige', 'Brown', 'Yellow', 'Purple', 'Neon Green', 'Soft Pastels',
      'Earth Tones', 'Muted Tones', 'Cool Tones', 'Fiery Orange', 'Deep Blue',
      'Silver', 'Peach', 'Coral', 'Lavender', 'Dark Green', 'Light Brown',
      'Terracotta', 'Navy', 'Dusty Rose', 'Indigo', 'Sepia', 'Red Chalk'
    ];
    const validOrientations = ['Portrait', 'Landscape', 'Square'];
    const validCategories = [        
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
    ];
    const validMediumArray = [
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
    ];
    const validRoomsArray = [
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
    ];

    // Process each row from the Excel file
    const processedData = await Promise.all(sheetData.map(async (row) => {
      // Validate required fields
      if (!row['Product Name'] || !row['Description'] || !row['StartFromPrice'] || !row['MainImage'] || !row['Colors'] || !row['Orientations'] || !row['Categories']) {
        console.error(`Missing required fields for product: ${row['Product Name'] || 'Unknown Product'}`);
        return null;
      }

      // Process colors
      const colors = row['Colors'].split(',').map(color => color.trim());
      const invalidColors = colors.filter(color => !validColors.includes(color));
      if (invalidColors.length > 0) {
        console.error(`Invalid colors for product ${row['Product Name']}: ${invalidColors.join(', ')}`);
        return null;
      }

      // Process orientations
      const orientations = row['Orientations'].split(',').map(orientation => orientation.trim());
      const invalidOrientations = orientations.filter(orientation => !validOrientations.includes(orientation));
      if (invalidOrientations.length > 0) {
        console.error(`Invalid orientations for product ${row['Product Name']}: ${invalidOrientations.join(', ')}`);
        return null;
      }

      // Process categories
      const categories = row['Categories'].split(',').map(category => category.trim());
      const invalidCategories = categories.filter(category => !validCategories.includes(category));
      if (invalidCategories.length > 0) {
        console.error(`Invalid categories for product ${row['Product Name']}: ${invalidCategories.join(', ')}`);
        return null;
      }

      // Process medium (if provided)
      let mediumArr = [];
      if (row['Medium']) {
        mediumArr = row['Medium'].split(',').map(m => m.trim());
        const invalidMediums = mediumArr.filter(m => !validMediumArray.includes(m));
        if (invalidMediums.length > 0) {
          console.error(`Invalid mediums for product ${row['Product Name']}: ${invalidMediums.join(', ')}`);
          return null;
        }
      }

      // Process rooms (if provided)
      let roomsArr = [];
      if (row['Rooms']) {
        roomsArr = row['Rooms'].split(',').map(r => r.trim());
        const invalidRooms = roomsArr.filter(r => !validRoomsArray.includes(r));
        if (invalidRooms.length > 0) {
          console.error(`Invalid rooms for product ${row['Product Name']}: ${invalidRooms.join(', ')}`);
          return null;
        }
      }

      // Process SEO fields from Excel:
      const primaryKeyword = row['Primary Keyword'] ? row['Primary Keyword'].trim() : '';
      let shortTailKeywords = [];
      if (row['Short-Tail Keywords']) {
        shortTailKeywords = row['Short-Tail Keywords'].split(',').map(k => k.trim());
      }
      let longTailKeywords = [];
      if (row['Long-Tail Keywords']) {
        longTailKeywords = row['Long-Tail Keywords'].split(',').map(k => k.trim());
      }

      // Upload main image
      let mainImageUrl = '';
      try {
        const publicId = path.basename(row['MainImage']).replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
        mainImageUrl = await uploadLocalToCloudinary(row['MainImage'], publicId);
        if (!mainImageUrl) {
          console.error(`Failed to upload main image for ${row['Product Name']}`);
          return null;
        }
      } catch (error) {
        console.error(`Error uploading main image for ${row['Product Name']}:`, error);
        return null;
      }

      // Upload thumbnails
      let thumbnailUrls = [];
      if (row['Thumbnails']) {
        const thumbnailPaths = row['Thumbnails'].split(',').map(t => t.trim());
        thumbnailUrls = await Promise.all(thumbnailPaths.map(async (thumbnailPath) => {
          try {
            const publicId = path.basename(thumbnailPath).replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
            return await uploadLocalToCloudinary(thumbnailPath, publicId);
          } catch (error) {
            console.error(`Error uploading thumbnail for ${row['Product Name']}:`, error);
            return null;
          }
        }));
      }

      // Process subframe images from the SubframeImageMap column
      let subframeImageMap = [];
      if (row['SubframeImageMap']) {
        // Split by commas then split each mapping by colon.
        const mappings = row['SubframeImageMap']
          .split(/\s*,\s*/)
          .map(mappingStr => {
            const parts = mappingStr.split(':');
            if (parts.length < 3) return null;
            return {
              imagePath: parts[0].trim(),
              frameType: parts[1].trim(),
              subFrameType: parts[2].trim()
            };
          })
          .filter(Boolean);
        subframeImageMap = await Promise.all(mappings.map(async (mapping) => {
          try {
            const publicId = path.basename(mapping.imagePath)
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-zA-Z0-9]/g, "_");
            const imageUrl = await uploadLocalToCloudinary(mapping.imagePath, publicId);
            if (!imageUrl) {
              console.error(`Failed to upload subframe image for ${row['Product Name']}`);
              return null;
            }
            return { ...mapping, imageUrl };
          } catch (error) {
            console.error(`Error uploading subframe image for ${row['Product Name']}:`, error);
            return null;
          }
        }));
        subframeImageMap = subframeImageMap.filter(Boolean);
      }

      return {
        ...row,
        mainImage: mainImageUrl,
        thumbnails: thumbnailUrls.filter(Boolean),
        subframeImageMap,
        colors,
        orientations,
        categories,
        medium: mediumArr,
        rooms: roomsArr,
        // Include SEO fields
        primaryKeyword,
        shortTailKeywords,
        longTailKeywords
      };
    }));

    // Clean up the temporary Excel file
    fs.unlinkSync(filePath);
    const validProducts = processedData.filter(Boolean);
    const failedProducts = processedData.filter(data => !data);
    if (validProducts.length === 0) {
      return res.status(400).json({ 
        message: 'No valid products to process',
        failedCount: failedProducts.length
      });
    }

    // Fetch and validate frame types from the products (if provided as comma-separated strings)
    const frameTypesSet = new Set();
    validProducts.forEach(d => {
      if (d['FrameTypes']) {
        d['FrameTypes'].split(',').map(ft => ft.trim()).forEach(ft => frameTypesSet.add(ft));
      }
    });
    const frameTypeDocs = await FrameType.find({ name: { $in: Array.from(frameTypesSet) } });
    const frameTypeMap = Object.fromEntries(frameTypeDocs.map(ft => [ft.name, ft._id]));

    // Fetch and validate sub frame types
    const subFrameTypesSet = new Set();
    validProducts.forEach(d => {
      if (d['SubFrameTypes']) {
        d['SubFrameTypes'].split(',').map(sft => sft.trim()).forEach(sft => subFrameTypesSet.add(sft));
      }
    });
    const subFrameTypeDocs = await SubFrameType.find({ name: { $in: Array.from(subFrameTypesSet) } });
    const subFrameTypeMap = Object.fromEntries(subFrameTypeDocs.map(sft => [sft.name, sft._id]));

    // Fetch and validate sizes (mapping from "widthxheight" to size _id)
    const sizeDocs = await Size.find();
    const sizeMap = {};
    sizeDocs.forEach(size => {
      const key = `${size.width}x${size.height}`;
      sizeMap[key] = size._id;
    });

    // Process and create product objects for insertion.
    // Here, we map each subframe image individually and skip any mapping that doesn’t have a valid frameType or subFrameType.
    const products = validProducts.map(data => {
      const subFrameImages = data.subframeImageMap && Array.isArray(data.subframeImageMap)
         ? data.subframeImageMap.map(mapping => {
             const ftId = frameTypeMap[mapping.frameType];
             let sftId = subFrameTypeMap[mapping.subFrameType];
             if (!sftId && mapping.subFrameType) {
               const matchKey = Object.keys(subFrameTypeMap).find(
                 key => key.toLowerCase() === mapping.subFrameType.toLowerCase()
               );
               if (matchKey) sftId = subFrameTypeMap[matchKey];
             }
             if (!ftId || !sftId) {
               console.error(`Skipping subframe mapping for product ${data['Product Name']} due to missing valid frameType or subFrameType for mapping: ${JSON.stringify(mapping)}`);
               return null;
             }
             return {
               frameType: ftId,
               subFrameType: sftId,
               imageUrl: mapping.imageUrl
             };
           }).filter(Boolean)
         : [];
      return {
        productName: data['Product Name'],
        description: data['Description'],
        quantity: parseInt(data['Quantity'], 10) || 0,
        startFromPrice: parseFloat(data['StartFromPrice']) || 0,
        frameTypes: data['FrameTypes'] 
          ? data['FrameTypes'].split(',').map(ft => frameTypeMap[ft.trim()]).filter(Boolean)
          : [],
        subFrameTypes: data['SubFrameTypes'] 
          ? data['SubFrameTypes'].split(',').map(sft => subFrameTypeMap[sft.trim()]).filter(Boolean)
          : [],
        sizes: data['Sizes'] 
          ? data['Sizes'].split(',').map(size => sizeMap[size.trim()]).filter(Boolean)
          : [],
        colors: data.colors,
        orientations: data.orientations,
        categories: data.categories,
        medium: data.medium,
        rooms: data.rooms,
        mainImage: data.mainImage,
        thumbnails: data.thumbnails,
        subFrameImages,
        // SEO fields
        primaryKeyword: data['Primary Keyword'] || data.primaryKeyword,
        shortTailKeywords: data['Short-Tail Keywords'] || data.shortTailKeywords || [],
        longTailKeywords: data['Long-Tail Keywords'] || data.longTailKeywords || []
      };
    });

    const savedProducts = await Product.insertMany(products);
    
    res.status(200).json({ 
      message: 'Products uploaded successfully', 
      count: savedProducts.length,
      failedCount: failedProducts.length,
      products: savedProducts
    });
  } catch (err) {
    console.error('Error processing Excel file:', err);
    res.status(500).json({ 
      message: 'Error processing Excel file', 
      error: err.message 
    });
  }
};

module.exports = {
  addFrameType,
  addSubFrameType,
  getAllFrameTypes,
  getSubFrameTypesByFrameType,
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addReview,
  deleteReview,
  processExcelFile,
  getProductSizes,
  getFrameTypesByProduct,
  getSubFrameTypesByProduct,
  addSubframeImage,
  getSubframeImages,
  getSubframeImageById,
  updateSubframeImage,
  deleteSubframeImage,
  getProductSubframeImages,
  getSubframeImage,
};