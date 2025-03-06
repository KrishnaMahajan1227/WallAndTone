const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/product");
const { protectUser } = require("../middleware/authMiddleware");

// ✅ Add Item to Cart
router.post("/add", protectUser, async (req, res) => {
  try {
    const { quantity, frameType, subFrameType, size, image, isCustom, productId } = req.body;

    if (!quantity || !frameType || !subFrameType || !size) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (isCustom && !image) {
      return res.status(400).json({ message: "Image is required for custom artwork" });
    }

    if (!isCustom && productId) {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => {
      return (
        item.frameType.toString() === frameType &&
        item.subFrameType.toString() === subFrameType &&
        item.size.toString() === size &&
        (isCustom ? item.isCustom && item.image === image : item.productId?.toString() === productId)
      );
    });

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        quantity,
        frameType,
        subFrameType,
        size,
        isCustom,
        image: isCustom ? image : undefined,
        productId: isCustom ? undefined : productId,
      });
    }

    await cart.save();
    await populateCart(cart);

    res.status(200).json({
      cart: formatCartResponse(cart),
      message: "Item added to cart successfully",
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get Cart
router.get("/", protectUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ items: [], totalPrice: 0, cartCount: 0 });
    }

    await populateCart(cart);
    res.status(200).json(formatCartResponse(cart));
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update Cart Item Quantity
router.put("/update/:itemId", protectUser, async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.itemId;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(item => item._id.toString() === itemId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();
    await populateCart(cart);

    res.status(200).json({
      cart: formatCartResponse(cart),
      message: "Cart updated successfully",
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Remove Item from Cart
router.delete("/remove/:itemId", protectUser, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found in cart" });

    cart.items.splice(itemIndex, 1);
    await cart.save();
    await populateCart(cart);

    res.status(200).json({
      cart: formatCartResponse(cart),
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Clear Cart (New Endpoint)
// This endpoint will remove all items from the user's cart.
// ✅ Clear Cart (New Endpoint)
// This endpoint will remove all items from the user's cart.
router.delete("/clear", protectUser, async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: [] },
      { new: true }
    );
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    res.status(200).json({
      items: [],
      totalPrice: 0,
      cartCount: 0,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Helper Function: Populate Cart Data
async function populateCart(cart) {
  await cart.populate([
    { path: "items.productId", select: "productName price mainImage" },
    { path: "items.frameType", select: "name price" },
    { path: "items.subFrameType", select: "name price" },
    { path: "items.size", select: "name price" }
  ]);
}

// ✅ Helper Function: Format Cart Response
function formatCartResponse(cart) {
  const totalPrice = cart.items.reduce((total, item) => {
    const frameTypePrice = item.frameType?.price || 0;
    const subFrameTypePrice = item.subFrameType?.price || 0;
    const sizePrice = item.size?.price || 0;
    const productPrice = item.productId?.price || 0;
    return total + item.quantity * (frameTypePrice + subFrameTypePrice + sizePrice + productPrice);
  }, 0);

  return {
    items: cart.items,
    totalPrice,
    cartCount: cart.items.length,
  };
}

module.exports = router;
