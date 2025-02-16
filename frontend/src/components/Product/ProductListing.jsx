import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import heartIcon from '../../assets/icons/heart-icon.svg';
import heartIconFilled from '../../assets/icons/heart-icon-filled.svg';
import { Alert, Modal, Button } from 'react-bootstrap';
import { WishlistContext } from '../Wishlist/WishlistContext';

import './ProductListing.css';

const ProductListing = () => {
  const { wishlistCount, setWishlistCount } = useContext(WishlistContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistAlert, setWishlistAlert] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authAction, setAuthAction] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = 'http://localhost:5000/api/products';
        if (location.search) {
          url += location.search;
        }
        const response = await fetch(url, {
          method: 'GET',
        });
        const data = await response.json();
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid data received');
        }
        const updatedProducts = data.map((product) => {
          return {
            ...product,
            inWishlist: wishlist.some((item) => item.productId && item.productId._id === product._id),
          };
        });
        setProducts(updatedProducts);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      if (token) {
        try {
          const wishlistResponse = await fetch('http://localhost:5000/api/wishlist', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const wishlistData = await wishlistResponse.json();

          if (!wishlistData || !Array.isArray(wishlistData.items)) {
            throw new Error('Invalid wishlist data received');
          }

          const wishlist = wishlistData.items || [];
          setWishlist(wishlist);

          if (wishlist.length > 0) {
            setWishlistCount(wishlist.length);
          } else {
            setWishlistCount(0);
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error.message);
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0);
      }
    };

    fetchProducts();
    fetchWishlist();
  }, [location.search, token]);

  useEffect(() => {
    setWishlistCount(wishlist.length);
  }, [wishlist]);

  const handleAuthRequired = (action) => {
    setAuthAction(() => action);
    setShowAuthPopup(true);
  };

  const handleAuthPopupClose = () => {
    setShowAuthPopup(false);
    setAuthAction(null);
  };

  const handleAuthLogin = () => {
    setShowAuthPopup(false);
    navigate('/login');
  };

  const handleAddToWishlist = async (product) => {
    if (!product || !product._id) return;

    if (!token) {
      handleAuthRequired(() => handleAddToWishlist(product));
      return;
    }

    const productInWishlist = wishlist.some(
      (item) => item.productId && item.productId._id === product._id
    );

    if (productInWishlist) {
      setWishlistAlert(true);
      setTimeout(() => setWishlistAlert(false), 3000);
      return;
    }

    // Optimistically update the wishlist state
    const updatedWishlist = [...wishlist, { productId: product }];
    setWishlist(updatedWishlist);
    setWishlistCount(updatedWishlist.length);

    try {
      const response = await fetch('http://localhost:5000/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!response.ok) {
        throw new Error('Failed to add product to wishlist');
      }

      // Update the heart icon to filled
      const updatedProducts = products.map((p) => {
        if (p._id === product._id) {
          return { ...p, inWishlist: true };
        }
        return p;
      });
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error adding product to wishlist:', error);
      setWishlist(wishlist); // Rollback the state if the API call fails
      setWishlistCount(wishlist.length);
      setWishlistAlert('Failed to add product to wishlist. Please try again.');
    }
  };

  const handleRemoveFromWishlist = async (product) => {
    if (!product || !product._id) return;

    // Optimistically update the wishlist state
    const updatedWishlist = wishlist.filter(
      (item) => item.productId && item.productId._id !== product._id
    );
    setWishlist(updatedWishlist);
    setWishlistCount(updatedWishlist.length);

    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/remove/${product._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove product from wishlist');
      }
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
      setWishlist(wishlist); // Rollback the state if the API call fails
      setWishlistCount(wishlist.length);
      setWishlistAlert('Failed to remove product from wishlist. Please try again.');
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) return <div className="text-center my-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="product-listing container">
      {/* Authentication Popup */}
      <Modal show={showAuthPopup} onHide={handleAuthPopupClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You need to log in to perform this action. Would you like to log in or continue browsing?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleAuthPopupClose}>
            Continue Browsing
          </Button>
          <Button variant="primary" onClick={handleAuthLogin}>
            Log In
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Wishlist Alert */}
      {wishlistAlert && <Alert variant="success">Product added to wishlist!</Alert>}

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="row g-3">
          {products.map((product) => (
            product && product._id ? (
              <div key={product._id} className="col-md-3 mb-4">
                <div
                  className="card product-card h-100"
                  style={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
                >
                  <div className="product-image-wrapper position-relative">
                    <img
                      src={`${product.mainImage}`}
                      className="card-img-top product-image"
                      alt={product.productName}
                      onClick={() => handleProductClick(product._id)}
                    />
                    <div
                      className="wishlist-icon position-absolute"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (wishlist && wishlist.some((item) => item.productId && item.productId._id === product._id)) {
                          handleRemoveFromWishlist(product);
                        } else {
                          handleAddToWishlist(product);
                        }
                      }}
                    >
                      <img
                        src={wishlist && wishlist.some((item) => item.productId && item.productId._id === product._id) ? heartIconFilled : heartIcon}
                        alt="Heart Icon"
                      />
                    </div>
                  </div>

                  <div className="card-body text-center d-flex flex-column">
                    <h5 className="card-title product-title">{product.productName}</h5>
                    <p className="card-text text-muted">{product.description.slice(0, 100)}...</p>
                  </div>
                </div>
              </div>
            ) : null
          ))}
        </div>
      ) : (
        <div className="text-center my-5">No products found.</div>
      )}
    </div>
  );
};

export default ProductListing;