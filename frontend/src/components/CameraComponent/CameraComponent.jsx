import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { DraggableCore } from 'react-draggable';
import heartIcon from '../../assets/icons/heart-icon.svg';
import heartIconFilled from '../../assets/icons/heart-icon-filled.svg';
import whiteLogo from '../../assets/logo/wall-n-tone-white.png';
import './CameraComponent.css';
import WoodenDarkBrown from '../../assets/FrameBlank/Dark.png';


const CameraComponent = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productPositions, setProductPositions] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authAction, setAuthAction] = useState(null);
  const [cartMessage, setCartMessage] = useState(null);
  const [wishlistAlert, setWishlistAlert] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [frameTypes, setFrameTypes] = useState([]);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [selectedFrameType, setSelectedFrameType] = useState(null);
  const [selectedSubFrameType, setSelectedSubFrameType] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [wallImage, setWallImage] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [activeImage, setActiveImage] = useState(null);

  // Fetch wishlist products, cart, and wishlist data
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!token) return;

      try {
        const wishlistResponse = await fetch('http://localhost:5000/api/wishlist', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!wishlistResponse.ok) {
          throw new Error('Failed to fetch wishlist products');
        }

        const wishlistData = await wishlistResponse.json();

        const wishlistProductIds = wishlistData.items.filter((item) => item.productId !== null).map((item) => item.productId._id);
        console.log('wishlistProductIds:', wishlistProductIds);

        const productsResponse = await fetch('http://localhost:5000/api/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          params: { ids: wishlistProductIds.join(',') },
        });

        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }

        const productsData = await productsResponse.json();
        setProducts(productsData);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchCartAndWishlist = async () => {
      if (!token) return;

      try {
        const cartResponse = await fetch('http://localhost:5000/api/cart', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const wishlistResponse = await fetch('http://localhost:5000/api/wishlist', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!cartResponse.ok || !wishlistResponse.ok) {
          throw new Error('Failed to fetch cart and wishlist data');
        }

        const cartData = await cartResponse.json();
        const wishlistData = await wishlistResponse.json();

        console.log('wishlistData:', wishlistData);

        const wishlist = wishlistData.items.filter((item) => item.productId !== null);
        setCart(cartData);
        setWishlist(wishlist);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchWishlistProducts();
    fetchCartAndWishlist();
  }, [token]);

  // Handle authentication popup
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

  const executeAuthAction = () => {
    if (authAction) {
      authAction();
      setAuthAction(null);
    }
  };

  // Start camera
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError(err.message || 'Unable to access the camera.');
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      setCapturedImage(canvasRef.current.toDataURL('image/png'));
    }
  };

// Handle product selection
const handleProductSelect = (product) => {
  if (!wallImage) {
    setShowAuthPopup(true);
    setAuthAction(null);
    setCartMessage("Please select your wall first or upload wall image");
    return;
  }

  if (selectedProducts.some((item) => item._id === product._id)) return;
  setSelectedProducts((prevSelected) => [...prevSelected, product]);
  setProductPositions((prevPositions) => [
    ...prevPositions,
    { x: 100, y: 100 },
  ]);
  setSelectedProduct(product);
  setProductDetails({});
  setSelectedFrameType(null);
  setSelectedSubFrameType(null);
  setSelectedSize(null);
  fetchProductData(product._id);

  // Display product main image in preview
  const productIndex = selectedProducts.indexOf(product);
  const productImage = document.querySelectorAll('.selected-product img.product-on-wall')[productIndex];
  if (productImage) {
    productImage.src = `http://localhost:5000/${product.mainImage}`;
  }
};


  // Handle product click
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    fetchProductData(product._id);
  };

  // Fetch product data
  const fetchProductData = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`);
      if (!response.ok) {
        throw new Error(`Error fetching product data: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setProductDetails(data);
      fetchFrameTypes(data._id);
      fetchSubFrameTypes(data._id);
      fetchSizes(data._id);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

// Handle size selection
const handleSizeSelect = (size) => {
  setSelectedSize(size);
  setProductDetails((prevDetails) => ({ ...prevDetails, size }));

  // Update product image size for the selected product
  const productIndex = selectedProducts.indexOf(selectedProduct);
  const productImage = document.querySelectorAll('.selected-product img.product-on-wall')[productIndex];
  if (productImage) {
    const aspectRatio = productImage.naturalWidth / productImage.naturalHeight;
    const isPortrait = size.height > size.width; // Check if the selected size is portrait or landscape
    const width = isPortrait ? size.width *5 : size.height *5; // Increase the width by 500%
    const height = isPortrait ? size.height *5 : size.width *5; // Increase the height by 500%
    const scaleFactor = width / productImage.naturalWidth;
    const newWidth = productImage.naturalWidth * scaleFactor;
    const newHeight = productImage.naturalHeight * scaleFactor;
    if (size.width === size.height) {
      productImage.style.width = `${newWidth}px`;
      productImage.style.height = `${newWidth}px`;
    } else if (size.width > size.height) {
      productImage.style.width = `${newWidth}px`;
      productImage.style.height = `${newHeight}px`;
    } else {
      productImage.style.width = `${newHeight}px`;
      productImage.style.height = `${newWidth}px`;
    }
    productImage.style.border = 'none'; // Remove border color
  }
};

  // Handle product removal
  const handleProductRemove = (product) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.filter((item) => item._id !== product._id)
    );
    setProductPositions((prevPositions) =>
      prevPositions.filter((_, index) => selectedProducts[index]._id !== product._id)
    );
    setProductDetails({});
    setSelectedProduct(null);
  };

  // Handle drag start and stop
  const handleDragStart = () => setIsDragging(true);
  const handleDragStop = (e, data, index) => {
    setIsDragging(false);
    const updatedPositions = [...productPositions];
    updatedPositions[index] = { x: data.x, y: data.y };
    setProductPositions(updatedPositions);
  };

  // Add to wishlist
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

    try {
      await fetch('http://localhost:5000/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });

      setWishlist((prevWishlist) => [...prevWishlist, { productId: product }]);
    } catch (error) {
      console.error('Error adding product to wishlist:', error);
    }
  };

  // Remove from wishlist
  const handleRemoveFromWishlist = async (wishlistItem) => {
    try {
      await fetch(`http://localhost:5000/api/wishlist/remove/${wishlistItem.productId._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWishlist((prevWishlist) =>
        prevWishlist.filter((item) => item._id !== wishlistItem._id)
      );
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
    }
  };

  // Handle wall photo upload
  const handleUploadWallPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWallImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch frame types
  const fetchFrameTypes = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/frame-types`);
      if (!response.ok) {
        if (response.status === 404) {
          console.error('Frame types not found for product ID:', productId);
        } else {
          throw new Error(`Error fetching frame types: ${response.status} ${response.statusText}`);
        }
      }
      const data = await response.json();
      setFrameTypes(data);
    } catch (error) {
      console.error('Error fetching frame types:', error);
    }
  };

  // Fetch sub frame types
  const fetchSubFrameTypes = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/sub-frame-types`);
      if (!response.ok) {
        if (response.status === 404) {
          console.error('Sub frame types not found for product ID:', productId);
        } else {
          throw new Error(`Error fetching sub frame types: ${response.status} ${response.statusText}`);
        }
      }
      const data = await response.json();
      setSubFrameTypes(data);
    } catch (error) {
      console.error('Error fetching sub frame types:', error);
    }
  };

  // Fetch sizes
  const fetchSizes = async (productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/sizes`);
      const data = await response.json();
      console.log('Sizes:', data);
      setSizes(data);
    } catch (error) {
      console.error('Error fetching sizes:', error);
    }
  };

  const handleSubFrameTypeSelect = async (subFrameType) => {
    console.log("🟢 Selected Subframe Type:", subFrameType);
  
    setSelectedSubFrameType(subFrameType);
  
    // Ensure image URL is correctly formatted
    const formattedImageUrl = subFrameType.imageUrl?.startsWith("http")
      ? subFrameType.imageUrl
      : `http://localhost:5000/uploads/${subFrameType.imageUrl}`;
  
    // Update product details in state
    setProductDetails((prevDetails) => ({
      ...prevDetails,
      subFrameType: { ...subFrameType, imageUrl: formattedImageUrl },
    }));
  
    // Store in local storage
    localStorage.setItem("subFrameType", JSON.stringify({ ...subFrameType, imageUrl: formattedImageUrl }));
  
    try {
      console.log(`📤 Fetching image from API: http://localhost:5000/api/products/${selectedProduct._id}/subframe-image/${subFrameType._id}`);
      
      const response = await fetch(
        `http://localhost:5000/api/products/${selectedProduct._id}/subframe-image/${subFrameType._id}`
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("✅ API Response:", data);
  
      if (data.imageUrl) {
        // Ensure correct URL formatting for fetched image
        const finalImageUrl = data.imageUrl.startsWith("http")
          ? data.imageUrl
          : `${data.imageUrl}`;
  
        console.log("🖼 Updating product image to:", finalImageUrl);
  
        // ✅ FIX: Update active image state
        setActiveImage(finalImageUrl);
  
        const productIndex = selectedProducts.indexOf(selectedProduct);
        const productImages = document.querySelectorAll(".selected-product img.product-on-wall");
  
        if (productImages[productIndex]) {
          productImages[productIndex].src = finalImageUrl;
        } else {
          console.warn("⚠ No matching image element found in DOM.");
        }
      }
    } catch (err) {
      console.error("❌ Error fetching subframe image:", err);
    }
  };
  
  
  


  // Handle add to cart
  const handleAddToCart = async () => {
    if (!selectedProduct || !selectedFrameType || !selectedSubFrameType || !selectedSize) return;

    try {
      const cartProduct = {
        productId: selectedProduct._id,
        frameTypeId: selectedFrameType._id,
        subFrameTypeId: selectedSubFrameType._id,
        sizeId: selectedSize._id,
        quantity: 1,
      };

      console.log('Request body:', cartProduct);

      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cartProduct),
      });

      if (!response.ok) {
        throw new Error(`Error adding product to cart: ${response.status} ${response.statusText}`);
      }

      const cartData = await response.json();
      console.log('Cart data:', cartData);
      setCart(cartData);
      setCartMessage('Product added to cart successfully!');
      setTimeout(() => setCartMessage(null), 3000);
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

// Handle frame type selection
const handleFrameTypeSelect = (frameType) => {
  setSelectedFrameType(frameType);
  setProductDetails((prevDetails) => ({ ...prevDetails, frameType }));
  localStorage.setItem('frameType', JSON.stringify(frameType));
  fetchSubFrameTypesByFrameType(frameType._id);

  // Update product image background color based on selected frame type
  const productIndex = selectedProducts.indexOf(selectedProduct);
  const productImage = document.querySelectorAll('.selected-product img.product-on-wall')[productIndex];
  if (productImage) {
    const frameTypeToBackgroundColor = {
      
    };
    
    productImage.style.padding = '10px';
    productImage.style.backgroundImage = `${frameTypeToBackgroundColor[frameType.name]}`;
    productImage.style.backgroundClip = 'padding-box';
    productImage.style.backgroundOrigin = 'border-box';
    productImage.style.backgroundSize = '100% 100%';
    productImage.style.backgroundRepeat = 'no-repeat';
    productImage.style.backgroundPosition = 'center';
    productImage.style.border = ''; // Remove border color
  }
  const productPrice = productDetails.price + frameType.price;
  setProductDetails((prevDetails) => ({ ...prevDetails, price: productPrice }));
};

  // Fetch sub frame types by frame type
  const fetchSubFrameTypesByFrameType = async (frameTypeId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sub-frame-types/${frameTypeId}`);
      if (!response.ok) {
        throw new Error(`Error fetching sub frame types: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setSubFrameTypes(data);
      setSelectedSubFrameType(null);
    } catch (error) {
      console.error('Error fetching sub frame types:', error);
    }
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
    let totalPrice = 0;
    selectedProducts.forEach((product, index) => {
      const item = {
        productId: product,
        frameType: selectedFrameType,
        subFrameType: selectedSubFrameType,
        size: selectedSize,
        quantity: 1,
      };
      const price = calculateItemPrice(item);
      totalPrice += parseFloat(price);
    });
    return totalPrice.toFixed(2);
  };

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="camera-component container d-flex">
      {/* Popup */}
      <Modal show={showAuthPopup} onHide={handleAuthPopupClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Wall Selection Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cartMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAuthPopupClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Left Side: Select a Frame to Preview */}
      <div className="frame-preview-section" style={{ position: 'fixed', top: 0, left: 0, width: '30%', height: '100vh', overflowY: 'auto', padding: 20 }}>
        <div className="logo-container">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img src={whiteLogo} alt="Logo" className="logo" />
          </Link>
        </div>
        <div className="products-container" style={{ padding: 20, overflowY: 'auto' }}>
          <h4 className="text-center">Select a Frame to Preview</h4>
          <div className="row g-3">
            {products.map((product) => (
              <div key={product._id} className="col-6 mb-4" onClick={() => handleProductSelect(product)}>
                <div className="card product-card h-100" style={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
                  <div className="product-image-wrapper position-relative">
                    <img
                      src={`${product.mainImage}`}
                      className="card-img-top product-image"
                      alt={product.productName}
                      style={{ objectFit: 'cover', height: '150px', width: '100%' }}
                    />
                    <div
                      className="wishlist-icon position-absolute"
                      onClick={(e) => {
                        e.stopPropagation();
                        const productId = product._id;
                        const productInWishlist = wishlist.find((item) => item.productId && item.productId._id === productId);
                        if (productInWishlist) {
                          handleRemoveFromWishlist(productInWishlist);
                        } else {
                          handleAddToWishlist(product);
                        }
                      }}
                    >
                      <img
                        src={wishlist && wishlist.length > 0 && wishlist.some((item) => item.productId && item.productId._id === product._id) ? heartIconFilled : heartIcon}
                        alt="Heart Icon"
                      />
                    </div>
                  </div>
                  <div className="card-body text-center d-flex flex-column justify-content-between">
                    <h5 className="card-title product-title">{product.productName}</h5>
                    <p className="card-text text-muted">{product.description.slice(0, 100)}...</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Camera Preview */}
      <div className="camera-preview-section" style={{ width: '70%', marginLeft: '30%' }}>
        <div className="preview-container text-center">
          <div className="preview-frame" style={{ position: 'relative' }}>
            {wallImage ? (
              <img src={wallImage} alt="Wall Preview" className="preview-image" />
            ) : (
              <div className="overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'black', opacity: 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <Button onClick={startCamera} variant="primary" className="mb-2">
                    Start Camera
                  </Button>
                  <Button onClick={capturePhoto} variant="secondary" className="mb-2">
                    Capture Photo
                  </Button>
                  <Button
                    variant="success"
                    className="mb-2"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Upload Wall Photo
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleUploadWallPhoto}
                    accept="image/*"
                  />
                </div>
              </div>
            )}
            {selectedProducts.map((product, index) => (
              <DraggableCore
                key={product._id}
                onStart={handleDragStart}
                onStop={(e, data) => handleDragStop(e, data, index)}
                onDrag={(e, data) => {
                  const updatedPositions = [...productPositions];
                  updatedPositions[index] = { x: data.x, y: data.y };
                  setProductPositions(updatedPositions);
                }}
              >
                <div
                  className="selected-product"
                  style={{
                    left: productPositions[index]?.x,
                    top: productPositions[index]?.y,
                  }}
                  onMouseEnter={(e) => e.currentTarget.querySelector('.remove-from-preview').style.display = 'block'}
                  onMouseLeave={(e) => e.currentTarget.querySelector('.remove-from-preview').style.display = 'none'}
                  onClick={() => handleProductClick(product)}
                >
                  <img
                    src={`${product.mainImage}`}
                    alt={product.productName}
                    className="product-on-wall"
                  />
                  <div
                    className="remove-from-preview"
                    onClick={() => handleProductRemove(product)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(255, 0, 0, 0.6)',
                      border: 'none',
                      borderRadius: '50%',
                      padding: '5px',
                      cursor: 'pointer',
                      display: 'none',
                      opacity: '0.8',
                    }}
                  >
                    <span
                      style={{
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '18px',
                      }}
                    >
                      X
                    </span>
                  </div>
                </div>
              </DraggableCore>
            ))}
          </div>
        </div>
        {selectedProduct && (
          <div className="product-details">
            <h4 className="text-center">Product Details</h4>
            <div className="row g-3">
              <div className="col-6">
                <label>Frame Type:</label>
                <select
                  className="form-select"
                  value={productDetails.frameType?._id}
                  onChange={(e) => handleFrameTypeSelect(frameTypes.find((frameType) => frameType._id === e.target.value))}
                >
                  <option value="">Select Frame Type</option>
                  {frameTypes && frameTypes.length > 0 ? (
                    frameTypes.map((frameType) => (
                      <option key={frameType._id} value={frameType._id}>
                        {frameType.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No frame types available</option>
                  )}
                </select>
              </div>
              <div className="col-6">
  <label>Sub Frame Type:</label>
  <select
    className="form-select"
    value={productDetails.subFrameType?._id}
    onChange={(e) => handleSubFrameTypeSelect(subFrameTypes.find((subFrameType) => subFrameType._id === e.target.value))}
  >
    <option value="">Select Sub Frame Type</option>
    {subFrameTypes && subFrameTypes.length > 0 ? (
      subFrameTypes.map((subFrameType) => (
        <option key={subFrameType._id} value={subFrameType._id}>
          {subFrameType.name}
        </option>
      ))
    ) : (
      <option value="">No sub frame types available</option>
    )}
  </select>
  {productDetails.subFrameType && (
    <img
    src={`http://localhost:5000/uploads/${productDetails.subFrameType.imageUrl}`}
      alt={productDetails.subFrameType.name}
      style={{ width: '100%', height: '100px', objectFit: 'cover' }}
    />
  )}
</div>
              <div className="col-6">
                <label>Size:</label>
                <select
                  className="form-select"
                  value={productDetails.size?._id}
                  onChange={(e) => handleSizeSelect(sizes.find((size) => size._id === e.target.value))}
                >
                  <option value="">Select Size</option>
                  {sizes && sizes.length > 0 ? (
                    sizes.map((size) => (
                      <option key={size._id} value={size._id}>
                        {size.width} x {size.height}
                      </option>
                    ))
                  ) : (
                    <option value="">No sizes available</option>
                  )}
                </select>
              </div>
              <div className="col-6">
                <Button onClick={handleAddToCart} variant="primary">
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="controls mt-3 d-flex">
          <Button onClick={() => setWallImage('/assets/placeholder-wall.jpg')} variant="primary">
            Wall 1
          </Button>
          <Button onClick={() => setWallImage('/assets/placeholder-wall1.jpg')} variant="primary">
            Wall 2
          </Button>
        </div>
        <div className="total-price-section">
          <h4 className="text-center">Total Price</h4>
          <p className="text-center">Rs. {calculateTotalPrice()}</p>
        </div>
      </div>
    </div>
  );
};

export default CameraComponent;