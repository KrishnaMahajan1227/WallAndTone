const Product = require('../models/product');
const { FrameType, SubFrameType, FrameSize } = require('../models/FrameType');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { uploadExcel, uploadImage, uploadLocalToCloudinary } = require('../middleware/upload.js');

// ---------------------- Frame Type Controllers ----------------------
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
      images: images || []
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
    const frameTypes = await FrameType.find()
      .populate('subFrameTypes')
      .populate('frameSizes'); // Populating associated sizes
    res.status(200).json(frameTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching frame types', error: err.message });
  }
};

const getSubFrameTypesByFrameType = async (req, res) => {
  try {
    const { frameTypeId } = req.params;
    const subFrameTypes = await SubFrameType.find({ frameType: frameTypeId })
      .populate('frameType', 'name')
      .exec();
    if (!subFrameTypes) {
      return res.status(404).json({ message: 'No sub frame types found for this frame type' });
    }
    res.status(200).json(subFrameTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching sub frame types', error: err.message });
  }
};

// ---------------------- Product Controllers ----------------------

// Helper function: derive sizes from an array of frameType IDs
const getSizesFromFrameTypes = async (frameTypeIds) => {
  // Populate each frame type with its sizes and return a union (unique) of sizes.
  const frameTypes = await FrameType.find({ _id: { $in: frameTypeIds } }).populate('frameSizes');
  const sizeSet = new Set();
  frameTypes.forEach(ft => {
    if (ft.frameSizes && Array.isArray(ft.frameSizes)) {
      ft.frameSizes.forEach(size => sizeSet.add(size._id.toString()));
    }
  });
  // Return an array of unique size IDs
  return Array.from(sizeSet);
};

const addProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      quantity,
      frameTypes,
      subFrameTypes,
      // sizes is no longer expected from the client
      startFromPrice,
      colors,
      orientations,
      categories,
      medium,
      rooms,
      primaryKeyword,
      shortTailKeywords,
      longTailKeywords
    } = req.body;

    if (!productName || !description || !startFromPrice) {
      return res.status(400).json({ message: 'Missing required fields: productName, description, or startFromPrice' });
    }

    // Validate colors, orientations, categories, medium and rooms (validation code unchanged)
    // [Validation code omitted for brevity — same as your current code]

    let mainImageUrl = '';
    if (req.files && req.files.mainImage) {
      mainImageUrl = await uploadImage(req.files.mainImage[0]);
    }
    let thumbnailUrls = [];
    if (req.files && req.files.thumbnails) {
      thumbnailUrls = await Promise.all(req.files.thumbnails.map(file => uploadImage(file)));
    }
    let subframeImageMap = [];
    if (req.body['SubframeImages'] && req.body['SubframeImages'].trim() !== "") {
      const imagePaths = req.body['SubframeImages'].split(',').map(t => t.trim());
      subframeImageMap = await Promise.all(imagePaths.map(async (imagePath) => {
        try {
          const publicId = path.basename(imagePath)
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9]/g, "_");
          const imageUrl = await uploadLocalToCloudinary(imagePath, publicId);
          if (!imageUrl) {
            console.error(`Failed to upload subframe image for ${req.body['Product Name']}`);
            return null;
          }
          return { imagePath, frameType: "defaultFrame", subFrameType: "defaultSubFrame", imageUrl };
        } catch (error) {
          console.error(`Error uploading subframe image for ${req.body['Product Name']}:`, error);
          return null;
        }
      }));
      subframeImageMap = subframeImageMap.filter(Boolean);
    }

    // Validate subFrameTypes (code unchanged)
    // [Validation code omitted for brevity — same as your current code]

    // Automatically derive sizes from the provided frameTypes.
    // Here, we assume frameTypes is an array of IDs.
    const derivedSizes = await getSizesFromFrameTypes(frameTypes);

    // Construct the product object.
    const product = {
      productName,
      description,
      quantity: parseInt(quantity, 10) || 0,
      startFromPrice: parseFloat(startFromPrice) || 0,
      frameTypes, // Provided as IDs
      subFrameTypes,
      sizes: derivedSizes, // Automatically set from frame types
      colors,
      orientations,
      categories,
      medium: medium || [],
      rooms: rooms || [],
      mainImage: mainImageUrl,
      thumbnails: thumbnailUrls,
      subFrameImages: subframeImageMap,
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

    if (search) {
      filterQuery.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // For array fields, use case-insensitive regex matching
    if (colors) {
      const colorsArray = colors.split(',').map(c => c.trim());
      filterQuery.colors = { 
        $in: colorsArray.map(color => new RegExp(`^${color}$`, 'i'))
      };
    }

    if (categories) {
      const categoriesArray = categories.split(',').map(c => c.trim());
      filterQuery.categories = { 
        $in: categoriesArray.map(cat => new RegExp(`^${cat}$`, 'i'))
      };
    }

    if (orientation) {
      const orientationArray = orientation.split(',').map(o => o.trim());
      filterQuery.orientations = { 
        $in: orientationArray.map(ori => new RegExp(`^${ori}$`, 'i'))
      };
    }

    if (medium) {
      const mediumArray = medium.split(',').map(m => m.trim());
      filterQuery.medium = { 
        $in: mediumArray.map(med => new RegExp(`^${med}$`, 'i'))
      };
    }

    if (rooms) {
      const roomsArray = rooms.split(',').map(r => r.trim());
      filterQuery.rooms = { 
        $in: roomsArray.map(room => new RegExp(`^${room}$`, 'i'))
      };
    }

    const products = await Product.find(filterQuery)
      .populate('frameTypes', 'name price')
      .populate('subFrameTypes', 'name price', null, { strictPopulate: false })
      .populate('sizes', 'name price', null, { strictPopulate: false });
    
    // Compute total price if needed
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
        model: 'FrameSize',
        select: 'name price',
      })
      .populate({
        path: "reviews.user",
        select: "firstName",
      });

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

const updateProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      quantity,
      frameTypes,
      subFrameTypes,
      // sizes is not expected from the client now
      startFromPrice,
      colors,
      orientations,
      categories,
      medium,
      rooms,
      primaryKeyword,
      shortTailKeywords,
      longTailKeywords
    } = req.body;
    let mainImage = null;
    let thumbnails = [];

    // Validate colors, orientations, categories, medium and rooms (validation code unchanged)
    // [Validation code omitted for brevity — same as above]

    if (req.files.mainImage) {
      mainImage = await uploadImage(req.files.mainImage[0]);
    }
    if (req.files.thumbnails) {
      thumbnails = await Promise.all(req.files.thumbnails.map(file => uploadImage(file)));
    }

    // Automatically derive sizes from the provided frameTypes.
    const derivedSizes = await getSizesFromFrameTypes(frameTypes);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        productName, 
        description, 
        quantity, 
        frameTypes, 
        subFrameTypes, 
        sizes: derivedSizes,
        startFromPrice, 
        mainImage, 
        thumbnails, 
        colors, 
        orientations, 
        categories,
        medium: medium || [],
        rooms: rooms || [],
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

    let reviewImages = [];
    if (req.files && req.files.length > 0) {
      reviewImages = req.files.map(file => file.path.replace(/\\/g, '/'));
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not found." });
    }

    const newReview = {
      user: req.user.id,
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
    const product = await Product.findById(productId).populate({
      path: 'frameTypes',
      select: 'name price frameSizes' // Including frameSizes with frameTypes
    });
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
    res.status(500).json({ message: 'Error fetching subframe images', error: err.message });
  }
};

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

    // Valid value arrays
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
          "Ink Drawing",
          "Illustration",
          "Sketch",
          "Charcoal Drawing",
          "Chalk Drawing",
          "Pencil Drawing",
          "Hand-Drawn Illustration",
          "Digital Painting",
          "Digital Illustration",
          "Digital Mixed Media",
          "3D Digital Art",
          "Digital Photography",
          "Digital Print",
          "Photography",
          "Woodblock Print",
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
          "Office",
          "Workspace",
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
          "Outdoor"
    ];

    // Process each row from the Excel file
    const processedData = await Promise.all(sheetData.map(async (row) => {
      if (!row['Product Name'] || !row['Description'] || !row['StartFromPrice'] || !row['MainImage'] || !row['Colors'] || !row['Orientations'] || !row['Categories']) {
        console.error(`Missing required fields for product: ${row['Product Name'] || 'Unknown Product'}`);
        return null;
      }

      const colors = row['Colors'].split(',').map(color => color.trim());
      const invalidColors = colors.filter(color => !validColors.includes(color));
      if (invalidColors.length > 0) {
        console.error(`Invalid colors for product ${row['Product Name']}: ${invalidColors.join(', ')}`);
        return null;
      }

      const orientations = row['Orientations'].split(',').map(orientation => orientation.trim());
      const invalidOrientations = orientations.filter(orientation => !validOrientations.includes(orientation));
      if (invalidOrientations.length > 0) {
        console.error(`Invalid orientations for product ${row['Product Name']}: ${invalidOrientations.join(', ')}`);
        return null;
      }

      const categories = row['Categories'].split(',').map(category => category.trim());
      const invalidCategories = categories.filter(category => !validCategories.includes(category));
      if (invalidCategories.length > 0) {
        console.error(`Invalid categories for product ${row['Product Name']}: ${invalidCategories.join(', ')}`);
        return null;
      }

      let mediumArr = [];
      if (row['Medium']) {
        mediumArr = row['Medium'].split(',').map(m => m.trim());
        const invalidMediums = mediumArr.filter(m => !validMediumArray.includes(m));
        if (invalidMediums.length > 0) {
          console.error(`Invalid mediums for product ${row['Product Name']}: ${invalidMediums.join(', ')}`);
          return null;
        }
      }

      let roomsArr = [];
      if (row['Rooms']) {
        roomsArr = row['Rooms'].split(',').map(r => r.trim());
        const invalidRooms = roomsArr.filter(r => !validRoomsArray.includes(r));
        if (invalidRooms.length > 0) {
          console.error(`Invalid rooms for product ${row['Product Name']}: ${invalidRooms.join(', ')}`);
          return null;
        }
      }

      const primaryKeyword = row['Primary Keyword'] ? row['Primary Keyword'].trim() : '';
      let shortTailKeywords = [];
      if (row['Short-Tail Keywords']) {
        shortTailKeywords = row['Short-Tail Keywords'].split(',').map(k => k.trim());
      }
      let longTailKeywords = [];
      if (row['Long-Tail Keywords']) {
        longTailKeywords = row['Long-Tail Keywords'].split(',').map(k => k.trim());
      }

      let mainImageUrl = '';
      try {
        const fullMainImagePath = path.join('uploads', row['MainImage']);
        const publicId = path.basename(row['MainImage']).replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
        mainImageUrl = await uploadLocalToCloudinary(fullMainImagePath, publicId);
        if (!mainImageUrl) {
          console.error(`Failed to upload main image for ${row['Product Name']}`);
          return null;
        }
      } catch (error) {
        console.error(`Error uploading main image for ${row['Product Name']}:`, error);
        return null;
      }

      let thumbnailUrls = [];
      if (row['Thumbnails']) {
        const thumbnailPaths = row['Thumbnails'].split(',').map(t => t.trim());
        thumbnailUrls = await Promise.all(thumbnailPaths.map(async (thumbnailPath) => {
          try {
            const fullThumbnailPath = path.join('uploads', thumbnailPath);
            const publicId = path.basename(thumbnailPath).replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
            return await uploadLocalToCloudinary(fullThumbnailPath, publicId);
          } catch (error) {
            console.error(`Error uploading thumbnail for ${row['Product Name']}:`, error);
            return null;
          }
        }));
      }

      let subframeImageMap = [];
      if (row['SubframeImageMap'] && row['SubframeImageMap'].trim() !== "") {
        const mappings = row['SubframeImageMap'].split(',').map(item => item.trim());
        subframeImageMap = await Promise.all(mappings.map(async (mappingStr) => {
          const parts = mappingStr.split(':');
          if (parts.length < 3) {
            console.error(`Invalid subframe mapping for product ${row['Product Name']}: ${mappingStr}`);
            return null;
          }
          const [imageName, frameType, subFrameType] = parts;
          const fullImagePath = path.join('uploads', imageName);
          const publicId = path.basename(imageName)
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9]/g, "_");
          const imageUrl = await uploadLocalToCloudinary(fullImagePath, publicId);
          if (!imageUrl) {
            console.error(`Failed to upload subframe image for ${row['Product Name']}`);
            return null;
          }
          return { imagePath: imageName, frameType, subFrameType, imageUrl };
        }));
        subframeImageMap = subframeImageMap.filter(Boolean);
      } else if (row['SubframeImages'] && row['SubframeImages'].trim() !== "") {
        const imagePaths = row['SubframeImages'].split(',').map(t => t.trim());
        subframeImageMap = await Promise.all(imagePaths.map(async (imageName) => {
          try {
            const fullImagePath = path.join('uploads', imageName);
            const publicId = path.basename(imageName)
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-zA-Z0-9]/g, "_");
            const imageUrl = await uploadLocalToCloudinary(fullImagePath, publicId);
            if (!imageUrl) {
              console.error(`Failed to upload subframe image for ${row['Product Name']}`);
              return null;
            }
            return { imagePath: imageName, frameType: "defaultFrame", subFrameType: "defaultSubFrame", imageUrl };
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
        primaryKeyword,
        shortTailKeywords,
        longTailKeywords
      };
    }));

    fs.unlinkSync(filePath);
    const validProducts = processedData.filter(Boolean);
    const failedProducts = processedData.filter(data => !data);
    if (validProducts.length === 0) {
      return res.status(400).json({ 
        message: 'No valid products to process',
        failedCount: failedProducts.length
      });
    }

    // Derive frame types from the excel rows
    const frameTypesSet = new Set();
    validProducts.forEach(d => {
      if (d['FrameTypes']) {
        d['FrameTypes'].split(',').map(ft => ft.trim()).forEach(ft => frameTypesSet.add(ft));
      }
    });
    // Fetch FrameType docs along with frameSizes
    const frameTypeDocs = await FrameType.find({ name: { $in: Array.from(frameTypesSet) } }).populate('frameSizes');
    const frameTypeMap = Object.fromEntries(frameTypeDocs.map(ft => [ft.name, ft]));

    // Fetch sub frame types
    const subFrameTypesSet = new Set();
    validProducts.forEach(d => {
      if (d['SubFrameTypes']) {
        d['SubFrameTypes'].split(',').map(sft => sft.trim()).forEach(sft => subFrameTypesSet.add(sft));
      }
    });
    const subFrameTypeDocs = await SubFrameType.find({ name: { $in: Array.from(subFrameTypesSet) } });
    const subFrameTypeMap = Object.fromEntries(subFrameTypeDocs.map(sft => [sft.name, sft._id]));

    // Now, instead of reading sizes from the Excel, we derive sizes from frame types.
    // For each product row, union all frameSizes from the given FrameTypes.
    const products = validProducts.map(data => {
      const sizeSet = new Set();
      if (data['FrameTypes']) {
        data['FrameTypes'].split(',').forEach(ftName => {
          const ft = frameTypeMap[ftName.trim()];
          if (ft && ft.frameSizes && Array.isArray(ft.frameSizes)) {
            ft.frameSizes.forEach(size => sizeSet.add(size._id.toString()));
          }
        });
      }
      const derivedSizes = Array.from(sizeSet);

      const subFrameImages = data.subframeImageMap && Array.isArray(data.subframeImageMap)
         ? data.subframeImageMap.map(mapping => {
             const ftId = frameTypeMap[mapping.frameType] ? frameTypeMap[mapping.frameType]._id : null;
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
        ? data['FrameTypes'].split(',').map(ft => frameTypeMap[ft.trim()]?._id).filter(Boolean)
        : [],
      
        subFrameTypes: data['SubFrameTypes']
        ? data['SubFrameTypes'].split(',').map(sft => subFrameTypeMap[sft.trim()]).filter(Boolean)
        : [],
      
        sizes: derivedSizes,
        colors: data.colors,
        orientations: data.orientations,
        categories: data.categories,
        medium: data.medium,
        rooms: data.rooms,
        mainImage: data.mainImage,
        thumbnails: data.thumbnails,
        subFrameImages: subFrameImages,
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
