const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protectUser, protectAdmin } = require("../middleware/authMiddleware");

// @desc    Create an Order (after successful order confirmation)
// @route   POST /api/orders/create
router.post("/create", protectUser, async (req, res) => {
  try {
    // Expect order details from the checkout process
    const {
      orderItems,
      totalPrice,
      shippingCost,
      taxAmount,
      discountAmount,
      finalTotal,
      shippingAddress,
      trackingId, // from Shiprocket
    } = req.body;

    // Basic validations
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }
    if (!finalTotal) {
      return res.status(400).json({ message: "Final total is required" });
    }

    const order = new Order({
      user: req.user.id,
      orderItems,
      totalPrice,
      shippingCost,
      taxAmount,
      discountAmount,
      finalTotal,
      shippingAddress,
      trackingId, // optional, from shiprocket response
      paymentStatus: "Paid", // or update based on your payment process
      orderStatus: "Processing",
    });

    const createdOrder = await order.save();
    res.status(201).json({ order: createdOrder, message: "Order created successfully" });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
router.get("/", protectUser, protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.productId", "productName mainImage")
      .populate("orderItems.frameType", "name")
      .populate("orderItems.subFrameType", "name")
      .populate("orderItems.size", "name");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get order details by ID (Admin only)
// @route   GET /api/orders/:orderId
router.get("/:orderId", protectUser, protectAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("user", "name email")
      .populate("orderItems.productId", "productName mainImage")
      .populate("orderItems.frameType", "name")
      .populate("orderItems.subFrameType", "name")
      .populate("orderItems.size", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:orderId/status
router.put("/:orderId/status", protectUser, protectAdmin, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingId } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingId) order.trackingId = trackingId;

    await order.save();
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
