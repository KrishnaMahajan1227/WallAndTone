import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CartComponent.css";
import heartIcon from "../../assets/icons/heart-icon.svg";
import heartIconFilled from "../../assets/icons/heart-icon-filled.svg";
import { v4 as uuidv4 } from "uuid";

const CartComponent = () => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0, cartCount: 0 });
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch cart and wishlist data
  useEffect(() => {
    const fetchCartAndWishlist = async () => {
      setLoading(true);
      try {
        if (token) {
          const [cartResponse, wishlistResponse] = await Promise.all([
            fetch("http://localhost:5000/api/cart", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:5000/api/wishlist", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          if (!cartResponse.ok || !wishlistResponse.ok) {
            throw new Error("Failed to fetch cart or wishlist");
          }

          const cartData = await cartResponse.json();
          const wishlistData = await wishlistResponse.json();

          // Add a unique identifier to each cart item
          const itemsWithUniqueId = (cartData.items || []).map((item) => ({
            ...item,
            uniqueId: item.uniqueId || uuidv4(),
          }));

          setCart({
            items: itemsWithUniqueId,
            totalPrice: cartData.totalPrice || 0,
            cartCount: itemsWithUniqueId.length || 0,
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

    fetchCartAndWishlist();
  }, [token]);

  // Update item quantity in cart
  const handleUpdateQuantity = async (e, item, newQuantity) => {
    e.preventDefault();

    if (newQuantity < 1) return;

    if (token) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/cart/update/${item._id}`,
          {
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
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update quantity.");
        }

        const data = await response.json();
        setCart(data.cart);
        setAlertMessage("Quantity updated successfully!");
      } catch (err) {
        console.error(err);
        setAlertMessage("Failed to update quantity. Please try again.");
      }
    }
  };

  // Add item to wishlist
  const handleAddToWishlist = async (e, product) => {
    e.preventDefault();
    if (!product) return;

    const productInWishlist = wishlist.some(
      (item) => item.productId && item.productId._id === product._id
    );

    if (productInWishlist) return;

    if (token) {
      try {
        const response = await fetch("http://localhost:5000/api/wishlist/add", {
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

        setWishlist((prevWishlist) => [...prevWishlist, { productId: product }]);
        setAlertMessage("Added to wishlist successfully!");
      } catch (error) {
        console.error("Error adding product to wishlist:", error);
        setAlertMessage("Failed to add to wishlist. Please try again.");
      }
    }
  };

  // Remove item from wishlist
  const handleRemoveFromWishlist = async (e, product) => {
    e.preventDefault();
    if (!product) return;

    if (token) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/wishlist/remove/${product._id}`,
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

        setWishlist((prevWishlist) =>
          prevWishlist.filter(
            (item) => item.productId && item.productId._id !== product._id
          )
        );
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
          `http://localhost:5000/api/cart/remove/${item._id}`,
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

        const data = await response.json();
        setCart(data.cart);
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

  const originalPrice = cart.items.reduce(
    (acc, item) => acc + calculateItemPrice(item),
    0
  );

  const discountAmount = couponApplied
    ? (originalPrice * couponDiscount) / 100
    : 0;

  const totalPrice = couponApplied
    ? originalPrice + 300 + 50 - discountAmount
    : originalPrice + 300 + 50;

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
                          if (!isNaN(value)) {
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
                      Remove from Cart
                    </button>

                    {!item.isCustom && (
                      <button
                        type="button"
                        className="wishlist-btn"
                        onClick={(e) => {
                          if (
                            wishlist.some(
                              (wishItem) =>
                                wishItem.productId &&
                                wishItem.productId._id === item.productId._id
                            )
                          ) {
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
                                wishItem.productId &&
                                wishItem.productId._id === item.productId._id
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
              <p>Shipping Cost: 300 Rs.</p>
              <p>Discount: {couponApplied ? `- ${couponDiscount}%` : "N/A"}</p>
              <p>Tax: 50 Rs.</p>
              {couponApplied && (
                <p>Original Price: {originalPrice} Rs.</p>
              )}
              {couponApplied && (
                <p>Discount Amount: {discountAmount} Rs.</p>
              )}
              <h3>Total: {totalPrice} Rs.</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartComponent;