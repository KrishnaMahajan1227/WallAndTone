// UserController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { uploadBase64Image } = require('../utils/cloudinary');

// Sign up a new user
const signupUser = async (req, res) => {
  const { firstName, email, phone, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create and save the new user (password will be hashed automatically)
    const user = new User({
      firstName,
      email,
      phone,
      password, // This will be hashed automatically
      role: role || 'user', // Default role is 'user'
    });

    await user.save();
    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, firstName: user.firstName, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare entered password with stored hash
    const isMatch = await user.matchPassword(password);  // Use matchPassword method
    console.log('Password match result:', isMatch);  // Log match result for debugging

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token if passwords match
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all users (for admin only)
const getAllUsers = async (req, res) => {
    try {
      // Ensure the logged-in user has the required role
      if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ message: 'Access forbidden' });
      }
  
      const users = await User.find(); // Fetch all users
      res.status(200).json(users); // Return users
    } catch (error) {
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
  
  const getUserProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('+password'); // Include password in the query
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        firstName: user.firstName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        password: "",  // 🚨 Do NOT return actual password (security reasons)
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
// Update user profile
const updateUserProfile = async (req, res) => {
  const { firstName, email, phone, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    user.firstName = firstName || user.firstName;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    // If user wants to update password
    if (oldPassword && newPassword) {
      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }
      user.password = newPassword; // Password will be auto-hashed due to pre-save hook
    }

    await user.save();
    res.status(200).json({
      message: 'Profile updated successfully',
      user: { firstName: user.firstName, email: user.email, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
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
};
