const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary Storage for Images
const storageCloudinary = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Get user information from request
    const userId = req.user?._id;
    const timestamp = Date.now();
    
    // Create a clean filename
    const fileName = file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
    
    // Determine folder based on context
    let folder = 'products';
    if (req.path.includes('generated-images')) {
      folder = 'user-generated';
    }

    return {
      folder,
      public_id: userId ? `${userId}-${fileName}-${timestamp}` : `${fileName}-${timestamp}`,
      format: file.mimetype.split('/')[1],
      transformation: [{ quality: 'auto' }]
    };
  }
});

// Local Storage for Excel Files
const storageLocal = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/excel');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File Filters
const fileFilterImages = (req, file, cb) => {
  if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
    return cb(new Error('Only image files (JPG, PNG) are allowed!'), false);
  }
  cb(null, true);
};

const fileFilterExcel = (req, file, cb) => {
  if (!file.originalname.match(/\.(xlsx|xls)$/)) {
    return cb(new Error('Only Excel files are allowed!'), false);
  }
  cb(null, true);
};

// Multer Instances
const uploadExcel = multer({ 
  storage: storageLocal, 
  fileFilter: fileFilterExcel 
});

const uploadImage = multer({
  storage: storageCloudinary,
  fileFilter: fileFilterImages,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Helper function to upload local image to Cloudinary
const uploadLocalToCloudinary = async (imageData, userId, type = 'products') => {
  try {
    const timestamp = Date.now();
    const publicId = userId ? `${userId}-${timestamp}` : `upload-${timestamp}`;
    
    const result = await cloudinary.uploader.upload(imageData, {
      public_id: publicId,
      folder: type,
      resource_type: 'image',
      transformation: [{ quality: 'auto' }]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Helper function to upload base64 image to Cloudinary
const uploadBase64ToCloudinary = async (base64Data, userId, type = 'user-generated') => {
  try {
    const timestamp = Date.now();
    const publicId = userId ? `${userId}-generated-${timestamp}` : `generated-${timestamp}`;
    
    const result = await cloudinary.uploader.upload(base64Data, {
      public_id: publicId,
      folder: type,
      resource_type: 'image',
      transformation: [{ quality: 'auto' }]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading base64 to Cloudinary:', error);
    throw error;
  }
};

module.exports = { 
  uploadExcel, 
  uploadImage,
  uploadLocalToCloudinary,
  uploadBase64ToCloudinary
};