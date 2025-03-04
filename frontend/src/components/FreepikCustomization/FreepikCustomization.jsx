import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, X } from 'lucide-react';
import axios from 'axios';
import { frameBackgrounds } from '../constants/frameImages';
import './FreepikCustomization.css';
import Footer from '../Footer/Footer';

const FreepikCustomization = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : 'https://wallandtone.com');

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
  const [isMobile, setIsMobile] = useState(false);

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

  // Responsive check – if window width is less than 768px, show dropdowns
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  }, [apiUrl]);

  useEffect(() => {
    const fetchSubFrameTypes = async () => {
      if (selectedFrameType?._id) {
        try {
          const response = await axios.get(
            `${apiUrl}/api/sub-frame-types/${selectedFrameType._id}`
          );
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
  }, [selectedFrameType, apiUrl]);

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
  }, [apiUrl]);

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
      const cartItem = {
        quantity,
        frameType: selectedFrameType._id,
        subFrameType: selectedSubFrameType._id,
        size: selectedSize._id,
        isCustom: true,
        image: generatedImage
      };
      if (token) {
        const response = await axios.post(`${apiUrl}/api/cart/add`, cartItem, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
        const response = await axios.post(`${apiUrl}/api/wishlist/add`, wishlistItem, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  const handleRemoveItem = async (index) => {
    try {
      if (token) {
        await axios.delete(`${apiUrl}/api/cart/remove/${cart.items[index]._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updatedCart = [...cart.items];
        updatedCart.splice(index, 1);
        setCart({ ...cart, items: updatedCart });
        setAlertMessage("Item removed successfully!");
      } else {
        const updatedGuestCart = [...guestCart];
        updatedGuestCart.splice(index, 1);
        setCart({ items: updatedGuestCart, totalPrice: calculateTotalPrice() });
        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
        setAlertMessage("Item removed successfully!");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      setAlertMessage("Failed to remove item.");
    }
  };

  const handleUpdateQuantity = async (index, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      if (token) {
        const response = await axios.put(
          `${apiUrl}/api/cart/update`,
          {
            itemId: cart.items[index]._id,
            quantity: newQuantity
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (response.data.cart) {
          setCart(response.data.cart);
        }
      } else {
        const updatedGuestCart = [...guestCart];
        updatedGuestCart[index].quantity = newQuantity;
        setCart({ items: updatedGuestCart, totalPrice: calculateTotalPrice() });
        localStorage.setItem("guestCart", JSON.stringify(updatedGuestCart));
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setAlertMessage("Failed to update quantity.");
    }
  };

  // Compute orientation based on selected size.
  const orientation = selectedSize
    ? selectedSize.width > selectedSize.height
      ? 'landscape'
      : selectedSize.width < selectedSize.height
      ? 'portrait'
      : 'square'
    : 'portrait';

  // For square orientation, attempt to use a "square" background from frameBackgrounds if available.
  const backgroundImage =
    orientation === 'square'
      ? frameBackgrounds['square'] || frameBackgrounds[selectedSubFrameType?.name]
      : frameBackgrounds[selectedSubFrameType?.name];

  if (loading) return <div className="freepik-customization">Loading...</div>;
  if (error) return <div className="freepik-customization">{error}</div>;
  if (!generatedImage)
    return <div className="freepik-customization">No image selected for customization</div>;

  return (
    <div className="freepik-customization product-details-container">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
          <button className="close-alert" onClick={() => setError(null)}>
            ×
          </button>
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
                src={backgroundImage}
                alt="Frame background"
                className={`frame-background ${orientation}`}
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
          <h3 className="product-title">
            {prompt ? prompt : 'Customize Your Artwork'}
          </h3>
          <div className="options-section">
            <div className="frame-type-section">
              {isMobile ? (
                <select
                  className="dropdown-select"
                  value={selectedFrameType?._id || ''}
                  onChange={(e) => {
                    const frame = frameTypes.find((ft) => ft._id === e.target.value);
                    handleFrameTypeSelect(frame);
                  }}
                >
                  {frameTypes.map((ft) => (
                    <option key={ft._id} value={ft._id}>
                      {ft.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="frame-type-buttons">
                  {frameTypes.map((frameType) => (
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
              )}
            </div>

            {selectedFrameType && subFrameTypes.length > 0 && (
              <div className="sub-frame-type-section">
                {isMobile ? (
                  <select
                    className="dropdown-select"
                    value={selectedSubFrameType?._id || ''}
                    onChange={(e) => {
                      const subFrame = subFrameTypes.find(
                        (sft) => sft._id === e.target.value
                      );
                      handleSubFrameTypeSelect(subFrame);
                    }}
                  >
                    {subFrameTypes.map((subFrameType) => (
                      <option key={subFrameType._id} value={subFrameType._id}>
                        {subFrameType.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="sub-frame-type-buttons">
                    {subFrameTypes.map((subFrameType) => (
                      <button
                        key={subFrameType._id}
                        className={`option-button ${
                          selectedSubFrameType?._id === subFrameType._id ? 'active' : ''
                        }`}
                        onClick={() => handleSubFrameTypeSelect(subFrameType)}
                        disabled={loadingSubFrame}
                      >
                        {loadingSubFrame &&
                        selectedSubFrameType?._id === subFrameType._id
                          ? 'Loading...'
                          : subFrameType.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedSubFrameType && sizes.length > 0 && (
              <div className="size-section">
                {isMobile ? (
                  <select
                    className="dropdown-select"
                    value={selectedSize?._id || ''}
                    onChange={(e) => {
                      const size = sizes.find((s) => s._id === e.target.value);
                      handleSizeSelect(size);
                    }}
                  >
                    {sizes.map((size) => (
                      <option key={size._id} value={size._id}>
                        {size.width} x {size.height}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="size-buttons">
                    {sizes.map((size) => (
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
                )}
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

            {cart.items?.length === 0 ? (
              <div className="empty-cart-message">
                <p>Your cart is empty.</p>
                <button className="continue-shopping" onClick={() => setSubCartOpen(false)}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
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
                        <p>
                          <strong>Frame:</strong> {item.frameType?.name || 'N/A'}
                        </p>
                        <p>
                          <strong>Type:</strong> {item.subFrameType?.name || 'N/A'}
                        </p>
                        <p>
                          <strong>Size:</strong> {item.size?.width} x {item.size?.height}
                        </p>

                        <div className="quantity-controls">
                          <button
                            className="quantity-btn"
                            onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(index, parseInt(e.target.value))
                            }
                            className="quantity-input"
                            min="1"
                          />
                          <button
                            className="quantity-btn"
                            onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        <p>
                          <strong>Price:</strong> ₹
                          {(
                            item.quantity *
                            (parseFloat(item.frameType?.price || 0) +
                              parseFloat(item.subFrameType?.price || 0) +
                              parseFloat(item.size?.price || 0))
                          ).toFixed(2)}
                        </p>

                        <button className="remove-item" onClick={() => handleRemoveItem(index)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <p className="cart-total">
                    <strong>Total:</strong> ₹{cart.totalPrice?.toFixed(2) || '0.00'}
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreepikCustomization;
