console.log('📄 userRoutes.js: file execution STARTED');
const express = require('express');
console.log('📄 userRoutes.js: express required, typeof express:', typeof express, 'typeof express.Router:', typeof express.Router);

let userControllerModule;
try {
  userControllerModule = require('../controllers/userController');
  console.log('📄 userRoutes.js: userController required OK, keys:', Object.keys(userControllerModule));
} catch (e) {
  console.log('📄 userRoutes.js: userController require THREW:', e.message);
  throw e;
}

const {
  signupUser,
  loginUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  addGeneratedImage,
  getGeneratedImages,
  addImageChunk,
  deleteGeneratedImage,
  deleteAllGeneratedImages,
  uploadPersonalizedImage,
  getPersonalizedImages,
  deletePersonalizedImage,
  forgotPassword,
  resetPassword
} = userControllerModule;

const router = express.Router();
console.log('📄 userRoutes.js: router created, typeof router:', typeof router, 'has stack:', !!router.stack);

let authMiddlewareModule;
try {
  authMiddlewareModule = require('../middleware/authMiddleware');
  console.log('📄 userRoutes.js: authMiddleware required OK, keys:', Object.keys(authMiddlewareModule));
} catch (e) {
  console.log('📄 userRoutes.js: authMiddleware require THREW:', e.message);
  throw e;
}
const { protectAdmin, protectUser } = authMiddlewareModule;
const multer = require("multer");
const nodemailer = require('nodemailer');
const fs = require('fs');

// Routes
router.post('/signup', signupUser);
router.post('/login', loginUser);

// Protect these routes to ensure only admins can access
router.get('/users', protectAdmin, getAllUsers);

// Update and delete routes with admin protection
router.put('/users/:id', protectAdmin, updateUser);
router.delete('/users/:id', protectAdmin, deleteUser);

// Profile routes for viewing and updating profile
router.get('/profile', protectUser, getUserProfile);
router.put('/profile/update', protectUser, updateUserProfile);

// Generated images routes
router.post('/users/generated-images', protectUser, addGeneratedImage);
router.post('/users/generated-images/chunk', protectUser, addImageChunk);
router.get('/users/generated-images', protectUser, getGeneratedImages);
router.delete("/users/generated-images/:imageId", protectUser, deleteGeneratedImage);
router.delete("/users/generated-images", protectUser, deleteAllGeneratedImages);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Multer Storage for Uploads
const upload = multer({ dest: "uploads/" });

// Controller for sending the image via email to the admin email
const sendEmail = async (req, res) => {
  try {
    const imageFile = req.file;
    // Use the ADMIN_EMAIL from env variables as the recipient.
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail || !imageFile) {
      return res.status(400).json({ message: 'Admin email and image file are required.' });
    }

    // Configure Nodemailer transporter with your SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g., smtpout.secureserver.net
      port: Number(process.env.SMTP_PORT), // e.g., 465
      secure: true, // true for port 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // e.g., hello@wallandtone.com
        pass: process.env.SMTP_PASS, // e.g., Ramkrish1227@
      },
    });

    // Email options with the admin email as recipient
    const mailOptions = {
      from: process.env.EMAIL_FROM, // e.g., hello@wallandtone.com
      to: adminEmail,
      subject: 'User Uploaded Image',
      text: 'Please find the uploaded image attached.',
      attachments: [
        {
          filename: imageFile.originalname,
          path: imageFile.path,
        },
      ],
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Remove the file from the server after sending the email
    fs.unlink(imageFile.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.json({ message: 'Email sent successfully to admin.' });
  } catch (err) {
    console.error('Error in sendEmail:', err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};

// Route definitions
router.post("/users/send-email", protectUser, upload.single("image"), sendEmail);

// Personalized Image Upload Routes
router.post("/users/personalized-images", protectUser, upload.single("image"), uploadPersonalizedImage);
router.get('/users/personalized-images', protectUser, getPersonalizedImages);
router.delete('/users/personalized-images/:imageId', protectUser, deletePersonalizedImage);

console.log('📄 userRoutes.js: about to export, typeof router:', typeof router, 'stack length:', router.stack ? router.stack.length : 'NO STACK');
module.exports = router;
console.log('📄 userRoutes.js: file execution FINISHED, exported successfully');