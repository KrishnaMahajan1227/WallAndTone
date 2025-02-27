const express = require('express');
const { signupUser ,
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
} = require('../controllers/userController');
const router = express.Router();
const { protectAdmin, protectUser  } = require('../middleware/authMiddleware');
const multer = require("multer");

// Routes
router.post('/signup', signupUser );
router.post('/login', loginUser);

// Protect these routes to ensure only admins can access
router.get('/users', protectAdmin, getAllUsers);

// Update and delete routes with admin protection
router.put('/users/:id', protectAdmin, updateUser);
router.delete('/users/:id', protectAdmin, deleteUser);

// Profile routes for viewing and updating profile
router.get('/profile', protectUser , getUserProfile);  // Get profile details
router.put('/profile', protectUser , updateUserProfile);  // Update profile details

// Generated images routes
router.post('/users/generated-images', protectUser, addGeneratedImage);
router.post('/users/generated-images/chunk', protectUser, addImageChunk);
router.get('/users/generated-images', protectUser, getGeneratedImages);
router.delete("/users/generated-images/:imageId", protectUser, deleteGeneratedImage);
router.delete("/users/generated-images", protectUser, deleteAllGeneratedImages);
// **🔹 Multer Storage for Uploads**
const upload = multer({ dest: "uploads/" });

// **🔹 Personalized Image Upload Routes**
router.post("/users/personalized-images", protectUser, upload.single("image"), uploadPersonalizedImage);

router.get('/users/personalized-images', protectUser, getPersonalizedImages);
router.delete('/users/personalized-images/:imageId', protectUser, deletePersonalizedImage);

module.exports = router;
