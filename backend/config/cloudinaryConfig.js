// coludinaryConfig.js
const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Load environment variables

cloudinary.config({
    cloud_name:'dxpf8q672',
    api_key:'771198159589657',
    api_secret:'jcJJ3RVs_voYGrhukfc-laf_mOU',
});

module.exports = cloudinary;
