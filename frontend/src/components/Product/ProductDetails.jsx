import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Heart, X } from 'lucide-react';
import { Modal, Button } from 'react-bootstrap';
import heartIcon from '../../assets/icons/heart-icon.svg';
import heartIconFilled from '../../assets/icons/heart-icon-filled.svg';
import ProductSEO from './ProductSEO'; // adjust the path as needed
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProductDetails.css';

const ProductDetails = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : 'https://wallandtone.com');

  const { productId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Responsive handling
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [subCartOpen, setSubCartOpen] = useState(false);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [loadingSubFrame, setLoadingSubFrame] = useState(false);
  const [subFrameThumbnails, setSubFrameThumbnails] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [selectedFrameType, setSelectedFrameType] = useState(null);
  const [selectedSubFrameType, setSelectedSubFrameType] = useState(null);

  // SIZE SELECTION: available sizes and selected size
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);

  // Guest mode storage
  const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || [];
  const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];

  // Utility functions
  const calculateAverageRating = (reviews) => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const calculateItemPrice = (item) => {
    if (!item || !item.productId || !item.quantity) return 0;
    const basePrice = parseFloat(item.productId.price) || 0;
    const frameTypePrice = parseFloat(item.frameType?.price) || 0;
    const subFrameTypePrice = parseFloat(item.subFrameType?.price) || 0;
    const sizePrice = parseFloat(item.size?.price) || 0;
    return ((basePrice + frameTypePrice + subFrameTypePrice + sizePrice) * item.quantity).toFixed(2);
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    let total = parseFloat(product.price) || 0;
    if (selectedFrameType?.price) total += parseFloat(selectedFrameType.price);
    if (selectedSubFrameType?.price) total += parseFloat(selectedSubFrameType.price);
    if (selectedSize?.price) total += parseFloat(selectedSize.price);
    return (total * quantity).toFixed(2);
  };

  // Update history
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
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, token]);

  // Reset image loaded state when activeImage changes
  useEffect(() => {
    setImgLoaded(false);
  }, [activeImage]);

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

  // Save selections to localStorage
  useEffect(() => {
    if (selectedFrameType && selectedSubFrameType && selectedSize) {
      localStorage.setItem('selectedFrameType', JSON.stringify(selectedFrameType));
      localStorage.setItem('selectedSubFrameType', JSON.stringify(selectedSubFrameType));
      localStorage.setItem('selectedSize', JSON.stringify(selectedSize));
    }
  }, [selectedFrameType, selectedSubFrameType, selectedSize]);

  // When a frame type is selected, fetch its sub-frame types and update available sizes
  useEffect(() => {
    if (selectedFrameType?._id) {
      fetch(`${apiUrl}/api/sub-frame-types/${selectedFrameType._id}`)
        .then(res => res.json())
        .then(data => setSubFrameTypes(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error('Error fetching sub-frame types:', err);
          toast.error('Failed to load sub-frame types');
        });
      // Update available sizes from the selected frame type
      if (selectedFrameType.frameSizes && Array.isArray(selectedFrameType.frameSizes)) {
        setSizes(selectedFrameType.frameSizes);
      } else {
        setSizes([]);
        setSelectedSize(null);
      }
    } else {
      setSubFrameTypes([]);
      setSizes([]);
      setSelectedSize(null);
    }
  }, [selectedFrameType, apiUrl]);

  // Event Handlers
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
      if (data.frameSizes && Array.isArray(data.frameSizes)) {
        setSizes(data.frameSizes);
      } else {
        setSizes([]);
      }
    } catch (err) {
      console.error('Error selecting frame type:', err);
      toast.error('Failed to select frame type');
    }
  };

  const handleSubFrameTypeSelect = async (subFrameType) => {
    setSelectedSubFrameType(subFrameType);
    setLoadingSubFrame(true);
    try {
      let imagesArr = [];
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
      imagesArr = [...new Set(imagesArr)];
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
      toast.error('Failed to load subframe images');
    } finally {
      setLoadingSubFrame(false);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // Cart and wishlist handlers – require frame type, subframe type, and size
  const handleAddToCart = async () => {
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) {
      toast.error('Please select all required options before adding to cart');
      return;
    }
    if (!token) {
      setShowLoginModal(true);
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
      sizeName: selectedSize.name
    };
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
      toast.success('Product added to cart!');
      setSubCartOpen(true);
    } catch (err) {
      toast.error('Failed to add product to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) {
      toast.error('Please select all required options before adding to wishlist');
      return;
    }
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    const inWishlist =
      Array.isArray(wishlist) &&
      wishlist.some(
        item =>
          item.productId._id === product._id &&
          item.frameType._id === selectedFrameType?._id &&
          item.subFrameType._id === selectedSubFrameType?._id &&
          item.size._id === selectedSize?._id
      );
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
          toast.info("Product is already in your wishlist!");
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
      toast.success(inWishlist ? 'Removed from wishlist!' : 'Added to wishlist!');
    } catch (err) {
      toast.error(err.message || 'Failed to update wishlist');
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
        toast.success('Quantity updated successfully!');
      } catch (err) {
        toast.error('Failed to update quantity');
      }
    } else {
      const updatedCart = cart.map(cartItem =>
        cartItem.productId._id === item.productId._id
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
      setCart(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      toast.success('Quantity updated successfully!');
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
        toast.success('Item removed from cart!');
      } catch (err) {
        toast.error('Failed to remove item from cart');
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
      toast.success('Item removed from cart!');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newRating || !newReview.trim()) {
      toast.error("Rating and comment are required.");
      return;
    }
    const formDataObj = new FormData();
    formDataObj.append("rating", newRating);
    formDataObj.append("comment", newReview);
    if (reviewImages.length > 0) {
      reviewImages.forEach(image => {
        formDataObj.append("reviewImages", image);
      });
    }
    try {
      const response = await fetch(`${apiUrl}/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to submit review");
      setProduct((prev) => ({
        ...prev,
        reviews: [...prev.reviews, data],
      }));
      toast.success("Review submitted successfully!");
      setNewRating(0);
      setNewReview("");
      setReviewImages([]);
    } catch (err) {
      console.error("Review Submission Error:", err);
      toast.error(err.message || "Failed to submit review");
    }
  };

  const renderCartItems = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      return <p>Your cart is empty</p>;
    }
    return cart.map((item, index) => (
      <div key={index} className="cart-item">
        <img
          src={item.productId.mainImage}
          alt={item.productId.productName}
          className="cart-item-image"
        />
        <div className="cart-item-details">
          <h3>{item.productId.productName}</h3>
          <p>Frame: {item.frameTypeName}</p>
          <p>Type: {item.subFrameTypeName}</p>
          <p>Size: {item.sizeName}</p>
          <div className="quantity-controls">
            <button onClick={() => handleUpdateQuantity(item, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => handleUpdateQuantity(item, item.quantity + 1)}>+</button>
          </div>
          <p>Price: ₹{calculateItemPrice(item)}</p>
        </div>
        <button className="remove-item" onClick={() => handleRemoveFromCart(item)}>
          <X size={20} />
        </button>
      </div>
    ));
  };

  const renderProductCard = (product, isLarge = false) => (
    <div className={`card product-card h-100 ${isLarge ? 'large-card' : ''}`}>
      <div className="product-image-wrapper position-relative">
        <img
          src={product.mainImage}
          className="card-img-top product-image"
          alt={product.productName}
          onClick={() => navigate(`/products/${product._id}`)}
        />
        <div
          className="wishlist-icon position-absolute"
          onClick={(e) => {
            e.stopPropagation();
            if (wishlist && wishlist.some(item => item.productId && item.productId._id === product._id)) {
              handleRemoveFromWishlist(product);
            } else {
              handleAddToWishlist(product);
            }
          }}
        >
          <img
            src={
              wishlist && wishlist.some(item => item.productId && item.productId._id === product._id)
                ? heartIconFilled
                : heartIcon
            }
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
    const sortedProducts = products;
    const rows = [];
    let remainingProducts = [...sortedProducts];
    while (remainingProducts.length >= 7) {
      const regularProducts = remainingProducts.slice(0, 6);
      const featuredProduct = remainingProducts[6];
      const isEvenRow = rows.length % 2 === 0;
      rows.push(
        <div key={rows.length} className={`products-container mb-4 ${isEvenRow ? 'featured-right' : 'featured-left'}`}>
          {isEvenRow ? (
            <>
              <div className="regular-products">
                {regularProducts.map(product =>
                  product && product._id ? (
                    <div key={product._id} className="regular-product-item">
                      {renderProductCard(product)}
                    </div>
                  ) : null
                )}
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
                {regularProducts.map(product =>
                  product && product._id ? (
                    <div key={product._id} className="regular-product-item">
                      {renderProductCard(product)}
                    </div>
                  ) : null
                )}
              </div>
            </>
          )}
        </div>
      );
      remainingProducts = remainingProducts.slice(7);
    }
    if (remainingProducts.length > 0) {
      rows.push(
        <div key="remaining" className="remaining-products-container mb-4">
          {remainingProducts.map(product =>
            product && product._id ? (
              <div key={product._id} className="remaining-product-item">
                {renderProductCard(product)}
              </div>
            ) : null
          )}
        </div>
      );
    }
    return rows;
  };

  if (loading)
    return (
      <div className="text-center d-flex justify-content-center my-5 ">
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
          <path
            fill="#2F231F"
            d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z"
          >
            <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" />
          </path>
        </svg>
      </div>
    );
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-details-container">
      <ProductSEO product={product} />
      <button className="back-button" onClick={() => navigate('/products')}>
        <ArrowLeft size={20} /> Back to Products
      </button>
      <div className="product-details">
        <div className="image-section">
          <div className="main-image-container">
            {!imgLoaded && (
              <div className="image-loader">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
                  <path
                    fill="#2F231F"
                    d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z"
                  >
                    <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" />
                  </path>
                </svg>
              </div>
            )}
            {activeImage ? (
              <div className="image-wrapper">
                <img
                  src={activeImage}
                  alt={product?.productName || "Product Image"}
                  className={`product-details-image ${isLandscape ? 'landscape' : ''}`}
                  onLoad={(e) => {
                    setImgLoaded(true);
                    const { naturalWidth, naturalHeight } = e.target;
                    setIsLandscape(naturalWidth > naturalHeight);
                  }}
                  onError={() => setImgLoaded(true)}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                />
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
            {isMobile ? (
              <>
                <div className="frame-type-dropdown">
                  <select
                    value={selectedFrameType?._id || ''}
                    onChange={(e) => {
                      const ft = product.frameTypes.find((ft) => ft._id === e.target.value);
                      handleFrameTypeSelect(ft);
                    }}
                  >
                    <option value="" disabled>
                      Select Frame
                    </option>
                    {product.frameTypes?.map((ft) => (
                      <option key={ft._id} value={ft._id}>
                        {ft.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedFrameType && subFrameTypes.length > 0 && (
                  <div className="sub-frame-type-dropdown">
                    <select
                      value={selectedSubFrameType?._id || ''}
                      onChange={(e) => {
                        const st = subFrameTypes.find((st) => st._id === e.target.value);
                        handleSubFrameTypeSelect(st);
                      }}
                    >
                      <option value="" disabled>
                        Select SubFrame
                      </option>
                      {subFrameTypes.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedFrameType && sizes.length > 0 && (
                  <div className="size-dropdown">
                    <select
                      value={selectedSize?._id || ''}
                      onChange={(e) => {
                        const sz = sizes.find((sz) => sz._id === e.target.value);
                        handleSizeSelect(sz);
                      }}
                    >
                      <option value="" disabled>
                        Select Size
                      </option>
                      {sizes.map((sz) => (
                        <option key={sz._id} value={sz._id}>
                          {sz.name} - ₹{sz.price}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="frame-type-section">
                  <div className="frame-type-buttons d-flex">
                    {product.frameTypes?.map((frameType) => (
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
                {selectedFrameType && sizes.length > 0 && (
                  <div className="size-section">
                    <div className="size-buttons">
                      {sizes.map((sz) => (
                        <button
                          key={sz._id}
                          className={`option-button ${selectedSize?._id === sz._id ? 'active' : ''}`}
                          onClick={() => handleSizeSelect(sz)}
                        >
                          {sz.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
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
                (item) =>
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
              <p className="cart-total">Total: ₹{calculateItemPrice(cart)}</p>
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
          {Array.isArray(product.reviews) && product.reviews.length > 0 ? (
            product.reviews
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <strong className="review-author">
                      {review.user && review.user.firstName ? `${review.user.firstName}` : "Anonymous"}
                    </strong>
                    <span className="review-rating">
                      {review.rating} <Star size={16} className="star-icon" />
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  {Array.isArray(review.images) && review.images.length > 0 && (
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
      <ToastContainer position="top-right" autoClose={3000} />

      <Modal 
        show={showLoginModal} 
        onHide={() => setShowLoginModal(false)} 
        centered 
        dialogClassName="custom-login-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please login to perform this action.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => { setShowLoginModal(false); navigate('/login'); }}>
            Login
          </Button>
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductDetails;
