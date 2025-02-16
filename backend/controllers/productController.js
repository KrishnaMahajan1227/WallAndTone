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

// Product Controllers
const addProduct = async (req, res) => {
  try {
    const { productName, description, quantity, frameTypes, subFrameTypes, sizes, price } = req.body;
    let mainImage = null;
    let thumbnails = [];
    let subframeImages = [];

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

    // Validate sub frame types to make sure they are valid ObjectId references
    if (subFrameTypes && Array.isArray(subFrameTypes) && subFrameTypes.length > 0) {
      const validSubFrameTypes = await SubFrameType.find({
        '_id': { $in: subFrameTypes }
      }).select('_id'); // Select only _id for validation

      const validSubFrameTypeIds = validSubFrameTypes.map(subFrameType => subFrameType._id.toString());

      // If any sub frame type ID is invalid, return an error
      const invalidSubFrameTypes = subFrameTypes.filter(subFrameTypeId => !validSubFrameTypeIds.includes(subFrameTypeId));
      if (invalidSubFrameTypes.length > 0) {
        return res.status(400).json({ message: `Invalid sub frame type IDs: ${invalidSubFrameTypes.join(', ')}` });
      }
    } else {
      return res.status(400).json({ message: 'Sub frame types must be an array with at least one valid ID.' });
    }

    // Validate sizes to make sure they are valid ObjectId references
    if (sizes && Array.isArray(sizes) && sizes.length > 0) {
      const validSizes = await Size.find({
        '_id': { $in: sizes }
      }).select('_id'); // Select only _id for validation

      const validSizeIds = validSizes.map(size => size._id.toString());

      // If any size ID is invalid, return an error
      const invalidSizes = sizes.filter(sizeId => !validSizeIds.includes(sizeId));
      if (invalidSizes.length > 0) {
        return res.status(400).json({ message: `Invalid size IDs: ${invalidSizes.join(', ')}` });
      }
    } else {
      return res.status(400).json({ message: 'Sizes must be an array with at least one valid ID.' });
    }

    // Create a new product with multiple frame types, sub frame types, and sizes
    const newProduct = new Product({
      productName,
      description,
      quantity,
      frameTypes, // Array of frame type IDs
      subFrameTypes, // Array of sub frame type IDs
      sizes, // Array of size IDs
      price,
      mainImage,
      thumbnails,
      subFrameImages, // Array of subframe image URLs
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error adding product:', err); // Log the full error
    res.status(500).json({ message: 'Error adding product', error: err.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const searchQuery = req.query.search;
    let products;
    if (searchQuery) {
      products = await Product.find({
        $or: [
          { productName: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
        ],
      })
        .populate('frameTypes', 'name')
        .populate('subFrameTypes', 'name', null, { strictPopulate: false })
        .populate('sizes', 'width height price', null, { strictPopulate: false })
        .populate('thumbnails', 'filename', null, { strictPopulate: false });
    } else {
      products = await Product.find()
        .populate('frameTypes', 'name')
        .populate('subFrameTypes', 'name', null, { strictPopulate: false })
        .populate('sizes', 'width height price', null, { strictPopulate: false })
        .populate('thumbnails', 'filename', null, { strictPopulate: false });
    }
    // Calculate total price for each product
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

const updateProduct = async (req, res) => {
  try {
    const { productName, description, quantity, frameTypes, subFrameTypes, sizes, price } = req.body;
    let mainImage = null;
    let thumbnails = [];

    // Handle file uploads if provided
    if (req.files.mainImage) {
      mainImage = await uploadImage(req.files.mainImage[0]);
    }

    if (req.files.thumbnails) {
      thumbnails = await Promise.all(req.files.thumbnails.map(file => uploadImage(file)));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { productName, description, quantity, frameTypes, subFrameTypes, sizes, price, mainImage, thumbnails },
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

    // Recalculate average rating
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

    // Group images by subframe type
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

    const product = await Product.findById(productId).populate('subFrameImages.subFrameType').populate('subFrameImages.frameType');
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
    const product = await Product.findById(productId).populate('subFrameTypes').populate('subFrameImages');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const subframeImages = product.subFrameTypes.map(subFrameType => {
      const subframeImage = product.subFrameImages.find(image => image.subFrameType.toString() === subFrameType._id.toString());
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
    const subFrameImage = product.subFrameImages.find(img => img.subFrameType.toString() === subFrameTypeId);
    if (!subFrameImage) {
      return res.status(404).json({ message: 'Subframe image not found' });
    }
    res.json({ imageUrl: subFrameImage.imageUrl });
  } catch (err) {
    console.error('Error fetching subframe image:', err);
    res.status(500).json({ message: 'Error fetching subframe image' });
  }
};

// Update the processExcelFile function to handle Cloudinary uploads
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

    // Process and upload images to Cloudinary
    const processedData = await Promise.all(sheetData.map(async (row) => {
      // Upload main image
      let mainImageUrl = '';
      if (row['MainImage']) {
        const publicId = path.basename(row['MainImage']).replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
        try {
          mainImageUrl = await uploadLocalToCloudinary(row['MainImage'], publicId);
        } catch (error) {
          console.error(`Error uploading main image for ${row['Product Name']}:`, error);
        }
      }

      // Upload thumbnails
      let thumbnailUrls = [];
      if (row['Thumbnails']) {
        const thumbnailPaths = row['Thumbnails'].split(',').map(t => t.trim());
        thumbnailUrls = await Promise.all(thumbnailPaths.map(async (thumbnailPath) => {
          const publicId = path.basename(thumbnailPath).replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
          try {
            return await uploadLocalToCloudinary(thumbnailPath, publicId);
          } catch (error) {
            console.error(`Error uploading thumbnail for ${row['Product Name']}:`, error);
            return '';
          }
        }));
      }

      // Process subframe images
      let subframeImageMap = [];
      if (row['SubframeImageMap']) {
        const mappings = row['SubframeImageMap'].split(',').map(mapping => {
          const [imagePath, frameType, subFrameType] = mapping.split(':');
          return { imagePath: imagePath.trim(), frameType: frameType.trim(), subFrameType: subFrameType.trim() };
        });

        subframeImageMap = await Promise.all(mappings.map(async (mapping) => {
          const publicId = path.basename(mapping.imagePath).replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
          try {
            const imageUrl = await uploadLocalToCloudinary(mapping.imagePath, publicId);
            return {
              ...mapping,
              imageUrl
            };
          } catch (error) {
            console.error(`Error uploading subframe image for ${row['Product Name']}:`, error);
            return mapping;
          }
        }));
      }

      return {
        ...row,
        mainImage: mainImageUrl,
        thumbnails: thumbnailUrls,
        subframeImageMap
      };
    }));

    // Clean up the temporary Excel file
    fs.unlinkSync(filePath);

    // Validate required fields using the correct field names from Excel
    const invalidProducts = processedData.filter(data => !data['Product Name'] || !data['Description'] || !data['MainImage']);
    if (invalidProducts.length > 0) {
      return res.status(400).json({ 
        message: 'Some products are missing required fields (Product Name, Description, or Main Image)',
        invalidProducts
      });
    }

    // Fetch and validate frame types
    const frameTypeDocs = await FrameType.find({
      name: { 
        $in: [...new Set(processedData.reduce((acc, d) => {
          const frameTypes = d['FrameTypes'] ? d['FrameTypes'].split(',').map(ft => ft.trim()) : [];
          return acc.concat(frameTypes);
        }, []))]
      }
    });
    const frameTypeMap = Object.fromEntries(frameTypeDocs.map(ft => [ft.name, ft._id]));

    // Fetch and validate sub frame types
    const subFrameTypeDocs = await SubFrameType.find({
      name: { 
        $in: [...new Set(processedData.reduce((acc, d) => {
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
    const products = processedData.map(data => {
      // Process subframe images with their mappings
      const subFrameImages = data.subframeImageMap.map(mapping => ({
        imageUrl: mapping.imageUrl,
        frameType: frameTypeMap[mapping.frameType],
        subFrameType: subFrameTypeMap[mapping.subFrameType.split(',')[0]] // Take first subframe type if multiple
      })).filter(img => img.frameType && img.subFrameType);

      return {
        productName: data['Product Name'],
        description: data['Description'],
        quantity: parseInt(data['Quantity'], 10) || 0,
        price: parseFloat(data['Price']) || 0,
        frameTypes: data['FrameTypes'] ? data['FrameTypes'].split(',').map(ft => frameTypeMap[ft.trim()]).filter(Boolean) : [],
        subFrameTypes: data['SubFrameTypes'] ? data['SubFrameTypes'].split(',').map(sft => subFrameTypeMap[sft.trim()]).filter(Boolean) : [],
        sizes: data['Sizes'] ? data['Sizes'].split(',').map(size => sizeMap[size.trim()]).filter(Boolean) : [],
        mainImage: data.mainImage,
        thumbnails: data.thumbnails.filter(Boolean),
        subFrameImages
      };
    });

    // Save products to database
    const savedProducts = await Product.insertMany(products);
    
    res.status(200).json({ 
      message: 'Products uploaded successfully', 
      count: savedProducts.length,
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