module.exports = {
    apps: [
      {
        name: 'backend',
        script: './server.js', // Path to your server.js file
        env: {
          MONGO_URI: process.env.MONGO_URI,
          JWT_SECRET: process.env.JWT_SECRET,
          PORT: process.env.PORT,
          FREEPIK_API_KEY: process.env.FREEPIK_API_KEY,
          CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
          CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
          CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
          CLOUDINARY_URL: process.env.CLOUDINARY_URL
        }
      }
    ]
  };
  