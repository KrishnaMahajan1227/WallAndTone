const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dxpf8q672',
  api_key: '771198159589657',
  api_secret: 'jcJJ3RVs_voYGrhukfc-laf_mOU'
});


// Verify configuration
if (!cloudinary.config().cloud_name) {
  throw new Error('Cloudinary configuration failed');
}

const uploadBase64Image = async (input, folder = 'general', publicId = null, options = {}) => {
  try {
    const isBase64 = input.startsWith('data:image/');
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
      chunk_size: options.chunk_size || 6000000,
      timeout: options.timeout || 60000,
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(input, uploadOptions, (error, result) => {
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
