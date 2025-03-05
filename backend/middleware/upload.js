const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// =================== Cloudinary Configuration ===================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// =================== Cloudinary Storage Configurations ===================

// Storage for Products (Images)
const storageCloudinary = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const timestamp = Date.now();
    const fileName = file.originalname
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "_");
    
    return {
      folder: 'products',
      public_id: `${fileName}-${timestamp}`,
      format: file.mimetype.split('/')[1],
      transformation: [{ quality: 'auto' }]
    };
  }
});

// Storage for Personalized Images
const personalizedStorageCloudinary = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const timestamp = Date.now();
    const fileName = file.originalname
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "_");

    return {
      folder: 'personalized_uploads',
      public_id: `personalized-${fileName}-${timestamp}`,
      format: file.mimetype.split('/')[1],
      transformation: [{ quality: 'auto' }]
    };
  }
});

// =================== Local Storage for Excel Files ===================
const storageLocal = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'excel');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// =================== File Filters ===================
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

// =================== Multer Instances ===================
const uploadExcel = multer({ 
  storage: storageLocal, 
  fileFilter: fileFilterExcel 
});

const uploadImage = multer({
  storage: storageCloudinary,
  fileFilter: fileFilterImages,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Helper instance: for uploading personalized images
// Renamed to avoid naming conflicts with any route handlers.
const uploadPersonalizedImageMulter = multer({ 
  storage: personalizedStorageCloudinary, 
  fileFilter: fileFilterImages, 
  limits: { fileSize: 50 * 1024 * 1024 } 
});

const uploadReviewImage = multer({
  storage: storageCloudinary,  // Ensuring images are stored in Cloudinary
  fileFilter: fileFilterImages,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// =================== Helper Functions ===================

// Normalize a file path by checking common locations.
const normalizePath = (filePath) => {
  try {
    if (!filePath) return null;

    let normalized = filePath
      .trim()
      .replace(/^[a-zA-Z]:/i, '')
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/')
      .replace(/["']/g, '')
      .trim();

    const filename = path.basename(normalized);
    const possiblePaths = [
      path.join(process.cwd(), 'uploads', filename),
      path.join(process.cwd(), normalized),
      normalized
    ];

    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        console.log('Found file at:', testPath);
        return testPath;
      }
    }

    console.error('File not found in any of these locations:', possiblePaths);
    return null;
  } catch (error) {
    console.error('Error normalizing path:', error);
    return null;
  }
};

// Upload a local image file to Cloudinary with retries.
const uploadLocalToCloudinary = async (imagePath, publicId) => {
  try {
    if (!imagePath) {
      console.error('No image path provided');
      return null;
    }

    console.log('Attempting to upload:', imagePath);

    const normalizedPath = normalizePath(imagePath);
    if (!normalizedPath) {
      console.error('Failed to normalize path:', imagePath);
      return null;
    }

    try {
      await fs.promises.access(normalizedPath, fs.constants.R_OK);
    } catch (error) {
      console.error(`File not accessible: ${normalizedPath}`, error);
      return null;
    }

    const ext = path.extname(normalizedPath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      console.error(`Invalid file type: ${ext}`);
      return null;
    }

    const stats = await fs.promises.stat(normalizedPath);
    if (stats.size > 50 * 1024 * 1024) {
      console.error(`File too large: ${normalizedPath}`);
      return null;
    }

    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        const result = await cloudinary.uploader.upload(normalizedPath, {
          public_id: publicId,
          folder: 'products',
          resource_type: 'image',
          transformation: [{ quality: 'auto' }]
        });

        if (!result || !result.secure_url) {
          throw new Error('Upload failed - no secure URL returned');
        }

        console.log('Successfully uploaded to Cloudinary:', result.secure_url);
        return result.secure_url;
      } catch (error) {
        lastError = error;
        console.error(`Upload attempt failed (${retries} retries left):`, error);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }

    console.error('All upload attempts failed:', lastError);
    return null;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};

// =================== Verify Cloudinary Configuration ===================
cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', {
  folder: 'test'
}).then(() => {
  console.log('Cloudinary configuration verified successfully');
}).catch(error => {
  console.error('Cloudinary configuration error:', error);
  throw error;
});

module.exports = { 
  uploadExcel, 
  uploadImage,
  uploadLocalToCloudinary,
  uploadReviewImage,
  uploadPersonalizedImageMulter,
};
