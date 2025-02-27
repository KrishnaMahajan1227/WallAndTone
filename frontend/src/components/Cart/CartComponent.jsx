import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CartComponent.css";
import heartIcon from "../../assets/icons/heart-icon.svg";
import heartIconFilled from "../../assets/icons/heart-icon-filled.svg";
import deleteicon from "../../assets/icons/delete-icon.svg";
import { v4 as uuidv4 } from "uuid";
import Footer from "../Footer/Footer";
import CouponUser from "../Coupon/CouponUser";

const CartComponent = () => {
const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://wallandtone.com');

  const [cart, setCart] = useState({ items: [], totalPrice: 0, cartCount: 0 });
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

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

        // Deduplicate items based on product, frame, and size configuration
        const uniqueItems = [];
        const seenConfigurations = new Set();

        (cartData.items || []).forEach((item) => {
          const configKey = JSON.stringify({
            productId: item.productId?._id,
            frameType: item.frameType?._id,
            subFrameType: item.subFrameType?._id,
            size: item.size?._id,
            isCustom: item.isCustom,
            image: item.isCustom ? item.image : null
          });

          if (!seenConfigurations.has(configKey)) {
            seenConfigurations.add(configKey);
            uniqueItems.push({
              ...item,
              uniqueId: uuidv4()
            });
          } else {
            // Find the existing item and update its quantity
            const existingItem = uniqueItems.find(existing => {
              const existingConfig = JSON.stringify({
                productId: existing.productId?._id,
                frameType: existing.frameType?._id,
                subFrameType: existing.subFrameType?._id,
                size: existing.size?._id,
                isCustom: existing.isCustom,
                image: existing.isCustom ? existing.image : null
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
        // ✅ Update UI instantly before API call
        setCart((prevCart) => {
          const updatedItems = prevCart.items.map((cartItem) =>
            cartItem._id === item._id ? { ...cartItem, quantity: newQuantity } : cartItem
          );
          return { ...prevCart, items: updatedItems };
        });
  
        // ✅ Send API request to update in backend
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
  
        // ✅ Backend updated successfully, but we already updated UI instantly
        setAlertMessage("Quantity updated successfully!");
      } catch (err) {
        console.error(err);
        setAlertMessage("Failed to update quantity. Please try again.");
        
        // ❌ Rollback UI change if API request fails
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

        await fetchCartAndWishlist(); // Refresh both cart and wishlist
        setAlertMessage("Added to wishlist successfully!");
      } catch (error) {
        console.error("Error adding product to wishlist:", error);
        setAlertMessage("Failed to add to wishlist. Please try again.");
      }
    }
  };

  const handleRemoveFromWishlist = async (e, product) => {
    e.preventDefault();
    if (!product) return;

    if (token) {
      try {
        const response = await fetch(
          `${apiUrl}/api/wishlist/remove/${product._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove from wishlist.");
        }

        await fetchCartAndWishlist(); // Refresh both cart and wishlist
        setAlertMessage("Removed from wishlist successfully!");
      } catch (error) {
        console.error("Error removing product from wishlist:", error);
        setAlertMessage("Failed to remove from wishlist. Please try again.");
      }
    }
  };

  const handleRemoveItem = async (item) => {
    if (token) {
      try {
        const response = await fetch(
          `${apiUrl}/api/cart/remove/${item._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to remove item");
        }

        await fetchCartAndWishlist(); // Refresh both cart and wishlist
        setAlertMessage("Item removed from cart successfully!");
      } catch (error) {
        console.error("Error removing item:", error);
        setAlertMessage("Failed to remove item. Please try again.");
      }
    }
  };

  const handleApplyCoupon = (applied, discount) => {
    setCouponApplied(applied);
    setCouponDiscount(discount);
  };

  const calculateItemPrice = (item) => {
    const framePrice = item.frameType?.price || 0;
    const subFramePrice = item.subFrameType?.price || 0;
    const sizePrice = item.size?.price || 0;
    const basePrice = item.isCustom ? 0 : (item.productId?.price || 0); 
  
    return (framePrice + subFramePrice + sizePrice + basePrice) * item.quantity;
  };
  
  // Calculate subtotal (before tax, shipping, and discount)
  const subtotal = cart.items.reduce((acc, item) => acc + calculateItemPrice(item), 0);
  
  // Define shipping and tax
  const shippingCost = 300; // Flat rate shipping
  const taxAmount = 50; // Fixed tax
  
  // Pre-discount total (subtotal + shipping + tax)
  const preDiscountTotal = subtotal + shippingCost + taxAmount;
  
  // Calculate discount on the total price
  const discountAmount = couponApplied ? (preDiscountTotal * couponDiscount) / 100 : 0;
  
  // Final total after applying the discount
  const finalTotal = preDiscountTotal - discountAmount;
  
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="cart-container">
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
                  <p className="item-size">
                    Size: {item.size?.width} x {item.size?.height}
                  </p>
                  <p className="item-frameType">
                    Frame Type: {item.frameType?.name || "N/A"}
                  </p>
                  <p className="item-subFrameType">
                    Sub Frame Type: {item.subFrameType?.name || "N/A"}
                  </p>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button
                        type="button"
                        className="quantity-btn"
                        onClick={(e) => handleUpdateQuantity(e, item, item.quantity - 1)}
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
                        onClick={(e) => handleUpdateQuantity(e, item, item.quantity + 1)}
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
                        <img
                          src={
                            wishlist.some(
                              (wishItem) =>
                                wishItem.productId?._id === item.productId._id
                            )
                              ? heartIconFilled
                              : heartIcon
                          }
                          alt="Wishlist Icon"
                        />
                      </button>
                    )}
                  </div>

                  <p className="item-total">
                    Total: {calculateItemPrice(item)} Rs.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
  <h2>Order Summary</h2>
  <div className="summary-details">
    <p>Subtotal: {subtotal.toFixed(2)} Rs.</p>
    <p>Shipping Cost: {shippingCost} Rs.</p>
    <p>Tax: {taxAmount} Rs.</p>

    {/* Coupon Section */}
    <CouponUser onApplyCoupon={handleApplyCoupon} />

    {couponApplied && (
      <>
        <p>Discount: {couponDiscount}%</p>
        <p>Discount Amount: - {discountAmount.toFixed(2)} Rs.</p>
        <h3>New Total Price (After Discount): <span style={{ color: 'green' }}>{finalTotal.toFixed(2)} Rs.</span></h3>
      </>
    )}

    {/* Show original total if no coupon is applied */}
    {!couponApplied && <h3>Total: {preDiscountTotal.toFixed(2)} Rs.</h3>}
  </div>

  <div className="cart-actions">
    <button className="checkout-btn" onClick={() => navigate("/checkout")}>
      Proceed to Checkout
    </button>
    <button className="continue-shopping-btn" onClick={() => navigate("/products")}>
      Continue Shopping
    </button>
  </div>
</div>


        </div>
      )}
      
    </div>
  );
};

export default CartComponent;