const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'superadmin'], default: 'user' },

  // Generated images from AI
  generatedImages: [{
    imageUrl: String,
    publicId: String,
    prompt: String,
    createdAt: { type: Date, default: Date.now }
  }],
  // Shipping Details
  shippingDetails: [{
    shippingAddress: { type: String},
    billingAddress: { type: String},
    city: { type: String},
    pincode: { type: String},
    state: { type: String},
    country: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  // Personalized images uploaded by the user
  personalizedImages: [{
    imageUrl: { type: String, required: true },  // Cloudinary URL
    publicId: { type: String, required: true },  // Cloudinary public ID for easy deletion
    createdAt: { type: Date, default: Date.now }
  }],
  remainingPrompts: { type: Number, default: 10 }, // Har user ko 10 prompts se start karne ke liye
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }

}, { timestamps: true });

// Password hashing before saving user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
