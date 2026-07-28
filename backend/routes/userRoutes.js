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

// Log the type of every single controller function we pulled out above.
// If any of these prints "undefined", THAT is our culprit.
console.log('📄 CHECK signupUser:', typeof signupUser);
console.log('📄 CHECK loginUser:', typeof loginUser);
console.log('📄 CHECK getAllUsers:', typeof getAllUsers);
console.log('📄 CHECK updateUser:', typeof updateUser);
console.log('📄 CHECK deleteUser:', typeof deleteUser);
console.log('📄 CHECK getUserProfile:', typeof getUserProfile);
console.log('📄 CHECK updateUserProfile:', typeof updateUserProfile);
console.log('📄 CHECK addGeneratedImage:', typeof addGeneratedImage);
console.log('📄 CHECK getGeneratedImages:', typeof getGeneratedImages);
console.log('📄 CHECK addImageChunk:', typeof addImageChunk);
console.log('📄 CHECK deleteGeneratedImage:', typeof deleteGeneratedImage);
console.log('📄 CHECK deleteAllGeneratedImages:', typeof deleteAllGeneratedImages);
console.log('📄 CHECK uploadPersonalizedImage:', typeof uploadPersonalizedImage);
console.log('📄 CHECK getPersonalizedImages:', typeof getPersonalizedImages);
console.log('📄 CHECK deletePersonalizedImage:', typeof deletePersonalizedImage);
console.log('📄 CHECK forgotPassword:', typeof forgotPassword);
console.log('📄 CHECK resetPassword:', typeof resetPassword);

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
console.log('📄 CHECK protectAdmin:', typeof protectAdmin);
console.log('📄 CHECK protectUser:', typeof protectUser);

const multer = require("multer");
console.log('📄 CHECKPOINT 1: multer required, typeof:', typeof multer);
const nodemailer = require('nodemailer');
console.log('📄 CHECKPOINT 2: nodemailer required, typeof:', typeof nodemailer);
const fs = require('fs');
console.log('📄 CHECKPOINT 3: fs required, typeof:', typeof fs);

// Routes
router.post('/signup', signupUser);
console.log('📄 CHECKPOINT 4: /signup registered');
router.post('/login', loginUser);
console.log('📄 CHECKPOINT 5: /login registered');

router.get('/users', protectAdmin, getAllUsers);
console.log('📄 CHECKPOINT 6: GET /users registered');

router.put('/users/:id', protectAdmin, updateUser);
console.log('📄 CHECKPOINT 7: PUT /users/:id registered');
router.delete('/users/:id', protectAdmin, deleteUser);
console.log('📄 CHECKPOINT 8: DELETE /users/:id registered');

router.get('/profile', protectUser, getUserProfile);
console.log('📄 CHECKPOINT 9: GET /profile registered');
router.put('/profile/update', protectUser, updateUserProfile);
console.log('📄 CHECKPOINT 10: PUT /profile/update registered');

router.post('/users/generated-images', protectUser, addGeneratedImage);
console.log('📄 CHECKPOINT 11: POST /users/generated-images registered');
router.post('/users/generated-images/chunk', protectUser, addImageChunk);
console.log('📄 CHECKPOINT 12: POST /users/generated-images/chunk registered');
router.get('/users/generated-images', protectUser, getGeneratedImages);
console.log('📄 CHECKPOINT 13: GET /users/generated-images registered');
router.delete("/users/generated-images/:imageId", protectUser, deleteGeneratedImage);
console.log('📄 CHECKPOINT 14: DELETE /users/generated-images/:imageId registered');
router.delete("/users/generated-images", protectUser, deleteAllGeneratedImages);
console.log('📄 CHECKPOINT 15: DELETE /users/generated-images registered');
router.post('/forgot-password', forgotPassword);
console.log('📄 CHECKPOINT 16: POST /forgot-password registered');
router.post('/reset-password', resetPassword);
console.log('📄 CHECKPOINT 17: POST /reset-password registered');

// Multer Storage for Uploads
// NOTE: Vercel's serverless filesystem is read-only except for the OS temp
// directory. A relative "uploads/" path fails there (read-only filesystem),
// which is what was crashing this whole file on Vercel. Using os.tmpdir()
// works both locally and on Vercel.
const os = require('os');
const path = require('path');
const upload = multer({ dest: path.join(os.tmpdir(), 'uploads') });
console.log('📄 CHECKPOINT 18: multer upload instance created');

// Controller for sending the image via email to the admin email
const sendEmail = async (req, res) => {
  try {
    const imageFile = req.file;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail || !imageFile) {
      return res.status(400).json({ message: 'Admin email and image file are required.' });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
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

    await transporter.sendMail(mailOptions);

    fs.unlink(imageFile.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.json({ message: 'Email sent successfully to admin.' });
  } catch (err) {
    console.error('Error in sendEmail:', err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};
console.log('📄 CHECKPOINT 19: sendEmail function defined, typeof:', typeof sendEmail);

router.post("/users/send-email", protectUser, upload.single("image"), sendEmail);
console.log('📄 CHECKPOINT 20: POST /users/send-email registered');

router.post("/users/personalized-images", protectUser, upload.single("image"), uploadPersonalizedImage);
console.log('📄 CHECKPOINT 21: POST /users/personalized-images registered');
router.get('/users/personalized-images', protectUser, getPersonalizedImages);
console.log('📄 CHECKPOINT 22: GET /users/personalized-images registered');
router.delete('/users/personalized-images/:imageId', protectUser, deletePersonalizedImage);
console.log('📄 CHECKPOINT 23: DELETE /users/personalized-images/:imageId registered');

console.log('📄 userRoutes.js: about to export, typeof router:', typeof router, 'stack length:', router.stack ? router.stack.length : 'NO STACK');
module.exports = router;
console.log('📄 userRoutes.js: file execution FINISHED, exported successfully');
