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
        let url = 'http://localhost:8080/api/products';
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
          const wishlistResponse = await fetch('http://localhost:8080/api/wishlist', {
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
      const response = await fetch('http://localhost:8080/api/wishlist/add', {
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
      const response = await fetch(`http://localhost:8080/api/wishlist/remove/${product._id}`, {
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

  if (loading) return <div className="text-center d-flex justify-content-center my-5"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#2F231F" d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z"><animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></svg></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const renderProductCard = (product, isLarge = false) => (
    <div className={`card product-card h-100 ${isLarge ? 'large-card' : ''}`}>
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
        <p className="card-text text-muted">{product.description.slice(0, isLarge ? 150 : 100)}...</p>
        <p className="card-text text-muted">Starting From Rs {product.startFromPrice}/-</p>
      </div>
    </div>
  );

  const renderProductRows = () => {
    const rows = [];
    let remainingProducts = [...products];

    // Process products in groups of 7 (6 regular + 1 featured)
    while (remainingProducts.length >= 7) {
      const regularProducts = remainingProducts.slice(0, 6);
      const featuredProduct = remainingProducts[6];
      const isEvenRow = rows.length % 2 === 0;

      rows.push(
        <div key={rows.length} className={`products-container mb-4 ${isEvenRow ? 'featured-right' : 'featured-left'}`}>
          {isEvenRow ? (
            <>
              <div className="regular-products">
                {regularProducts.map((product) => (
                  product && product._id ? (
                    <div key={product._id} className="regular-product-item">
                      {renderProductCard(product)}
                    </div>
                  ) : null
                ))}
              </div>
              <div className="featured-product">
                {renderProductCard(featuredProduct, true)}
              </div>
            </>
          ) : (
            <>
              <div className="featured-product">
                {renderProductCard(featuredProduct, true)}
              </div>
              <div className="regular-products">
                {regularProducts.map((product) => (
                  product && product._id ? (
                    <div key={product._id} className="regular-product-item">
                      {renderProductCard(product)}
                    </div>
                  ) : null
                ))}
              </div>
            </>
          )}
        </div>
      );

      remainingProducts = remainingProducts.slice(7);
    }

    // Handle remaining products in a single row if any
    if (remainingProducts.length > 0) {
      rows.push(
        <div key="remaining" className="remaining-products-container mb-4">
          {remainingProducts.map((product) => (
            product && product._id ? (
              <div key={product._id} className="remaining-product-item">
                {renderProductCard(product)}
              </div>
            ) : null
          ))}
        </div>
      );
    }

    return rows;
  };

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
        <div className="all-products-container">
          {renderProductRows()}
        </div>
      ) : (
        <div className="text-center my-5">No products found.</div>
      )}
    </div>
  );
};

export default ProductListing;