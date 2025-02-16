const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadBase64Image = async (base64String, folder = 'general', publicId = null, options = {}) => {
  try {
    const base64Data = base64String.startsWith('data:image/') 
      ? base64String 
      : `data:image/png;base64,${base64String}`;

    const uploadOptions = {
      folder,
      resource_type: 'auto',
      quality: 'auto:good',
      fetch_format: 'auto',
      flags: 'lossy',
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto' }
      ],
      chunk_size: options.chunk_size || 6000000, // 6MB chunks by default
      timeout: options.timeout || 60000 // 60 seconds timeout by default
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(base64Data, uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadBase64Image
};