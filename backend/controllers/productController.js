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
    const { name, frameType, description, price } = req.body;
    if (!name || !frameType || !description || !price) {
      return res.status(400).json({ message: 'Please provide name, frame type, description, and price for the sub frame type' });
    }
    const parentFrameType = await FrameType.findById(frameType);
    if (!parentFrameType) {
      return res.status(404).json({ message: 'Frame type not found' });
    }
    const newSubFrameType = new SubFrameType({ name, frameType, description, price });
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

// UPDATED: Product Controllers

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
      rooms
    } = req.body;
    let mainImage = null;
    let thumbnails = [];
    let subframeImages = [];

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

    // Allowed values for new fields
const validMediums = [
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


    // Validate medium if provided
    if (medium) {
      if (!Array.isArray(medium) || medium.length === 0) {
        return res.status(400).json({ message: 'If provided, at least one medium must be selected.' });
      }
      const invalidMediums = medium.filter(m => !validMediums.includes(m));
      if (invalidMediums.length > 0) {
        return res.status(400).json({ message: `Invalid mediums: ${invalidMediums.join(', ')}` });
      }
    }

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

    // Handle file uploads for main image and thumbnails
    if (req.files.mainImage) {
      mainImage = await uploadImage(req.files.mainImage[0]);
    }
    if (req.files.thumbnails) {
      thumbnails = await Promise.all(req.files.thumbnails.map(file => uploadImage(file)));
    }
    if (req.files.subframeImages) {
      subframeImages = await Promise.all(req.files.subframeImages.map(file => uploadImage(file)));
    }

    // Validate sub frame types
    if (subFrameTypes && Array.isArray(subFrameTypes) && subFrameTypes.length > 0) {
      const validSubFrameTypes = await SubFrameType.find({
        '_id': { $in: subFrameTypes }
      }).select('_id');
      const validSubFrameTypeIds = validSubFrameTypes.map(subFrameType => subFrameType._id.toString());
      const invalidSubFrameTypes = subFrameTypes.filter(subFrameTypeId => !validSubFrameTypeIds.includes(subFrameTypeId));
      if (invalidSubFrameTypes.length > 0) {
        return res.status(400).json({ message: `Invalid sub frame type IDs: ${invalidSubFrameTypes.join(', ')}` });
      }
    } else {
      return res.status(400).json({ message: 'Sub frame types must be an array with at least one valid ID.' });
    }

    // Validate sizes
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      const validSizes = await Size.find({
        '_id': { $in: sizes }
      }).select('_id');
      const validSizeIds = validSizes.map(size => size._id.toString());
      const invalidSizes = sizes.filter(sizeId => !validSizeIds.includes(sizeId));
      if (invalidSizes.length > 0) {
        return res.status(400).json({ message: `Invalid size IDs: ${invalidSizes.join(', ')}` });
      }
    } else {
      return res.status(400).json({ message: 'Sizes must be an array with at least one valid ID.' });
    }

    // Create a new product
    const newProduct = new Product({
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
      mainImage,
      thumbnails,
      subFrameImages,
      medium: medium || [],
      rooms: rooms || []
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ message: 'Error adding product', error: err.message });
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
      rooms
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
      const invalidMediums = medium.filter(m => !validMediums.includes(m));
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
        rooms: rooms || []
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
  const { rating, comment } = req.body;
  const reviewImages = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];

  if (!rating || !comment) {
    return res.status(400).json({ message: 'Rating and comment are required.' });
  }

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const newReview = {
      user: req.user.id,
      rating,
      comment,
      images: reviewImages,
    };

    product.reviews.push(newReview);
    await product.save();

    res.status(200).json(newReview);
  } catch (err) {
    res.status(500).json({ message: 'Error submitting review', error: err.message });
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

const addSubframeImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { subFrameType, frameType, imageUrl } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const newSubframeImage = {
      subFrameType,
      frameType,
      imageUrl
    };

    product.subFrameImages.push(newSubframeImage);
    await product.save();

    res.status(201).json(newSubframeImage);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error adding subframe image', 
      error: err.message 
    });
  }
};

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
      acc[key].push({
        id: img._id,
        subFrameType: img.subFrameType,
        frameType: img.frameType,
        imageUrl: img.imageUrl
      });
      return acc;
    }, {});

    res.status(200).json(groupedImages);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching subframe images', 
      error: err.message 
    });
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

const updateSubframeImage = async (req, res) => {
  try {
    const { productId, subframeImageId } = req.params;
    const { subFrameType, frameType, imageUrl } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const subframeImageIndex = product.subFrameImages.findIndex(image => image._id.toString() === subframeImageId);
    if (subframeImageIndex === -1) {
      return res.status(404).json({ message: 'Subframe image not found' });
    }

    product.subFrameImages[subframeImageIndex] = {
      subFrameType,
      frameType,
      imageUrl,
    };

    await product.save();

    res.status(200).json(product.subFrameImages[subframeImageIndex]);
  } catch (err) {
    res.status(500).json({ message: 'Error updating subframe image', error: err.message });
  }
};

const deleteSubframeImage = async (req, res) => {
  try {
    const { productId, subframeImageId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const subframeImageIndex = product.subFrameImages.findIndex(image => image._id.toString() === subframeImageId);
    if (subframeImageIndex === -1) {
      return res.status(404).json({ message: 'Subframe image not found' });
    }

    product.subFrameImages.splice(subframeImageIndex, 1);
    await product.save();

    res.status(200).json({ message: 'Subframe image deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting subframe image', error: err.message });
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

const getSubframeImage = async (req, res) => {
  try {
    const { productId, subFrameTypeId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const subFrameImage = product.subFrameImages.find(img => 
      img.subFrameType.toString() === subFrameTypeId
    );
    if (!subFrameImage) {
      return res.status(404).json({ message: 'Subframe image not found' });
    }
    res.json({ imageUrl: subFrameImage.imageUrl });
  } catch (err) {
    console.error('Error fetching subframe image:', err);
    res.status(500).json({ message: 'Error fetching subframe image' });
  }
};

// processExcelFile
const processExcelFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    if (!workbook.SheetNames.length) {
      return res.status(400).json({ message: 'Excel file is empty or invalid' });
    }
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    if (!sheetData.length) {
      return res.status(400).json({ message: 'Excel file is empty or invalid' });
    }

    // Define valid arrays for colors, orientations, categories, medium, and rooms
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
    // For medium, we re-declare the allowed array:
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
    // For rooms:
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

      // Upload main image
      let mainImageUrl = '';
      if (row['MainImage']) {
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

      // Process subframe images
      let subframeImageMap = [];
      if (row['SubframeImageMap']) {
        const mappings = row['SubframeImageMap'].split(',').map(mapping => {
          const [imagePath, frameType, subFrameType] = mapping.split(':');
          return { 
            imagePath: imagePath.trim(), 
            frameType: frameType.trim(), 
            subFrameType: subFrameType.trim() 
          };
        });
        subframeImageMap = await Promise.all(mappings.map(async (mapping) => {
          try {
            const publicId = path.basename(mapping.imagePath).replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
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
      }

      return {
        ...row,
        mainImage: mainImageUrl,
        thumbnails: thumbnailUrls.filter(Boolean),
        subframeImageMap: subframeImageMap.filter(Boolean),
        colors: colors,
        orientations: orientations,
        categories: categories,
        medium: mediumArr,
        rooms: roomsArr
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

    // Fetch and validate frame types
    const frameTypeDocs = await FrameType.find({
      name: { 
        $in: [...new Set(validProducts.reduce((acc, d) => {
          const frameTypes = d['FrameTypes'] ? d['FrameTypes'].split(',').map(ft => ft.trim()) : [];
          return acc.concat(frameTypes);
        }, []))]
      }
    });
    const frameTypeMap = Object.fromEntries(frameTypeDocs.map(ft => [ft.name, ft._id]));

    // Fetch and validate sub frame types
    const subFrameTypeDocs = await SubFrameType.find({
      name: { 
        $in: [...new Set(validProducts.reduce((acc, d) => {
          const subFrameTypes = d['SubFrameTypes'] ? d['SubFrameTypes'].split(',').map(sft => sft.trim()) : [];
          return acc.concat(subFrameTypes);
        }, []))]
      }
    });
    const subFrameTypeMap = Object.fromEntries(subFrameTypeDocs.map(sft => [sft.name, sft._id]));

    // Fetch and validate sizes
    const sizeDocs = await Size.find();
    const sizeMap = {};
    sizeDocs.forEach(size => {
      const key = `${size.width}x${size.height}`;
      sizeMap[key] = size._id;
    });

    // Process and create products
    const products = validProducts.map(data => {
      const subFrameImages = (data.subframeImageMap || [])
        .filter(mapping => mapping && mapping.imageUrl)
        .map(mapping => ({
          imageUrl: mapping.imageUrl,
          frameType: frameTypeMap[mapping.frameType],
          subFrameType: subFrameTypeMap[mapping.subFrameType.split(',')[0]]
        }))
        .filter(img => img.frameType && img.subFrameType);
      return {
        productName: data['Product Name'],
        description: data['Description'],
        quantity: parseInt(data['Quantity'], 10) || 0,
        startFromPrice: parseFloat(data['StartFromPrice']) || 0,
        frameTypes: data['FrameTypes'] ? data['FrameTypes'].split(',').map(ft => frameTypeMap[ft.trim()]).filter(Boolean) : [],
        subFrameTypes: data['SubFrameTypes'] ? data['SubFrameTypes'].split(',').map(sft => subFrameTypeMap[sft.trim()]).filter(Boolean) : [],
        sizes: data['Sizes'] ? data['Sizes'].split(',').map(size => sizeMap[size.trim()]).filter(Boolean) : [],
        colors: data.colors,
        orientations: data.orientations,
        categories: data.categories,
        medium: data.medium,
        rooms: data.rooms,
        mainImage: data.mainImage,
        thumbnails: data.thumbnails,
        subFrameImages
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
  getSubframeImage
};
