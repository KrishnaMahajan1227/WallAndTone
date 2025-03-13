const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const { protectAdmin, protectUser } = require('./middleware/authMiddleware');
const couponAdminRouter = require("./routes/couponAdmin");
const couponUserRouter = require("./routes/couponUser"); // NEW USER COUPON ROUTE
const freepikRoutes = require("./routes/freepikRoutes");
const categoryRoutes = require("./routes/FrameTypeRoutes");
// Removed: const sizeAdminRouter = require("./routes/sizeRoutes");
const searchRoutes = require('./routes/searchRoutes');
const historyRoutes = require('./routes/historyRoutes');
const multer = require('multer');
const upload = require('./middleware/upload');
const { uploadExcel, uploadImage, uploadReviewImage } = require('./middleware/upload');
const paymentRoutes = require("./routes/payment");
// Import Shiprocket routes
const shiprocketAuthRoute = require("./shiprocketAuth");
const shiprocketOrderRoute = require("./routes/shiprocketOrder");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// NEW: Import prompt management and prompt payment routes
const promptRoutes = require("./routes/promptRoutes");
const promptPaymentRoutes = require("./routes/promptPaymentRoutes");


const compression = require('compression');
app.use(compression({ threshold: 0 })); // compress everything regardless of size

// Middleware
app.use(express.json({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static File Serving (for product images)
app.use('/uploads', express.static('uploads'));

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));


  

// Routes
app.use('/api', userRoutes);
app.use('/api/products', productRoutes);

// Protected Routes Example
app.use('/api/secure', protectAdmin, protectUser, (req, res) => {
  res.json({ message: 'This is a secure endpoint!' });
});

app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Include Freepik Routes
app.use('/api/freepik', freepikRoutes);

// Use Category Routes
app.use('/api', categoryRoutes);

app.use("/api/admin/coupons", couponAdminRouter);
app.use('/api/users/coupons', couponUserRouter);  // Correct User Coupon Route

// Removed: app.use("/api/admin/sizes", sizeAdminRouter);

app.use('/api/search', searchRoutes);
app.use('/api/history', historyRoutes);

// NEW: Mount Prompt Management Routes
app.use('/api/prompts', promptRoutes);

// NEW: Mount Prompt Payment Routes (for purchasing prompts)
app.use('/api/prompt-payment', promptPaymentRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// ✅ Upload Route (using uploadImage middleware)
app.post('/api/upload', uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ imageUrl: req.file.path });
});

// Cloudinary Routes (if any)
const cloudinaryRoutes = require("./routes/cloudinaryRoutes");
app.use("/api", cloudinaryRoutes);
app.use("/api/orders", orderRoutes);



// Payment Routes
app.use("/api/payment", paymentRoutes);

// Shiprocket Routes
app.use("/api/shiprocket", shiprocketAuthRoute);
app.use("/api/shiprocket", shiprocketOrderRoute);


// Serve React Frontend (for production)
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

