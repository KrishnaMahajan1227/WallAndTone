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
const couponUserRouter = require("./routes/couponUser");
const freepikRoutes = require("./routes/freepikRoutes");
const categoryRoutes = require("./routes/FrameTypeRoutes");
const searchRoutes = require('./routes/searchRoutes');
const historyRoutes = require('./routes/historyRoutes');
const multer = require('multer');
const upload = require('./middleware/upload');
const { uploadExcel, uploadImage, uploadReviewImage } = require('./middleware/upload');
const paymentRoutes = require("./routes/payment");
const shiprocketAuthRoute = require("./shiprocketAuth");
const shiprocketOrderRoute = require("./routes/shiprocketOrder");
const orderRoutes = require("./routes/orderRoutes");
const promptRoutes = require("./routes/promptRoutes");
const promptPaymentRoutes = require("./routes/promptPaymentRoutes");
const cloudinaryRoutes = require("./routes/cloudinaryRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const compression = require('compression');
app.use(compression({ threshold: 0 }));

app.use(express.json({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/uploads', express.static('uploads'));

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ===================================================================
// NOTE ON SOCKET.IO: Removed from the Vercel serverless path.
// Serverless functions are stateless/short-lived per request — they
// cannot hold a persistent WebSocket connection open, so Socket.IO
// simply cannot work here regardless of code changes. If you need
// real-time features (e.g. forced logout, live notifications), that
// piece needs to run on a persistent host (Render/Railway/a small VPS)
// separately from this Vercel-hosted REST API.
// ===================================================================

app.use('/api', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/secure', protectAdmin, protectUser, (req, res) => {
  res.json({ message: 'This is a secure endpoint!' });
});
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/freepik', freepikRoutes);
app.use('/api', categoryRoutes);
app.use("/api/admin/coupons", couponAdminRouter);
app.use('/api/users/coupons', couponUserRouter);
app.use('/api/search', searchRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/prompt-payment', promptPaymentRoutes);

app.post('/api/upload', uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ imageUrl: req.file.path });
});

app.use("/api", cloudinaryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/shiprocket", shiprocketAuthRoute);
app.use("/api/shiprocket", shiprocketOrderRoute);

// Generic error handler — must come after routes
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Serve frontend build only when running as a traditional server (local/other hosts).
// On Vercel, the frontend is served by the "frontend" service via vercel.json rewrites,
// so this static-serving block is skipped there.
if (!process.env.VERCEL) {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ===================================================================
// KEY CHANGE: export the app for Vercel's serverless handler to use,
// and only call app.listen() when actually running as a normal Node
// process (local dev, or a traditional host like Render/Railway).
// Vercel sets the VERCEL env var automatically in its build/runtime,
// so this check reliably tells the two cases apart.
// ===================================================================
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
}

module.exports = app;