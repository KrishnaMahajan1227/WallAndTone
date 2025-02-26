import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Heart, X } from 'lucide-react';
import heartIcon from '../../assets/icons/heart-icon.svg';
import heartIconFilled from '../../assets/icons/heart-icon-filled.svg';

import './ProductDetails.css';
import axios from 'axios';

const ProductDetails = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : 'https://wallandtone.com');

  const { productId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [alertMessage, setAlertMessage] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [reviewImages, setReviewImages] = useState([]);
  const [subCartOpen, setSubCartOpen] = useState(false);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loadingSubFrame, setLoadingSubFrame] = useState(false);
  const [subFrameThumbnails, setSubFrameThumbnails] = useState([]);

  // Local storage state initialization
  const [selectedFrameType, setSelectedFrameType] = useState(() => {
    const stored = localStorage.getItem('selectedFrameType');
    return stored ? JSON.parse(stored) : null;
  });

  const [selectedSubFrameType, setSelectedSubFrameType] = useState(() => {
    const stored = localStorage.getItem('selectedSubFrameType');
    return stored ? JSON.parse(stored) : null;
  });

  const [selectedSize, setSelectedSize] = useState(() => {
    const stored = localStorage.getItem('selectedSize');
    return stored ? JSON.parse(stored) : null;
  });

  // Guest mode storage
  const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || [];
  const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];

  // Calculate item price
  const calculateItemPrice = (item) => {
    if (!item || !item.productId || !item.quantity) return 0;
    const basePrice = parseFloat(item.productId.price) || 0;
    const frameTypePrice = parseFloat(item.frameType?.price) || 0;
    const subFrameTypePrice = parseFloat(item.subFrameType?.price) || 0;
    const sizePrice = parseFloat(item.size?.price) || 0;
    return ((basePrice + frameTypePrice + subFrameTypePrice + sizePrice) * item.quantity).toFixed(2);
  };

  // Calculate total cart price
  const calculateCartTotal = () => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => total + parseFloat(calculateItemPrice(item)), 0).toFixed(2);
  };

  useEffect(() => {
    const updateHistory = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/products/${productId}`);
        const productData = response.data;
        await axios.post(
          `${apiUrl}/api/history/add`,
          {
            productId: productData._id,
            productName: productData.productName,
            productImage: productData.mainImage,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error updating history:', error);
      }
    };
    if (token) {
      updateHistory();
    }
  }, [productId, token]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/products/${productId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        setProduct(data);
        setActiveImage(data.mainImage);
        setAverageRating(calculateAverageRating(data.reviews || []));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, token]);

  // Fetch wishlist and cart
  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const [wishlistRes, cartRes] = await Promise.all([
            fetch(`${apiUrl}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${apiUrl}/api/cart`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          if (!wishlistRes.ok || !cartRes.ok) throw new Error('Failed to fetch user data');
          const wishlistData = await wishlistRes.json();
          const cartData = await cartRes.json();
          setWishlist(Array.isArray(wishlistData) ? wishlistData : []);
          setCart(Array.isArray(cartData) ? cartData : []);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setWishlist([]);
          setCart([]);
        }
      } else {
        setWishlist(guestWishlist);
        setCart(guestCart);
      }
    };
    fetchUserData();
  }, [token]);

  // Fetch subFrameTypes when frameType changes
  useEffect(() => {
    if (selectedFrameType?._id) {
      fetch(`${apiUrl}/api/sub-frame-types/${selectedFrameType._id}`)
        .then(res => res.json())
        .then(data => setSubFrameTypes(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error('Error fetching sub-frame types:', err);
          setAlertMessage('Failed to load sub-frame types');
        });
    } else {
      setSubFrameTypes([]);
    }
  }, [selectedFrameType]);

  // Fetch sizes when product changes
  useEffect(() => {
    if (product?._id) {
      fetch(`${apiUrl}/api/products/${product._id}/sizes`)
        .then(res => res.json())
        .then(data => setSizes(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error('Error fetching sizes:', err);
          setAlertMessage('Failed to load sizes');
        });
    } else {
      setSizes([]);
    }
  }, [product]);

  // Reset selections when product changes
  useEffect(() => {
    if (product?.frameTypes?.length > 0) {
      setSelectedFrameType(product.frameTypes[0]);
    } else {
      setSelectedFrameType(null);
    }
    if (product?.frameTypes?.length > 0 && product.frameTypes[0].subFrameTypes?.length > 0) {
      setSelectedSubFrameType(product.frameTypes[0].subFrameTypes[0]);
    } else {
      setSelectedSubFrameType(null);
    }
    if (product?.sizes?.length > 0) {
      setSelectedSize(product.sizes[0]);
    } else {
      setSelectedSize(null);
    }
  }, [product]);

  // Save selections to localStorage
  useEffect(() => {
    if (selectedFrameType && selectedSubFrameType && selectedSize) {
      localStorage.setItem('selectedFrameType', JSON.stringify(selectedFrameType));
      localStorage.setItem('selectedSubFrameType', JSON.stringify(selectedSubFrameType));
      localStorage.setItem('selectedSize', JSON.stringify(selectedSize));
    }
  }, [selectedFrameType, selectedSubFrameType, selectedSize]);

  // Utility functions
  const calculateAverageRating = (reviews) => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    let total = parseFloat(product.price) || 0;
    if (selectedFrameType?.price) total += parseFloat(selectedFrameType.price);
    if (selectedSubFrameType?.price) total += parseFloat(selectedSubFrameType.price);
    if (selectedSize?.price) total += parseFloat(selectedSize.price);
    return (total * quantity).toFixed(2);
  };

  // Event handlers
  const handleQuantityChange = (e) => {
    const newQuantity = Math.max(1, parseInt(e.target.value, 10) || 1);
    setQuantity(newQuantity);
  };

  const handleThumbnailClick = (thumbnail) => {
    setActiveImage(thumbnail);
  };

  const handleRatingChange = (rating) => {
    setNewRating(rating);
  };

  const handleImageChange = (e) => {
    setReviewImages(Array.from(e.target.files));
  };

  const handleFrameTypeSelect = async (frameType) => {
    try {
      const response = await fetch(`${apiUrl}/api/frame-types/${frameType._id}`);
      if (!response.ok) throw new Error('Failed to fetch frame type details');
      const data = await response.json();
      setSelectedFrameType(data);
      setSelectedSubFrameType(null);
      setSelectedSize(null);
    } catch (err) {
      console.error('Error selecting frame type:', err);
      setAlertMessage('Failed to select frame type');
    }
  };

  // UPDATED: This function now checks product data first and then calls the API.
  // It combines all image URLs (removing duplicates) for the selected sub-frame type.
  const handleSubFrameTypeSelect = async (subFrameType) => {
    setSelectedSubFrameType(subFrameType);
    setSelectedSize(null);
    setLoadingSubFrame(true);
    try {
      let imagesArr = [];
      // Check if product.subFrameImages exists in product data
      if (product?.subFrameImages && product.subFrameImages.length > 0) {
        const matchingGroups = product.subFrameImages.filter(
          (group) =>
            group.subFrameType &&
            group.subFrameType.toString() === subFrameType._id.toString()
        );
        matchingGroups.forEach((group) => {
          if (Array.isArray(group.imageUrls) && group.imageUrls.length > 0) {
            imagesArr = imagesArr.concat(group.imageUrls);
          } else if (group.imageUrl) {
            imagesArr.push(group.imageUrl);
          }
        });
      }
      // If no images found in product data, fetch from API
      if (imagesArr.length === 0) {
        const response = await fetch(
          `${apiUrl}/api/products/${product._id}/subframe-image/${subFrameType._id}`
        );
        if (!response.ok) {
          throw new Error(`Error fetching subframe image: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.images && Array.isArray(data.images)) {
          imagesArr = data.images;
        }
        if (data.imageUrl) {
          imagesArr.push(data.imageUrl);
        }
      }
      // Remove duplicates
      imagesArr = [...new Set(imagesArr)];
      // Append constant images from subFrameType if any
      const constantSubFrameImages = subFrameType.images || [];
      const updatedThumbnails = [...imagesArr, ...constantSubFrameImages];
      
      if (updatedThumbnails.length > 0) {
        setActiveImage(updatedThumbnails[0]);
      } else {
        setActiveImage(product.mainImage);
      }
      setSubFrameThumbnails(updatedThumbnails);
    } catch (err) {
      console.error(err);
      setActiveImage(product.mainImage);
      setSubFrameThumbnails(subFrameType.images || []);
    } finally {
      setLoadingSubFrame(false);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // Cart and wishlist handlers
  const handleAddToCart = async () => {
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) {
      setAlertMessage('Please select all options before adding to cart');
      return;
    }
    const cartItem = {
      productId: product,
      quantity,
      frameType: selectedFrameType,
      subFrameType: selectedSubFrameType,
      size: selectedSize,
      frameTypeName: selectedFrameType.name,
      subFrameTypeName: selectedSubFrameType.name,
      sizeName: `${selectedSize.width} x ${selectedSize.height}`
    };
    if (token) {
      try {
        const response = await fetch(`${apiUrl}/api/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(cartItem)
        });
        if (!response.ok) throw new Error('Failed to add to cart');
        setCart(prevCart => [...prevCart, cartItem]);
        setAlertMessage('Product added to cart!');
        setSubCartOpen(true);
      } catch (err) {
        setAlertMessage('Failed to add product to cart');
      }
    } else {
      const updatedCart = [...guestCart, cartItem];
      setCart(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      setAlertMessage('Product added to cart!');
      setSubCartOpen(true);
    }
  };

  const handleAddToWishlist = async () => {
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) {
      setAlertMessage('Please select all options before adding to wishlist');
      return;
    }
    const inWishlist =
      Array.isArray(wishlist) &&
      wishlist.some(
        item =>
          item.productId._id === product._id &&
          item.frameType._id === selectedFrameType._id &&
          item.subFrameType._id === selectedSubFrameType._id &&
          item.size._id === selectedSize._id
      );
    if (token) {
      try {
        const response = await fetch(
          `${apiUrl}/api/wishlist/${inWishlist ? 'remove' : 'add'}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              productId: product._id,
              frameType: selectedFrameType._id,
              subFrameType: selectedSubFrameType._id,
              size: selectedSize._id
            })
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          if (!inWishlist && errorData.message === "Product already in wishlist.") {
            setAlertMessage("Product is already in your wishlist!");
            return;
          }
          throw new Error(errorData.message || 'Failed to update wishlist');
        }
        setWishlist(prev =>
          inWishlist
            ? prev.filter(
                item =>
                  item.productId._id !== product._id ||
                  item.frameType._id !== selectedFrameType._id ||
                  item.subFrameType._id !== selectedSubFrameType._id ||
                  item.size._id !== selectedSize._id
              )
            : [
                ...prev,
                { productId: product, frameType: selectedFrameType, subFrameType: selectedSubFrameType, size: selectedSize }
              ]
        );
        setAlertMessage(inWishlist ? 'Removed from wishlist!' : 'Added to wishlist!');
      } catch (err) {
        setAlertMessage(err.message || 'Failed to update wishlist');
      }
    } else {
      const updatedWishlist = inWishlist
        ? guestWishlist.filter(
            item =>
              item.productId._id !== product._id ||
              item.frameType._id !== selectedFrameType._id ||
              item.subFrameType._id !== selectedSubFrameType._id ||
              item.size._id !== selectedSize._id
          )
        : [
            ...guestWishlist,
            { productId: product, frameType: selectedFrameType, subFrameType: selectedSubFrameType, size: selectedSize }
          ];
      setWishlist(updatedWishlist);
      localStorage.setItem('guestWishlist', JSON.stringify(updatedWishlist));
      setAlertMessage(inWishlist ? 'Removed from wishlist!' : 'Added to wishlist!');
    }
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    if (token) {
      try {
        const response = await fetch(
          `${apiUrl}/api/cart/update/${item.productId._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              quantity: newQuantity,
              frameType: item.frameType._id,
              subFrameType: item.subFrameType._id,
              size: item.size._id
            })
          }
        );
        if (!response.ok) throw new Error('Failed to update quantity');
        setCart(prevCart =>
          prevCart.map(cartItem =>
            cartItem.productId._id === item.productId._id
              ? { ...cartItem, quantity: newQuantity }
              : cartItem
          )
        );
        setAlertMessage('Quantity updated successfully!');
      } catch (err) {
        setAlertMessage('Failed to update quantity');
      }
    } else {
      const updatedCart = cart.map(cartItem =>
        cartItem.productId._id === item.productId._id
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
      setCart(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      setAlertMessage('Quantity updated successfully!');
    }
  };

  const handleRemoveFromCart = async (item) => {
    if (token) {
      try {
        const response = await fetch(
          `${apiUrl}/api/cart/remove/${item.productId._id}/${item.frameType._id}/${item.subFrameType._id}/${item.size._id}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!response.ok) throw new Error('Failed to remove item from cart');
        setCart(prevCart =>
          prevCart.filter(
            cartItem =>
              cartItem.productId._id !== item.productId._id ||
              cartItem.frameType._id !== item.frameType._id ||
              cartItem.subFrameType._id !== item.subFrameType._id ||
              cartItem.size._id !== item.size._id
          )
        );
        setAlertMessage('Item removed from cart!');
      } catch (err) {
        setAlertMessage('Failed to remove item from cart');
      }
    } else {
      const updatedCart = cart.filter(
        cartItem =>
          cartItem.productId._id !== item.productId._id ||
          cartItem.frameType._id !== item.frameType._id ||
          cartItem.subFrameType._id !== item.subFrameType._id ||
          cartItem.size._id !== item.size._id
      );
      setCart(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      setAlertMessage('Item removed from cart!');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (newRating === 0 || !newReview.trim()) {
      setAlertMessage('Please provide both rating and review');
      return;
    }
    const formData = new FormData();
    formData.append('rating', newRating);
    formData.append('comment', newReview);
    reviewImages.forEach(image => formData.append('reviewImages', image));
    try {
      const response = await fetch(`${apiUrl}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) throw new Error('Failed to submit review');
      const data = await response.json();
      setProduct(prev => ({
        ...prev,
        reviews: [...prev.reviews, data]
      }));
      setAlertMessage('Review submitted successfully!');
      setNewRating(0);
      setNewReview('');
      setReviewImages([]);
    } catch (err) {
      setAlertMessage('Failed to submit review');
    }
  };

  const renderCartItems = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      return <p>Your cart is empty</p>;
    }
    return cart.map((item, index) => (
      <div key={index} className="cart-item">
        <img
          src={`${item.productId.mainImage}`}
          alt={item.productId.productName}
          className="cart-item-image"
        />
        <div className="cart-item-details">
          <h3>{item.productId.productName}</h3>
          <p>Frame: {item.frameTypeName}</p>
          <p>Type: {item.subFrameTypeName}</p>
          <p>Size: {item.sizeName}</p>
          <div className="quantity-controls">
            <button
              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              -
            </button>
            <span>{item.quantity}</span>
            <button onClick={() => handleUpdateQuantity(item, item.quantity + 1)}>
              +
            </button>
          </div>
          <p>Price: ₹{calculateItemPrice(item)}</p>
        </div>
        <button className="remove-item" onClick={() => handleRemoveFromCart(item)}>
          <X size={20} />
        </button>
      </div>
    ));
  };
  

  if (loading)
    return (
      <div className="LoadingIcon text-center d-flex justify-content-center my-5">
  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
    <path fill="#2F231F" d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z">
      <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
    </path>
  </svg>
</div>

    );
  if (error) return <div>{error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-details-container">
      {alertMessage && (
        <div className="alert alert-success" onClick={() => setAlertMessage('')}>
          {alertMessage}
          <button className="close-alert">×</button>
        </div>
      )}
      <button className="back-button" onClick={() => navigate('/products')}>
        <ArrowLeft size={20} /> Back to Products
      </button>
      <div className="product-details">
        <div className="image-section">
        <div className="main-image-container">
  {activeImage ? (
    <div className={`image-wrapper ${activeImage.includes("Front") ? "shadow" : ""}`}>
      <img
        src={activeImage}
        alt={product?.productName || "Product Image"}
        className="product-details-image"
         onContextMenu={(e) => e.preventDefault()}
         draggable="false"
         onDragStart={(e) => e.preventDefault()}      />
    </div>
  ) : (
    <div className="image-placeholder">No image available</div>
  )}
</div>

          {subFrameThumbnails && subFrameThumbnails.length > 0 && (
            <div className="thumbnails">
              {subFrameThumbnails.map((thumbnail, index) => (
                <img
                  key={index}
                  src={thumbnail}
                  alt={`Thumbnail ${index + 1}`}
                  className={`thumbnail ${activeImage === thumbnail ? 'active' : ''}`}
                  onClick={() => setActiveImage(thumbnail)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="info-section">
          <h1 className="product-title">{product.productName}</h1>
          <div className="product-price-section">
            <div className="total-price">
              <span className="current-price">₹{calculateTotalPrice()}</span>
              {product.discount > 0 && (
                <span className="original-price">₹{product.discount}</span>
              )}
            </div>
          </div>
          <div className="options-section">
            <div className="frame-type-section">
              <div className="frame-type-buttons d-flex">
                {product.frameTypes?.map(frameType => (
                  <button
                    key={frameType._id}
                    className={`option-button ${selectedFrameType?._id === frameType._id ? 'active' : ''}`}
                    onClick={() => handleFrameTypeSelect(frameType)}
                  >
                    {frameType.name}
                  </button>
                ))}
              </div>
            </div>
            {selectedFrameType && subFrameTypes.length > 0 && (
              <div className="sub-frame-type-section">
                <div className="sub-frame-type-buttons d-flex gap-2">
                  {subFrameTypes.map((subFrameType) => (
                    <div
                      key={subFrameType._id}
                      className={`subframe-thumbnail ${selectedSubFrameType?._id === subFrameType._id ? 'active' : ''}`}
                      onClick={() => handleSubFrameTypeSelect(subFrameType)}
                      title={subFrameType.name}
                    >
                      <button
                        key={subFrameType._id}
                        className={`option-button ${selectedSubFrameType?._id === subFrameType._id ? 'active' : ''}`}
                        onClick={() => handleSubFrameTypeSelect(subFrameType)}
                        disabled={loadingSubFrame}
                      >
                        {loadingSubFrame && selectedSubFrameType?._id === subFrameType._id
                          ? 'Loading...'
                          : subFrameType.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedSubFrameType && sizes.length > 0 && (
              <div className="size-section">
                <div className="size-buttons">
                  {sizes.map(size => (
                    <button
                      key={size._id}
                      className={`option-button ${selectedSize?._id === size._id ? 'active' : ''}`}
                      onClick={() => handleSizeSelect(size)}
                    >
                      {size.width} x {size.height}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="product-description">
            <h5>Description</h5>
            <p>{product.description}</p>
          </div>
          <div className="quantity-section">
            <label htmlFor="quantity">Quantity:</label>
            <input id="quantity" type="number" min="1" value={quantity} onChange={handleQuantityChange} className="quantity-input" />
          </div>
          <div className="action-buttons">
            <button className="add-to-cart" onClick={handleAddToCart} disabled={!selectedFrameType || !selectedSubFrameType || !selectedSize}>
              <ShoppingCart size={20} />
              Add to Cart
            </button>
            <button className="add-to-wishlist" onClick={handleAddToWishlist} disabled={!selectedFrameType || !selectedSubFrameType || !selectedSize}>
              <Heart size={20} />
              {Array.isArray(wishlist) && wishlist.some(
                item =>
                  item.productId._id === product._id &&
                  item.frameType._id === selectedFrameType?._id &&
                  item.subFrameType._id === selectedSubFrameType?._id &&
                  item.size._id === selectedSize?._id
              )
                ? 'Remove from Wishlist'
                : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
      {subCartOpen && (
        <div className="sub-cart-popup">
          <div className="sub-cart-overlay" onClick={() => setSubCartOpen(false)} />
          <div className={`sub-cart-body ${subCartOpen ? 'show' : ''}`}>
            <div className="sub-cart-header">
              <h2>Shopping Cart</h2>
              <button className="close-btn" onClick={() => setSubCartOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="cart-items">{renderCartItems()}</div>
            <div className="cart-footer">
              <p className="cart-total">Total: ₹{calculateCartTotal()}</p>
              <div className="cart-actions">
                <button className="view-cart" onClick={() => navigate('/cart')}>
                  View Cart
                </button>
                <button className="checkout" onClick={() => navigate('/checkout')}>
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        <div className="review-section">
            <h5>Write a Review</h5>
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="rating-group">
                <label>Rate this product:</label>
                <div className="rating-stars">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className={`star ${newRating > index ? 'active' : ''}`} onClick={() => handleRatingChange(index + 1)} />
                  ))}
                </div>
              </div>
              <div className="review-text-group">
                <label>Your Review:</label>
                <textarea rows={3} value={newReview} onChange={(e) => setNewReview(e.target.value)} placeholder="Share your experience with this product..." />
              </div>
              <div className="image-upload-group">
                <label>Add Photos (optional):</label>
                <input type="file" multiple onChange={handleImageChange} accept="image/*" className="image-upload" />
              </div>
              <button type="submit" className="submit-review" disabled={!newRating || !newReview.trim()}>
                Submit Review
              </button>
            </form>
            <div className="reviews-list">
              <h5>
                Customer Reviews
                {averageRating > 0 && (
                  <span className="average-rating">
                    {averageRating} <Star size={16} className="star-icon" />
                  </span>
                )}
              </h5>
              {product.reviews?.length > 0 ? (
                product.reviews.map((review, index) => (
                  <div key={index} className="review-card">
                    <div className="review-header">
                      <strong className="review-author">
                        {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Anonymous'}
                      </strong>
                      <span className="review-rating">
                        {review.rating} <Star size={16} className="star-icon" />
                      </span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    {review.images?.length > 0 && (
                      <div className="review-images">
                        {review.images.map((image, i) => (
                          <img key={i} src={image} alt={`Review image ${i + 1}`} className="review-image" />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
    </div>
  );
};

export default ProductDetails;
