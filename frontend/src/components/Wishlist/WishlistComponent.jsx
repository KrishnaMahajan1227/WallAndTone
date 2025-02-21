import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from 'react';
import { WishlistContext } from './WishlistContext';
import "./WishlistComponent.css";
import heartIcon from "../../assets/icons/heart-icon.svg";
import heartIconFilled from "../../assets/icons/heart-icon-filled.svg";
import educationalImage from "../../assets/school-children-1.jpg"; // Replace with your image path

const WishlistComponent = () => {
const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://wallandtone.com');

  const { wishlistCount, setWishlistCount } = useContext(WishlistContext);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Guest mode wishlist storage
  const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || [];

  // Guest mode cart storage
  const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];

  const guestWishlistRef = useRef(guestWishlist);
  const guestCartRef = useRef(guestCart);

  const fetchWishlistAndCart = useCallback(async () => {
    setLoading(true);
    try {
      if (token) {
        const [wishlistResponse, cartResponse] = await Promise.all([
          fetch(`${apiUrl}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!wishlistResponse.ok || !cartResponse.ok) {
          throw new Error("Failed to fetch wishlist or cart.");
        }

        const wishlistData = await wishlistResponse.json();
        const cartData = await cartResponse.json();

        // Ensure wishlistData.items is always an array and filter out invalid items
        const validWishlistItems = (wishlistData.items || []).filter(
          (item) => item.productId && item.productId._id
        );

        setWishlist(validWishlistItems);
        setCart(cartData.items || []);
        setError(null);
        setWishlistCount(validWishlistItems.length);
      } else {
        setWishlist(guestWishlistRef.current);
        setCart(guestCartRef.current);
        setWishlistCount(guestWishlistRef.current.length);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token , guestWishlistRef, guestCartRef]);

  useEffect(() => {
    fetchWishlistAndCart();
  }, [fetchWishlistAndCart]);

  // Show notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000); // Hide notification after 3 seconds
  };

  // Remove from Cart
  const handleRemoveFromCart = async (product) => {
    if (!product || !product._id) return;

    if (token) {
      try {
        const response = await fetch(
          `${apiUrl}/api/cart/remove/${product._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove product from cart.");
        }

        // Update the cart state after successful removal
        const updatedCart = cart.filter(
          (item) => item.productId && item.productId._id !== product._id
        );
        setCart(updatedCart);

        showNotification("Product removed from cart!");
      } catch (error) {
        console.error("Error removing product from cart:", error);
        showNotification("Failed to remove product from cart. Please try again.");
      }
    } else {
      const updatedCart = guestCartRef.current.filter(
        (item) => item.productId && item.productId._id !== product._id
      );
      setCart(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      showNotification("Product removed from cart!");
    }
  };

  // Remove from Wishlist
  const handleRemoveFromWishlist =
  async (product) => {
    if (!product || !product._id) return;

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
          throw new Error("Failed to remove product from wishlist.");
        }

        // Update the wishlist state after successful removal
        const updatedWishlist = wishlist.filter(
          (item) => item.productId && item.productId._id !== product._id
        );
        setWishlist(updatedWishlist);

        // Update the wishlist count
        setWishlistCount(updatedWishlist.length);

        showNotification("Product removed from wishlist!");
      } catch (error) {
        console.error("Error removing product from wishlist:", error);
        showNotification("Failed to remove product from wishlist. Please try again.");
      }
    } else {
      const updatedWishlist = guestWishlistRef.current.filter(
        (item) => item.productId && item.productId._id !== product._id
      );
      setWishlist(updatedWishlist);
      localStorage.setItem('guestWishlist', JSON.stringify(updatedWishlist));

      // Update the wishlist count
      setWishlistCount(updatedWishlist.length);

      showNotification("Product removed from wishlist!");
    }
  };

  // Quick View
  const handleQuickView = (product) => {
    if (product && product._id) {
      navigate(`/product/${product._id}`);
    } else {
      console.error('Product object is null or undefined');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="wishlist-container">
      <h1 className="wishlist-header">Favourites ({wishlistCount})</h1>

      {notification && <div className="wishlist-notification">{notification}</div>}

      {wishlist.length === 0 ? (
        <div className="empty-wishlist-message">
          <p>Your wishlist is empty. Start adding your favorites!</p>
          <button onClick={() => navigate("/products")}>Browse Products</button>
        </div>
      ) : (
        <div className="wishlist-layout">
          <div className="wishlist-items">
            {wishlist.map((item) => {
              const isInCart = cart.some(
                (cartItem) => cartItem.productId && cartItem.productId._id === item.productId._id
              );
              return (
                <div key={item.productId._id} className="wishlist-item">
                  <div className="wishlist-item-image-container">
                    <img
                      src={`${item.productId.mainImage}`}
                      alt={item.productId.productName}
                      className="wishlist-item-image"
                    />
                  </div>
                  <div className="wishlist-item-details">
                    <h3 className="wishlist-item-title">{item.productId.productName}</h3>
                    <p className="wishlist-item-Description">
                      <strong>Description:</strong> {item.productId.description}
                    </p>
                    <div className="wishlist-item-actions">
                      {isInCart ? (
                        <button
                          className="btn btn-danger wishlist-remove-from-cart-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveFromCart(item.productId);
                          }}
                        >
                          Remove from Cart
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary wishlist-quick-view-btn"
                          onClick={() => handleQuickView(item.productId)}
                        >
                          Quick View
                        </button>
                      )}
                      <button
                        className="btn btn-success wishlist-buy-now-btn"
                        onClick={() => navigate(`/products/${item.productId._id}`)}
                      >
                        Buy Now
                      </button>
                      <button
                        className="btn btn-danger wishlist-remove-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFromWishlist(item.productId);
                        }}
                      >
                        <i className="fa fa-trash"></i> Remove from Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="wishlist-sidebar">
            <div className="educational-banner">
              <div className="educational-image-container">
                <img
                  src={educationalImage}
                  alt="Educational Impact"
                  className="educational-image"
                />
                <div className="educational-overlay">
                  <h2>Your Frames, Their Future Every Purchase Powers a Child’s Education!</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistComponent;