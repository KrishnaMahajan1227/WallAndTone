const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware to protect admin routes
const protectAdmin = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(403).json({ message: 'Access forbidden. Admins only' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      return res.status(401).json 
({ message: 'Not authorized', error: error.message });
    }
  }
};

// Middleware to protect user routes
const protectUser  = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Authorization token is missing' });

    }

    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User  not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log(req.headers.authorization);
      return res.status(401).json({ message: 'Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else {
      return res.status(401).json({ message: 'Not authorized', error: error.message });
    }
  }
};

module.exports = { protectAdmin, protectUser  };