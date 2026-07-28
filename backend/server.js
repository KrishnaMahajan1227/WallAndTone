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

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const promptRoutes = require("./routes/promptRoutes");
const promptPaymentRoutes = require("./routes/promptPaymentRoutes");

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

const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const serverStartTime = Date.now();
console.log("Server start time:", serverStartTime);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.iat && (decoded.iat * 1000) < serverStartTime) {
        socket.emit('forceLogout');
        console.log(`ForceLogout sent to socket ${socket.id}`);
      }
    } catch (err) {
      console.error("Error decoding token:", err);
      socket.emit('forceLogout');
    }
  }
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ===================================================================
// DIAGNOSTIC HELPER — logs exactly which route registration fails
// ===================================================================
function safeUse(label, ...args) {
  try {
    console.log(`⏳ Registering: ${label}`);
    app.use(...args);
    console.log(`✅ OK: ${label}`);
  } catch (err) {
    console.error(`❌❌❌ CRASHED while registering "${label}":`, err.message);
    console.error(err.stack);
    throw err; // rethrow so behavior stays the same, but now we have the culprit logged
  }
}

safeUse("userRoutes -> /api", '/api', userRoutes);
safeUse("productRoutes -> /api/products", '/api/products', productRoutes);
safeUse("secure endpoint -> /api/secure", '/api/secure', protectAdmin, protectUser, (req, res) => {
  res.json({ message: 'This is a secure endpoint!' });
});
safeUse("cartRoutes -> /api/cart", '/api/cart', cartRoutes);
safeUse("wishlistRoutes -> /api/wishlist", '/api/wishlist', wishlistRoutes);
safeUse("freepikRoutes -> /api/freepik", '/api/freepik', freepikRoutes);
safeUse("categoryRoutes -> /api", '/api', categoryRoutes);
safeUse("couponAdminRouter -> /api/admin/coupons", "/api/admin/coupons", couponAdminRouter);
safeUse("couponUserRouter -> /api/users/coupons", '/api/users/coupons', couponUserRouter);
safeUse("searchRoutes -> /api/search", '/api/search', searchRoutes);
safeUse("historyRoutes -> /api/history", '/api/history', historyRoutes);
safeUse("promptRoutes -> /api/prompts", '/api/prompts', promptRoutes);
safeUse("promptPaymentRoutes -> /api/prompt-payment", '/api/prompt-payment', promptPaymentRoutes);

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

app.post('/api/upload', uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ imageUrl: req.file.path });
});

const cloudinaryRoutes = require("./routes/cloudinaryRoutes");
safeUse("cloudinaryRoutes -> /api", "/api", cloudinaryRoutes);
safeUse("orderRoutes -> /api/orders", "/api/orders", orderRoutes);
safeUse("paymentRoutes -> /api/payment", "/api/payment", paymentRoutes);
safeUse("shiprocketAuthRoute -> /api/shiprocket", "/api/shiprocket", shiprocketAuthRoute);
safeUse("shiprocketOrderRoute -> /api/shiprocket", "/api/shiprocket", shiprocketOrderRoute);

const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});