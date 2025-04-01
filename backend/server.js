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
const jwt = require('jsonwebtoken'); // Added for token decoding

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Set a global variable with the server start time (in milliseconds)
const serverStartTime = Date.now();
console.log("Server start time:", serverStartTime);

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Check if the client provided a token in the socket handshake auth.
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      // Decode token (we assume token contains an "iat" field in seconds)
      const decoded = jwt.decode(token);
      if (decoded && decoded.iat && (decoded.iat * 1000) < serverStartTime) {
        // Token was issued before the server started; force logout.
        socket.emit('forceLogout');
        console.log(`ForceLogout sent to socket ${socket.id} (token issued at ${decoded.iat * 1000}, before serverStartTime ${serverStartTime})`);
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
app.use("/api", cloudinaryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/shiprocket", shiprocketAuthRoute);
app.use("/api/shiprocket", shiprocketOrderRoute);

const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
