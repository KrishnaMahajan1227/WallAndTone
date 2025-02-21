import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, X } from 'lucide-react';
import axios from 'axios';
import { frameBackgrounds } from '../constants/frameImages';
import './FreepikCustomization.css';

const FreepikCustomization = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/';

  const location = useLocation();
  const navigate = useNavigate();
  const generatedImage = location.state?.image;
  const prompt = location.state?.prompt;
  const isCustom = location.state?.isCustom;
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [frameTypes, setFrameTypes] = useState([]);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [alertMessage, setAlertMessage] = useState('');
  const [activeImage, setActiveImage] = useState(null);
  const [subCartOpen, setSubCartOpen] = useState(false);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [wishlist, setWishlist] = useState([]);
  const [loadingSubFrame, setLoadingSubFrame] = useState(false);

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

  const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
  const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');

  useEffect(() => {
    const fetchFrameTypes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/frame-types`);
        setFrameTypes(response.data);
        if (response.data.length > 0) {
          setSelectedFrameType(response.data[0]);
        }
      } catch (err) {
        setError('Failed to fetch frame types');
        console.error(err);
      }
    };
    fetchFrameTypes();
  }, []);

  useEffect(() => {
    const fetchSubFrameTypes = async () => {
      if (selectedFrameType?._id) {
        try {
          const response = await axios.get(`${apiUrl}/api/sub-frame-types/${selectedFrameType._id}`);
          setSubFrameTypes(response.data);
          if (response.data.length > 0) {
            setSelectedSubFrameType(response.data[0]);
          }
        } catch (err) {
          setError('Failed to fetch sub-frame types');
          console.error(err);
        }
      }
    };
    fetchSubFrameTypes();
  }, [selectedFrameType]);

  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/admin/sizes/getsizes`);
        setSizes(response.data);
        if (response.data.length > 0) {
          setSelectedSize(response.data[0]);
        }
      } catch (err) {
        setError('Failed to fetch sizes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSizes();
  }, []);

  useEffect(() => {
    if (selectedFrameType && selectedSubFrameType && selectedSize) {
      localStorage.setItem('selectedFrameType', JSON.stringify(selectedFrameType));
      localStorage.setItem('selectedSubFrameType', JSON.stringify(selectedSubFrameType));
      localStorage.setItem('selectedSize', JSON.stringify(selectedSize));
    }
  }, [selectedFrameType, selectedSubFrameType, selectedSize]);

  const calculateTotalPrice = () => {
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) return 0;

    let total = 0;
    if (selectedFrameType?.price) total += parseFloat(selectedFrameType.price);
    if (selectedSubFrameType?.price) total += parseFloat(selectedSubFrameType.price);
    if (selectedSize?.price) total += parseFloat(selectedSize.price);

    return (total * quantity).toFixed(2);
  };

  const handleQuantityChange = (e) => {
    const newQuantity = Math.max(1, parseInt(e.target.value, 10) || 1);
    setQuantity(newQuantity);
  };

  const handleFrameTypeSelect = (frameType) => {
    setSelectedFrameType(frameType);
    setSelectedSubFrameType(null);
    setActiveImage(generatedImage);
  };

  const handleSubFrameTypeSelect = async (subFrameType) => {
    setLoadingSubFrame(true);
    setSelectedSubFrameType(subFrameType);
    setActiveImage(generatedImage);
    setLoadingSubFrame(false);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = async () => {
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) {
      setAlertMessage('Please select all options before adding to cart');
      return;
    }
  
    try {
      // Create the cart item without image upload first
      const cartItem = {
        quantity,
        frameType: selectedFrameType._id,
        subFrameType: selectedSubFrameType._id,
        size: selectedSize._id,
        isCustom: true,
        image: generatedImage // Use the image directly
      };
  
      if (token) {
        const response = await axios.post(
          `${apiUrl}/api/cart/add`,
          cartItem,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
  
        if (response.data.cart) {
          setCart(response.data.cart);
          setAlertMessage('Added to cart successfully!');
          setSubCartOpen(true);
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        const updatedCart = [...guestCart, cartItem];
        setCart({ items: updatedCart, totalPrice: parseFloat(calculateTotalPrice()) });
        localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        setAlertMessage('Added to cart successfully!');
        setSubCartOpen(true);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      setAlertMessage(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) {
      setAlertMessage('Please select all options before adding to wishlist');
      return;
    }

    try {
      // First, upload the image to Cloudinary
      const imageFormData = new FormData();
      imageFormData.append('image', generatedImage);
      
      const uploadResponse = await axios.post(
        `${apiUrl}/api/upload/image`,
        imageFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const wishlistItem = {
        image: uploadResponse.data.imageUrl,
        frameType: selectedFrameType._id,
        subFrameType: selectedSubFrameType._id,
        size: selectedSize._id,
        isCustom: true
      };

      if (token) {
        const response = await axios.post(
          `${apiUrl}/api/wishlist/add`,
          wishlistItem,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setWishlist(response.data.wishlist);
        setAlertMessage('Added to wishlist successfully!');
      } else {
        const updatedWishlist = [...guestWishlist, wishlistItem];
        setWishlist(updatedWishlist);
        localStorage.setItem('guestWishlist', JSON.stringify(updatedWishlist));
        setAlertMessage('Added to wishlist successfully!');
      }
    } catch (err) {
      setAlertMessage('Failed to add to wishlist');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!generatedImage) return <div>No image selected for customization</div>;

  return (
    <div className="product-details-container">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button className="close-alert" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Uploading image...</div>
        </div>
      )}

      {alertMessage && (
        <div className="alert alert-success" onClick={() => setAlertMessage('')}>
          {alertMessage}
          <button className="close-alert">×</button>
        </div>
      )}

      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="product-details">
        <div className="image-section">
          <div className="main-image-container">
            {selectedSubFrameType && (
              <img
                src={frameBackgrounds[selectedSubFrameType.name]}
                alt="Frame background"
                className="frame-background"
              />
            )}
            <img
              src={activeImage || generatedImage}
              alt="Generated artwork"
              className="generated-artwork"
            />
          </div>
        </div>

        <div className="info-section">
          <h1 className="product-title">Customize Your Artwork</h1>

          <div className="options-section">
            <div className="frame-type-section">
              <div className="frame-type-buttons">
                {frameTypes.map(frameType => (
                  <button
                    key={frameType._id}
                    className={`option-button ${
                      selectedFrameType?._id === frameType._id ? 'active' : ''
                    }`}
                    onClick={() => handleFrameTypeSelect(frameType)}
                  >
                    {frameType.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedFrameType && subFrameTypes.length > 0 && (
              <div className="sub-frame-type-section">
                <div className="sub-frame-type-buttons">
                  {subFrameTypes.map(subFrameType => (
                    <button
                      key={subFrameType._id}
                      className={`option-button ${
                        selectedSubFrameType?._id === subFrameType._id ? 'active' : ''
                      }`}
                      onClick={() => handleSubFrameTypeSelect(subFrameType)}
                      disabled={loadingSubFrame}
                    >
                      {loadingSubFrame && selectedSubFrameType?._id === subFrameType._id
                        ? 'Loading...'
                        : subFrameType.name}
                    </button>
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
                      className={`option-button ${
                        selectedSize?._id === size._id ? 'active' : ''
                      }`}
                      onClick={() => handleSizeSelect(size)}
                    >
                      {size.width} x {size.height}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="quantity-section">
            <label htmlFor="quantity">Quantity:</label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="quantity-input"
            />
          </div>

          <div className="price-section">
            <h3>Total Price: ₹{calculateTotalPrice()}</h3>
          </div>

          <div className="action-buttons">
            <button
              className="add-to-cart"
              onClick={handleAddToCart}
              disabled={!selectedFrameType || !selectedSubFrameType || !selectedSize}
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
            <button
              className="add-to-wishlist"
              onClick={handleAddToWishlist}
              disabled={!selectedFrameType || !selectedSubFrameType || !selectedSize}
            >
              <Heart size={20} />
              Add to Wishlist
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
            
            <div className="cart-items">
              {cart.items?.map((item, index) => (
                <div key={index} className="cart-item">
                  <img
                    src={item.image || item.productId?.mainImage}
                    alt="Product"
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <h3>{item.isCustom ? 'Customized Artwork' : item.productId?.productName}</h3>
                    <p>Frame: {item.frameType?.name}</p>
                    <p>Type: {item.subFrameType?.name}</p>
                    <p>Size: {item.size?.width} x {item.size?.height}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{(item.quantity * (
                      parseFloat(item.frameType?.price || 0) +
                      parseFloat(item.subFrameType?.price || 0) +
                      parseFloat(item.size?.price || 0)
                    )).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-footer">
              <p className="cart-total">
                Total: ₹{cart.totalPrice?.toFixed(2) || '0.00'}
              </p>
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
    </div>
  );
};

export default FreepikCustomization;