import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CartComponent.css";
import heartIcon from "../../assets/icons/heart-icon.svg";
import heartIconFilled from "../../assets/icons/heart-icon-filled.svg";
import deleteicon from "../../assets/icons/delete-icon.png";
import { v4 as uuidv4 } from "uuid";
import Footer from "../Footer/Footer";
import CouponUser from "../Coupon/CouponUser";
import loaderGif from '../../assets/icons/loader.gif';
/* ======= NEW IMPORTS FOR TOASTS ======= */
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Helmet } from "react-helmet";

const CartComponent = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://wallandtone.com");

  const [cart, setCart] = useState({ items: [], totalPrice: 0, cartCount: 0 });
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Price calculation
  const calculateItemPrice = (item) => {
    const framePrice = item.frameType?.price || 0;
    const subFramePrice = item.subFrameType?.price || 0;
    const sizePrice = item.size?.price || 0;
    const basePrice = item.isCustom ? 0 : item.productId?.price || 0;
    return (framePrice + subFramePrice + sizePrice + basePrice) * item.quantity;
  };

  const subtotal = cart.items.reduce(
    (acc, item) => acc + calculateItemPrice(item),
    0
  );

  // Removed shipping cost and tax
  const shippingCost = 0;
  const taxAmount = 0;
  const preDiscountTotal = subtotal; // equals subtotal
  const discountAmount = couponApplied
    ? (preDiscountTotal * couponDiscount) / 100
    : 0;
  const finalTotal = preDiscountTotal - discountAmount;

  const fetchCartAndWishlist = async () => {
    setLoading(true);
    try {
      if (token) {
        const [cartResponse, wishlistResponse] = await Promise.all([
          fetch(`${apiUrl}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!cartResponse.ok || !wishlistResponse.ok) {
          throw new Error("Failed to fetch cart or wishlist");
        }

        const cartData = await cartResponse.json();
        const wishlistData = await wishlistResponse.json();

        // Deduplicate items based on product, frame, subframe, and size configuration
        const uniqueItems = [];
        const seenConfigurations = new Set();

        (cartData.items || []).forEach((item) => {
          const configKey = JSON.stringify({
            productId: item.productId?._id,
            frameType: item.frameType?._id,
            subFrameType: item.subFrameType?._id,
            size: item.size?._id,
            isCustom: item.isCustom,
            image: item.isCustom ? item.image : null,
          });
          if (!seenConfigurations.has(configKey)) {
            seenConfigurations.add(configKey);
            uniqueItems.push({ ...item, uniqueId: uuidv4() });
          } else {
            const existingItem = uniqueItems.find((existing) => {
              const existingConfig = JSON.stringify({
                productId: existing.productId?._id,
                frameType: existing.frameType?._id,
                subFrameType: existing.subFrameType?._id,
                size: existing.size?._id,
                isCustom: existing.isCustom,
                image: existing.isCustom ? existing.image : null,
              });
              return existingConfig === configKey;
            });
            if (existingItem) {
              existingItem.quantity += item.quantity;
            }
          }
        });

        setCart({
          items: uniqueItems,
          totalPrice: cartData.totalPrice || 0,
          cartCount: uniqueItems.length || 0,
        });

        setWishlist(wishlistData.items || []);
        setError(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndWishlist();
  }, [token]);

  const handleUpdateQuantity = async (e, item, newQuantity) => {
    e.preventDefault();
    if (newQuantity < 1) return;
    if (token) {
      try {
        // Optimistically update UI
        setCart((prevCart) => {
          const updatedItems = prevCart.items.map((cartItem) =>
            cartItem._id === item._id
              ? { ...cartItem, quantity: newQuantity }
              : cartItem
          );
          return { ...prevCart, items: updatedItems };
        });

        const response = await fetch(`${apiUrl}/api/cart/update/${item._id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: newQuantity,
            frameType: item.frameType._id,
            subFrameType: item.subFrameType._id,
            size: item.size._id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update quantity.");
        }

        toast.success("Quantity updated successfully!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to update quantity. Please try again.");
        // Rollback UI change if needed
        setCart((prevCart) => {
          const rollbackItems = prevCart.items.map((cartItem) =>
            cartItem._id === item._id ? { ...cartItem, quantity: item.quantity } : cartItem
          );
          return { ...prevCart, items: rollbackItems };
        });
      }
    }
  };

  const handleAddToWishlist = async (e, product) => {
    e.preventDefault();
    if (!product) return;
    const productInWishlist = wishlist.some(
      (item) => item.productId && item.productId._id === product._id
    );
    if (productInWishlist) return;
    if (token) {
      try {
        setWishlist((prevWishlist) => [
          ...prevWishlist,
          { productId: product, _id: uuidv4() },
        ]);

        const response = await fetch(`${apiUrl}/api/wishlist/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product._id }),
        });

        if (!response.ok) {
          throw new Error("Failed to add to wishlist.");
        }

        toast.success("Added to wishlist successfully!");
      } catch (error) {
        console.error("Error adding product to wishlist:", error);
        toast.error("Failed to add to wishlist. Please try again.");
        setWishlist((prevWishlist) =>
          prevWishlist.filter(
            (item) => item.productId && item.productId._id !== product._id
          )
        );
      }
    }
  };

  const handleRemoveFromWishlist = async (e, product) => {
    e.preventDefault();
    if (!product) return;
    if (token) {
      const previousWishlist = [...wishlist];
      try {
        setWishlist((prev) =>
          prev.filter((item) => item.productId?._id !== product._id)
        );

        const response = await fetch(
          `${apiUrl}/api/wishlist/remove/${product._id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove from wishlist.");
        }
        toast.success("Removed from wishlist successfully!");
      } catch (error) {
        console.error("Error removing product from wishlist:", error);
        toast.error("Failed to remove from wishlist. Please try again.");
        setWishlist(previousWishlist);
      }
    }
  };

  const handleRemoveItem = async (item) => {
    if (token) {
      try {
        setCart((prevCart) => {
          const filtered = prevCart.items.filter(
            (cartItem) => cartItem._id !== item._id
          );
          return { ...prevCart, items: filtered };
        });

        const response = await fetch(`${apiUrl}/api/cart/remove/${item._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to remove item");
        }

        toast.success("Item removed from cart successfully!");
      } catch (error) {
        console.error("Error removing item:", error);
        toast.error("Failed to remove item. Please try again.");
        setCart((prevCart) => ({ ...prevCart, items: [...prevCart.items] }));
      }
    }
  };

  const handleApplyCoupon = (applied, discount) => {
    setCouponApplied(applied);
    setCouponDiscount(discount);
  };

  const handleProceedToCheckout = () => {
    const checkoutItems = cart.items.map((item) => {
      if (item.isCustom) {
        return {
          productId: null,
          productName: "Customized Artwork",
          mainImage: item.image,
          quantity: item.quantity,
          frameType: item.frameType,
          subFrameType: item.subFrameType,
          size: item.size,
          itemTotal: calculateItemPrice(item),
        };
      } else {
        return {
          productId: item.productId?._id || null,
          productName: item.productId?.productName || "",
          mainImage: item.productId?.mainImage || "",
          quantity: item.quantity,
          frameType: item.frameType,
          subFrameType: item.subFrameType,
          size: item.size,
          itemTotal: calculateItemPrice(item),
        };
      }
    });

    navigate("/checkout", {
      state: {
        total: Number(finalTotal.toFixed(2)),
        cartItems: checkoutItems,
        subtotal,
        shippingCost: 0,
        taxAmount: 0,
        discountAmount,
        couponApplied,
        couponDiscount,
      },
    });
  };

  if (loading) return (<div className="loader text-center d-flex justify-content-center my-5 h-100vh">
            <img src={loaderGif} alt="loader" />
  </div>);
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="cart-container">
      <Helmet>
        <title>My Cart | Wall & Tone</title>
        <meta
          name="description"
          content="Review and manage your cart items at Wall & Tone. Enjoy a seamless shopping experience for custom and curated wall art with exclusive discounts and offers."
        />
        <meta
          name="keywords"
          content="cart, wall art, custom art, buy art, Wall & Tone, shopping cart, art discounts"
        />
        <link rel="canonical" href="https://wallandtone.com/cart" />
        <meta property="og:title" content="My Cart | Wall & Tone" />
        <meta
          property="og:description"
          content="Review and manage your cart items at Wall & Tone. Shop for custom and curated wall art with exclusive offers."
        />
        <meta property="og:image" content="https://wallandtone.com/assets/og-cart.jpg" />
        <meta property="og:url" content="https://wallandtone.com/cart" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="My Cart | Wall & Tone" />
        <meta
          name="twitter:description"
          content="Review and manage your cart items at Wall & Tone."
        />
        <meta name="twitter:image" content="https://wallandtone.com/assets/og-cart.jpg" />
      </Helmet>
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="cart-header">My Cart</h1>
      {alertMessage && (
        <div className="alert alert-success" onClick={() => setAlertMessage("")}>
          {alertMessage}
          <button className="close-alert">×</button>
        </div>
      )}
      {cart.items.length === 0 ? (
        <div className="empty-cart-message">
          <p>Your cart is empty. Go for browsing!</p>
          <button onClick={() => navigate("/products")}>Browse Products</button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.uniqueId} className="cart-item">
                <img
                  src={item.isCustom ? item.image : item.productId?.mainImage}
                  alt={item.isCustom ? "Custom Artwork" : item.productId?.productName}
                  className="item-image"
                />
                <div className="item-details">
                  <h3 className="item-title">
                    {item.isCustom ? "Custom Artwork" : item.productId?.productName}
                  </h3>
                  <p className="item-size">Size: {item.size?.name}</p>
                  <p className="item-frameType">Frame Type: {item.frameType?.name || "N/A"}</p>
                  <p className="item-subFrameType">Sub Frame Type: {item.subFrameType?.name || "N/A"}</p>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button
                        type="button"
                        className="quantity-btn"
                        onClick={(e) =>
                          handleUpdateQuantity(e, item, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="quantity-input"
                        value={item.quantity}
                        min="1"
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value) && value >= 1) {
                            handleUpdateQuantity(e, item, value);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="quantity-btn"
                        onClick={(e) =>
                          handleUpdateQuantity(e, item, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item)}
                    >
                      <img src={deleteicon} alt="Remove-From-Cart" />
                    </button>
                  </div>
                </div>
                <div className="item-details-2 d-flex">
                  <div className="item-pricing">
                    <p className="item-price">MRP INR ₹{item.size?.price}</p>
                  </div>
                  <div className="wishlisht-button">
                    {!item.isCustom && item.productId && (
                      <button
                        type="button"
                        className="wishlist-btn"
                        onClick={(e) => {
                          const isInWishlist = wishlist.some(
                            (wishItem) =>
                              wishItem.productId?._id === item.productId._id
                          );
                          if (isInWishlist) {
                            handleRemoveFromWishlist(e, item.productId);
                          } else {
                            handleAddToWishlist(e, item.productId);
                          }
                        }}
                      >
                        {wishlist.some(
                          (wishItem) => wishItem.productId?._id === item.productId._id
                        )
                          ? "Remove from Favourites"
                          : "Move to Favourites"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <hr className="cart-item-separator" />
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-details">
              <p>Subtotal: {subtotal.toFixed(2)} Rs.</p>
              <CouponUser onApplyCoupon={handleApplyCoupon} />
              {couponApplied && (
                <>
                  <p>Discount: {couponDiscount}%</p>
                  <p>Discount Amount: - {discountAmount.toFixed(2)} Rs.</p>
                  <h3>
                    New Total Price (After Discount):{" "}
                    <span style={{ color: "green" }}>
                      {finalTotal.toFixed(2)} Rs.
                    </span>
                  </h3>
                </>
              )}
              {!couponApplied && (
                <h3>Total: {preDiscountTotal.toFixed(2)} Rs.</h3>
              )}
            </div>
            <div className="cart-actions">
              <button className="checkout-btn" onClick={handleProceedToCheckout}>
                Proceed to Checkout
              </button>
              <button
                className="continue-shopping-btn"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default CartComponent;
