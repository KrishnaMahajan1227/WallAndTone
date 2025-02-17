const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage for Images
const storageCloudinary = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const timestamp = Date.now();
    const fileName = file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
    
    return {
      folder: 'products',
      public_id: `${fileName}-${timestamp}`,
      format: file.mimetype.split('/')[1],
      transformation: [{ quality: 'auto' }]
    };
  }
});

// Local Storage for Excel Files
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

// Helper function to normalize file path
const normalizePath = (filePath) => {
  try {
    if (!filePath) return null;

    // Clean the path string
    let normalized = filePath
      .trim()
      .replace(/^[a-zA-Z]:/i, '')
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/')
      .replace(/["']/g, '')
      .trim();

    // Extract the filename from the path
    const filename = path.basename(normalized);

    // Look for the file in multiple possible locations
    const possiblePaths = [
      path.join(process.cwd(), 'uploads', filename),
      path.join(process.cwd(), normalized),
      normalized
    ];

    // Find the first path that exists
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

// Helper function to upload local image to Cloudinary
const uploadLocalToCloudinary = async (imagePath, publicId) => {
  try {
    if (!imagePath) {
      console.error('No image path provided');
      return null;
    }

    console.log('Attempting to upload:', imagePath);

    // Normalize the path
    const normalizedPath = normalizePath(imagePath);
    if (!normalizedPath) {
      console.error('Failed to normalize path:', imagePath);
      return null;
    }

    // Ensure the file exists and is readable
    try {
      await fs.promises.access(normalizedPath, fs.constants.R_OK);
    } catch (error) {
      console.error(`File not accessible: ${normalizedPath}`, error);
      return null;
    }

    // Validate file type
    const ext = path.extname(normalizedPath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      console.error(`Invalid file type: ${ext}`);
      return null;
    }

    // Read file stats
    const stats = await fs.promises.stat(normalizedPath);
    if (stats.size > 50 * 1024 * 1024) { // 50MB limit
      console.error(`File too large: ${normalizedPath}`);
      return null;
    }

    // Upload to Cloudinary with retries
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

// Verify Cloudinary configuration
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
  uploadLocalToCloudinary
};