// UserController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { uploadBase64Image } = require('../utils/cloudinary');
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Sign up a new user
const signupUser = async (req, res) => {
  const { firstName, email, phone, password, role } = req.body;

  // Inline validations
  if (!firstName || firstName.trim().length < 2) {
    return res.status(400).json({ message: 'First Name is required and must be at least 2 characters long' });
  }

  if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
    return res.status(400).json({ message: 'A valid email address is required' });
  }

  if (!phone || !/^\d{10}$/.test(phone.trim())) {
    return res.status(400).json({ message: 'Phone number is required and must be exactly 10 digits' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return res.status(400).json({ message: 'Password must include at least one capital letter' });
  }
  if (!/(?=.*\d)/.test(password)) {
    return res.status(400).json({ message: 'Password must include at least one number' });
  }
  if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
    return res.status(400).json({ message: 'Password must include at least one special character' });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user. The password is assumed to be hashed in a pre-save hook.
    const user = new User({
      firstName,
      email,
      phone,
      password, // Password hashing should be handled in the User model middleware.
      role: role || 'user',
    });

    await user.save();

    // Respond with success message and limited user info.
    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Inline validations
  if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
    return res.status(400).json({ message: 'A valid email address is required' });
  }
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    // Find the user by email.
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare entered password with stored hash using a model instance method.
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token (expires in 24h)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};



// **🔹 Get All Users (Admin & Superadmin)**
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    const users = await User.find().select('-password'); // Exclude password

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Update user (for admin only)
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, email, phone, role } = req.body;

  try {
    // Check if the logged-in user has the necessary permissions
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied, not an admin' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    user.firstName = firstName || user.firstName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;

    await user.save();
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
    const { id } = req.params; // Get the user id from the request parameters
  
    try {
      // Ensure the logged-in user has admin rights
      if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Access denied' });
      }
  
      // Find and delete the user by ID
      const user = await User.findByIdAndDelete(id);
      
      // Check if user exists before attempting deletion
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  };
  
// **🔹 Get User Profile**
// **🔹 Get User Profile**
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); // Exclude password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      remainingPrompts: user.remainingPrompts, // Added remaining prompts
      personalizedImages: user.personalizedImages, // User's uploaded images
      shippingDetails: user.shippingDetails, // Include shipping details
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// **🔹 Update User Profile**
const updateUserProfile = async (req, res) => {
  try {
    const { firstName, email, phone, oldPassword, newPassword, shippingDetails } = req.body;
    
    // ✅ Find User
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Update Basic Details (only if provided)
    if (firstName) user.firstName = firstName;
    if (phone) user.phone = phone;

    // ✅ Check if the new email already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }
      user.email = email;
    }

    // ✅ Handle Password Update
    if (oldPassword && newPassword) {
      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      user.password = newPassword; // Password will be auto-hashed due to pre-save hook
    }

    // ✅ Update Shipping Details (if provided)
    if (shippingDetails) {
      user.shippingDetails = {
        shippingAddress: shippingDetails.shippingAddress || user.shippingDetails?.shippingAddress || '',
        billingAddress: shippingDetails.billingAddress || user.shippingDetails?.billingAddress || '',
        city: shippingDetails.city || user.shippingDetails?.city || '',
        pincode: shippingDetails.pincode || user.shippingDetails?.pincode || '',
        state: shippingDetails.state || user.shippingDetails?.state || '',
        country: shippingDetails.country || user.shippingDetails?.country || 'India', // Default to 'India'
      };
    }

    // ✅ Save Updated User Data
    await user.save();

    // ✅ Return Updated Profile
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        email: user.email,
        phone: user.phone,
        shippingDetails: user.shippingDetails, // Return updated shipping details
      },
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Store for temporary upload chunks
const uploadChunks = new Map();

// Add image chunk
const addImageChunk = async (req, res) => {
  try {
    
    const userId = req.user._id;
    const { image, prompt, chunkIndex, totalChunks, isLastChunk } = req.body;

    if (!image || !prompt || chunkIndex === undefined || !totalChunks) {
      return res.status(400).json({ message: 'Missing required chunk data' });
    }

    const chunkKey = `${userId}_${prompt}_${Date.now()}`;
    
    if (chunkIndex === 0) {
      // Initialize new array for chunks
      uploadChunks.set(chunkKey, []);
    }

    const chunks = uploadChunks.get(chunkKey);
    if (!chunks) {
      return res.status(400).json({ message: 'Invalid chunk sequence' });
    }

    // Store the chunk
    chunks[chunkIndex] = image;

    // If this is the last chunk, process the complete image
    if (isLastChunk) {
      const completeImage = chunks.join('');
      uploadChunks.delete(chunkKey); // Clean up chunks

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const sanitizedPrompt = prompt.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
      const timestamp = Date.now();
      const publicId = `user-generated/${userId}/${sanitizedPrompt}-${timestamp}`;

      try {
        const uploadResult = await uploadBase64Image(
          `data:image/png;base64,${completeImage}`,
          'user-generated',
          publicId
        );

        const newImage = {
          imageUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          prompt,
          createdAt: new Date()
        };

        user.generatedImages.push(newImage);
        await user.save();

        return res.status(200).json({
          message: 'Image saved successfully',
          image: newImage
        });
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          message: 'Failed to upload image',
          error: uploadError.message 
        });
      }
    }

    // For non-final chunks, just acknowledge receipt
    res.status(200).json({ 
      message: 'Chunk received',
      chunkIndex,
      remainingChunks: totalChunks - (chunkIndex + 1)
    });

  } catch (error) {
    console.error('Error processing image chunk:', error);
    res.status(500).json({ 
      message: 'Error processing chunk', 
      error: error.message 
    });
  }
};

// Add generated image to user's collection
const addGeneratedImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { image, prompt } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({ message: 'Image and prompt are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sanitizedPrompt = prompt.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
    const timestamp = Date.now();
    const publicId = `/${userId}/${sanitizedPrompt}-${timestamp}`;

    try {
      const uploadResult = await uploadBase64Image(
        image,
        'user-generated',
        publicId,
        {
          chunk_size: 10000000, // 10MB chunks
          timeout: 120000 // 2 minutes timeout
        }
      );

      const newImage = {
        imageUrl: uploadResult.url,
        publicId: uploadResult.public_id,
        prompt,
        createdAt: new Date()
      };

      user.generatedImages.push(newImage);
      await user.save();

      res.status(200).json({
        message: 'Image saved successfully',
        image: newImage
      });
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({ 
        message: 'Failed to upload image',
        error: uploadError.message 
      });
    }
  } catch (error) {
    console.error('Error saving generated image:', error);
    res.status(500).json({ 
      message: 'Error saving image', 
      error: error.message 
    });
  }
};

// Get user's generated images
const getGeneratedImages = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('generatedImages');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      images: user.generatedImages
    });
  } catch (error) {
    console.error('Error fetching generated images:', error);
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
};

// Delete a single generated image
const deleteGeneratedImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { imageId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out the image to be deleted
    user.generatedImages = user.generatedImages.filter(img => img._id.toString() !== imageId);

    await user.save();

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting generated image:", error);
    res.status(500).json({ message: "Error deleting image", error: error.message });
  }
};

const deleteAllGeneratedImages = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    await axios.delete(`${apiUrl}/api/users/generated-images`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUserGeneratedImages([]);
  } catch (error) {
    console.error("Error deleting all images:", error);
  }
};
// **🔹 Upload Personalized Image**
const uploadPersonalizedImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const imageFile = req.file; // ✅ Get the uploaded file

    if (!imageFile) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const timestamp = Date.now();
    const publicId = `personalized_uploads/${userId}/personalized-${timestamp}`;

    // ✅ Upload file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
      public_id: publicId,
      folder: "personalized_uploads",
      resource_type: "image",
      quality: "auto",
      transformation: [{ width: 1200, crop: "limit" }],
    });

    // ✅ Delete the local file after upload
    fs.unlinkSync(imageFile.path);

    // ✅ Save uploaded image details in user database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPersonalizedImage = {
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      createdAt: new Date(),
    };

    user.personalizedImages.push(newPersonalizedImage);
    await user.save();

    res.status(200).json({
      message: "Personalized image uploaded successfully",
      image: newPersonalizedImage,
    });
  } catch (error) {
    console.error("Error uploading personalized image:", error);
    res.status(500).json({ message: "Error uploading image", error: error.message });
  }
};

// **🔹 Get User's Personalized Images**
const getPersonalizedImages = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('personalizedImages');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ images: user.personalizedImages });
  } catch (error) {
    console.error('Error fetching personalized images:', error);
    res.status(500).json({ message: 'Error fetching images', error: error.message });
  }
};

// **🔹 Delete a Personalized Image**
const deletePersonalizedImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { imageId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the image to delete
    const image = user.personalizedImages.find(img => img._id.toString() === imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Remove from user data
    user.personalizedImages = user.personalizedImages.filter(img => img._id.toString() !== imageId);
    await user.save();

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting personalized image:', error);
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
};
  
// Export the functions
module.exports = {
  signupUser ,
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
};
