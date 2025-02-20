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
const freepikRoutes = require("./routes/freepikRoutes");
const categoryRoutes = require("./routes/FrameTypeRoutes")
const sizeAdminRouter = require("./routes/sizeRoutes");
const searchRoutes = require('./routes/searchRoutes');
const historyRoutes = require('./routes/historyRoutes');
const multer = require('multer'); 
const upload = require('./middleware/upload'); 
const { uploadExcel, uploadImage } = require('./middleware/upload');

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors()); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static File Serving (for product images)
app.use('/uploads', express.static('uploads'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api', userRoutes); 
app.use('/api/products', productRoutes);

// Protected Routes Example
app.use('/api/secure', protectAdmin, protectUser , (req, res) => {
  res.json({ message: 'This is a secure endpoint!' });
});

app.use('/api/cart', cartRoutes);

app.use('/api/wishlist', wishlistRoutes);

// Include Freepik Routes
app.use('/api/freepik', freepikRoutes);

// Use Category Routes
app.use('/api', categoryRoutes);

app.use("/api/admin/coupons", couponAdminRouter);
app.use("/api/admin/sizes", sizeAdminRouter);


// Add these routes to your app
app.use('/api/search', searchRoutes);
app.use('/api/history', historyRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});


// ✅ Upload Route (Now correctly defined after `upload` is set)
app.post('/api/upload', uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ imageUrl: req.file.path }); // Return Cloudinary URL
});


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