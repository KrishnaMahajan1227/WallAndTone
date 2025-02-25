import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { DraggableCore } from 'react-draggable';
import heartIcon from '../../assets/icons/heart-icon.svg';
import heartIconFilled from '../../assets/icons/heart-icon-filled.svg';
import whiteLogo from '../../assets/logo/wall-n-tone-white.png';
import './CameraComponent.css';

const CameraComponent = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : 'https://wallandtone.com');

  // Global states
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productPositions, setProductPositions] = useState([]);
  // Each product's preview dimensions (object with width & height)
  const [productDimensions, setProductDimensions] = useState([]);

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);

  // For the active product (whose options are being edited)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [activeImage, setActiveImage] = useState(null);

  // Option data for the active product
  const [frameTypes, setFrameTypes] = useState([]);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [selectedFrameType, setSelectedFrameType] = useState(null);
  const [selectedSubFrameType, setSelectedSubFrameType] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Wall preview background and camera capture
  const [wallImage, setWallImage] = useState(null);
  // capturedImage holds the photo taken from camera until user confirms it
  const [capturedImage, setCapturedImage] = useState(null);
  const [subFrameThumbnails, setSubFrameThumbnails] = useState([]);
  const [loadingSubFrame, setLoadingSubFrame] = useState(false);

  // Camera active flag – true when live video is shown
  const [cameraActive, setCameraActive] = useState(false);

  // Refs for camera and file input
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // ------------------- FETCH DATA -------------------
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const wishlistRes = await fetch(`${apiUrl}/api/wishlist`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        if (!wishlistRes.ok) throw new Error('Failed to fetch wishlist');
        const productsRes = await fetch(`${apiUrl}/api/products`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!productsRes.ok) throw new Error('Failed to fetch products');
        const productsData = await productsRes.json();
        setProducts(productsData);

        const cartRes = await fetch(`${apiUrl}/api/cart`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        if (!cartRes.ok) throw new Error('Failed to fetch cart');
        const cartData = await cartRes.json();
        setCart(cartData);

        const wishlistData = await wishlistRes.json();
        const wishlistItems = wishlistData.items.filter(item => item.productId !== null);
        setWishlist(wishlistItems);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [token, apiUrl]);

  // ------------------- CAMERA FUNCTIONS -------------------
  const startCamera = async () => {
    setError(null);
    try {
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const constraints = { video: { facingMode: isMobile ? { ideal: 'environment' } : 'user' } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setError(err.message || 'Unable to access the camera.');
    }
  };

  const capturePhoto = () => {
    if (canvasRef.current && videoRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      setCapturedImage(canvasRef.current.toDataURL('image/png'));
      setCameraActive(false);
    }
  };

  // ------------------- WALL PHOTO UPLOAD & RETAKE -------------------
  const handleUploadWallPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWallImage(reader.result);
        setCameraActive(false);
        setCapturedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRetakeWall = () => {
    setWallImage(null);
    setCapturedImage(null);
    setCameraActive(true);
  };

  // ------------------- AUTH HANDLERS -------------------
  const handleAuthRequired = () => setShowAuthPopup(true);
  const handleAuthPopupClose = () => setShowAuthPopup(false);
  const handleAuthLogin = () => {
    setShowAuthPopup(false);
    navigate('/login');
  };

  // ------------------- PRODUCT PREVIEW & SELECTION -------------------
  const handleProductSelect = (product) => {
    if (!wallImage && !capturedImage && !cameraActive) {
      setShowAuthPopup(true);
      setCartMessage('Please select your wall first or upload/capture a wall photo');
      return;
    }
    if (selectedProducts.some(p => p._id === product._id)) return;
    setSelectedProducts(prev => [...prev, product]);
    setProductPositions(prev => [...prev, { x: 200, y: 200 }]);
    // Default dimension for better visibility
    setProductDimensions(prev => [...prev, { width: 300, height: 300 }]);
    setSelectedProduct(product);
    setProductDetails({});
    setSelectedFrameType(null);
    setSelectedSubFrameType(null);
    setSelectedSize(null);
    fetchProductData(product._id);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    fetchProductData(product._id);
  };

  const fetchProductData = async (productId) => {
    try {
      const res = await fetch(`${apiUrl}/api/products/${productId}`);
      if (!res.ok) throw new Error(`Error fetching product data: ${res.status}`);
      const data = await res.json();
      setProductDetails(data);
      fetchFrameTypes(data._id);
      fetchSubFrameTypes(data._id);
      fetchSizes(data._id);
      setActiveImage(data.mainImage);
    } catch (err) {
      console.error('Error fetching product data:', err);
    }
  };

  // ------------------- FRAME, SUBFRAME & SIZE HANDLERS -------------------
  const fetchFrameTypes = async (productId) => {
    try {
      const res = await fetch(`${apiUrl}/api/products/${productId}/frame-types`);
      if (!res.ok) throw new Error(`Error fetching frame types: ${res.status}`);
      const data = await res.json();
      setFrameTypes(data);
      if (data.length > 0 && !selectedFrameType) {
        setSelectedFrameType(data[0]);
        localStorage.setItem('frameType', JSON.stringify(data[0]));
        fetchSubFrameTypesByFrameType(data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching frame types:', err);
    }
  };

  const fetchSubFrameTypes = async (productId) => {
    try {
      const res = await fetch(`${apiUrl}/api/products/${productId}/sub-frame-types`);
      if (!res.ok) throw new Error(`Error fetching sub frame types: ${res.status}`);
      const data = await res.json();
      setSubFrameTypes(data);
      if (data.length > 0 && !selectedSubFrameType) {
        setSelectedSubFrameType(data[0]);
        localStorage.setItem('subFrameType', JSON.stringify(data[0]));
      }
    } catch (err) {
      console.error('Error fetching sub frame types:', err);
    }
  };

  const fetchSizes = async (productId) => {
    try {
      const res = await fetch(`${apiUrl}/api/products/${productId}/sizes`);
      const data = await res.json();
      setSizes(data);
      if (data.length > 0 && !selectedSize) {
        setSelectedSize(data[0]);
      }
    } catch (err) {
      console.error('Error fetching sizes:', err);
    }
  };

  const handleFrameTypeSelect = (frameType) => {
    setSelectedFrameType(frameType);
    setProductDetails(prev => ({ ...prev, frameType }));
    localStorage.setItem('frameType', JSON.stringify(frameType));
    fetchSubFrameTypesByFrameType(frameType._id);
  };

  const fetchSubFrameTypesByFrameType = async (frameTypeId) => {
    try {
      const res = await fetch(`${apiUrl}/api/sub-frame-types/${frameTypeId}`);
      if (!res.ok) throw new Error(`Error fetching sub frame types: ${res.status}`);
      const data = await res.json();
      setSubFrameTypes(data);
      setSelectedSubFrameType(data.length > 0 ? data[0] : null);
      if (data.length > 0) localStorage.setItem('subFrameType', JSON.stringify(data[0]));
    } catch (err) {
      console.error('Error fetching sub frame types:', err);
    }
  };

  const handleSubFrameTypeSelect = async (subFrameType) => {
    setSelectedSubFrameType(subFrameType);
    setProductDetails(prev => ({ ...prev, subFrameType }));
    localStorage.setItem('subFrameType', JSON.stringify(subFrameType));
    setLoadingSubFrame(true);
    try {
      const res = await fetch(`${apiUrl}/api/products/${selectedProduct._id}/subframe-image/${subFrameType._id}`);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      let imageUrl = '';
      if (data.images && Array.isArray(data.images)) {
        const frontImage = data.images.find(img => img.toLowerCase().includes('front'));
        imageUrl = frontImage || data.images[0];
      } else if (data.imageUrl) {
        imageUrl = data.imageUrl.toLowerCase().includes('front') ? data.imageUrl : data.imageUrl;
      }
      if (!imageUrl) imageUrl = selectedProduct.mainImage;
      setActiveImage(imageUrl);
      setSelectedProducts(prev =>
        prev.map(p => (p._id === selectedProduct._id ? { ...p, mainImage: imageUrl } : p))
      );
      const constantSubFrameImages = subFrameType.images || [];
      const updatedThumbnails = [imageUrl, ...constantSubFrameImages];
      setSubFrameThumbnails([...new Set(updatedThumbnails)]);
    } catch (err) {
      console.error('Error fetching subframe image:', err);
      setActiveImage(selectedProduct.mainImage);
      setSubFrameThumbnails(subFrameType.images || []);
    } finally {
      setLoadingSubFrame(false);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setProductDetails(prev => ({ ...prev, size }));
    const productIndex = selectedProducts.findIndex(p => p._id === selectedProduct._id);
    if (productIndex === -1) return;
    const factor = 5;
    const newWidth = size.width * factor;
    const newHeight = size.height * factor;
    setProductDimensions(prev => {
      const updated = [...prev];
      updated[productIndex] = { width: newWidth, height: newHeight };
      return updated;
    });
  };

  // ------------------- DRAG & DROP -------------------
  const handleDragStop = (e, data, index) => {
    const updatedPositions = [...productPositions];
    updatedPositions[index] = { x: data.x, y: data.y };
    setProductPositions(updatedPositions);
  };

  // ------------------- CART & WISHLIST -------------------
  const handleAddToCart = async () => {
    if (!selectedProduct || !selectedFrameType || !selectedSubFrameType || !selectedSize) {
      setCartMessage('Please select all options before adding to cart');
      return;
    }
    const cartProduct = {
      productId: selectedProduct._id,
      frameTypeId: selectedFrameType._id,
      subFrameTypeId: selectedSubFrameType._id,
      sizeId: selectedSize._id,
      quantity: 1
    };
    try {
      const res = await fetch(`${apiUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cartProduct)
      });
      if (!res.ok) throw new Error(`Error adding product to cart: ${res.status}`);
      const cartData = await res.json();
      setCart(cartData);
      setCartMessage('Product added to cart successfully!');
      setTimeout(() => setCartMessage(null), 3000);
    } catch (err) {
      console.error('Error adding product to cart:', err);
      setCartMessage('Failed to add product to cart');
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!product || !product._id) return;
    if (!token) {
      handleAuthRequired();
      return;
    }
    const productInWishlist = wishlist.some(
      item => item.productId && item.productId._id === product._id
    );
    if (productInWishlist) return;
    try {
      await fetch(`${apiUrl}/api/wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product._id })
      });
      setWishlist(prev => [...prev, { productId: product }]);
    } catch (error) {
      console.error('Error adding product to wishlist:', error);
    }
  };

  const handleRemoveFromWishlist = async (wishlistItem) => {
    try {
      await fetch(`${apiUrl}/api/wishlist/remove/${wishlistItem.productId._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(prev => prev.filter(item => item._id !== wishlistItem._id));
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
    }
  };

  const calculateItemPrice = (item) => {
    if (!item || !item.productId || !item.quantity) return 0;
    const basePrice = parseFloat(item.productId.price) || 0;
    const framePrice = parseFloat(item.frameType?.price) || 0;
    const subFramePrice = parseFloat(item.subFrameType?.price) || 0;
    const sizePrice = parseFloat(item.size?.price) || 0;
    return ((basePrice + framePrice + subFramePrice + sizePrice) * item.quantity).toFixed(2);
  };

  const calculateTotalPrice = () => {
    let total = 0;
    selectedProducts.forEach(product => {
      const item = {
        productId: product,
        frameType: selectedFrameType,
        subFrameType: selectedSubFrameType,
        size: selectedSize,
        quantity: 1
      };
      total += parseFloat(calculateItemPrice(item));
    });
    return total.toFixed(2);
  };

  const handleUpdateQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    if (token) {
      try {
        const res = await fetch(`${apiUrl}/api/cart/update/${item.productId._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            quantity: newQty,
            frameType: item.frameType._id,
            subFrameType: item.subFrameType._id,
            size: item.size._id
          })
        });
        if (!res.ok) throw new Error('Failed to update quantity');
        setCart(prev =>
          prev.map(ci => (ci.productId._id === item.productId._id ? { ...ci, quantity: newQty } : ci))
        );
      } catch (err) {
        console.error('Failed to update quantity:', err);
      }
    } else {
      const updatedCart = cart.map(ci =>
        ci.productId._id === item.productId._id ? { ...ci, quantity: newQty } : ci
      );
      setCart(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
    }
  };

  const handleRemoveFromCart = async (item) => {
    if (token) {
      try {
        const res = await fetch(
          `${apiUrl}/api/cart/remove/${item.productId._id}/${item.frameType._id}/${item.subFrameType._id}/${item.size._id}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!res.ok) throw new Error('Failed to remove item from cart');
        setCart(prev =>
          prev.filter(
            ci =>
              ci.productId._id !== item.productId._id ||
              ci.frameType._id !== item.frameType._id ||
              ci.subFrameType._id !== item.subFrameType._id ||
              ci.size._id !== item.size._id
          )
        );
      } catch (err) {
        console.error('Failed to remove item from cart:', err);
      }
    } else {
      const updatedCart = cart.filter(
        ci =>
          ci.productId._id !== item.productId._id ||
          ci.frameType._id !== item.frameType._id ||
          ci.subFrameType._id !== item.subFrameType._id ||
          ci.size._id !== item.size._id
      );
      setCart(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
    }
  };

  const renderCartItems = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      return <p>Your cart is empty</p>;
    }
    return cart.map((item, idx) => (
      <div key={idx} className="cart-item d-flex mb-3 align-items-center">
        <img
          src={item.productId.mainImage}
          alt={item.productId.productName}
          className="cart-item-image me-2"
        />
        <div className="cart-item-details flex-grow-1">
          <h5>{item.productId.productName}</h5>
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
            <span className="mx-2">{item.quantity}</span>
            <button onClick={() => handleUpdateQuantity(item, item.quantity + 1)}>+</button>
          </div>
          <p className="mt-2">Price: ₹{calculateItemPrice(item)}</p>
        </div>
        <button className="remove-item ms-2" onClick={() => handleRemoveFromCart(item)}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>X</span>
        </button>
      </div>
    ));
  };

  // ------------------- RENDER -------------------
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="camera-component container-fluid px-0">
      {/* AUTH POPUP */}
      <Modal show={showAuthPopup} onHide={handleAuthPopupClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Wall Selection Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>{cartMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAuthPopupClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="row g-0">
        {/* LEFT PANEL: PRODUCT LIST */}
        <div className="col-12 col-md-3 camera-left-panel">
          <div className="logo-container">
            <Link to="/" className="d-flex align-items-center">
              <img src={whiteLogo} alt="Logo" className="logo-img" />
            </Link>
          </div>
          <div className="products-scrollable">
            <h4 className="products-title">Select Product</h4>
            <div className="row g-3 mx-0">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="col-6 col-md-6 product-card-wrapper"
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="product-card">
                    <div className="product-image-wrapper position-relative">
                      <img
                        src={product.mainImage}
                        className="product-card-img"
                        alt={product.productName}
                      />
                      <div
                        className="wishlist-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          const inWishlist = wishlist.find(
                            (item) => item.productId && item.productId._id === product._id
                          );
                          if (inWishlist) {
                            handleRemoveFromWishlist(inWishlist);
                          } else {
                            handleAddToWishlist(product);
                          }
                        }}
                      >
                        <img
                          src={
                            wishlist.some(
                              (item) => item.productId && item.productId._id === product._id
                            )
                              ? heartIconFilled
                              : heartIcon
                          }
                          alt="Heart Icon"
                        />
                      </div>
                    </div>
                    <div className="product-card-body">
                      <h5 className="product-title">{product.productName}</h5>
                      <p className="product-desc">{product.description.slice(0, 60)}...</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: PREVIEW AREA */}
        <div className="col-12 col-md-9 camera-right-panel">
          <div className="preview-container">
            {wallImage ? (
              <img src={wallImage} alt="Wall Preview" className="preview-image" />
            ) : cameraActive ? (
              <video ref={videoRef} className="preview-video" autoPlay playsInline />
            ) : capturedImage ? (
              <img src={capturedImage} alt="Captured" className="preview-image" />
            ) : (
              <div className="preview-overlay">
                <div className="preview-overlay-content text-center">
                  <Button onClick={startCamera} variant="primary" className="mb-2">
                    Start Camera
                  </Button>
                  <Button variant="success" className="mb-2" onClick={() => fileInputRef.current.click()}>
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

            {/* CONTROL BAR */}
            {(!wallImage && !capturedImage) && cameraActive && (
              <div className="preview-controls top">
                <Button onClick={capturePhoto} variant="secondary">
                  Capture Photo
                </Button>
                <Button variant="success" onClick={() => fileInputRef.current.click()}>
                  Upload Wall Photo
                </Button>
              </div>
            )}
            {capturedImage && !wallImage && (
              <div className="preview-controls bottom">
                <Button variant="primary" onClick={() => {
                  // Confirm captured image as wall image
                  setWallImage(capturedImage);
                  setCapturedImage(null);
                }}>
                  Done
                </Button>
                <Button variant="warning" onClick={handleRetakeWall}>
                  Retake
                </Button>
              </div>
            )}
            {wallImage && (
              <div className="preview-controls bottom">
                <Button onClick={() => setWallImage('/assets/placeholder-wall.jpg')} variant="outline-primary">
                  Wall 1
                </Button>
                <Button onClick={() => setWallImage('/assets/placeholder-wall1.jpg')} variant="outline-primary" className="ms-2">
                  Wall 2
                </Button>
              </div>
            )}

            {/* DRAGGABLE PRODUCT PREVIEWS */}
            {selectedProducts.map((product, index) => (
              <DraggableCore
                key={product._id}
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
                    left: productPositions[index]?.x || 100,
                    top: productPositions[index]?.y || 100,
                    width: productDimensions[index]?.width || 300,
                    height: productDimensions[index]?.height || 300
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget.querySelector('.remove-from-preview');
                    if (btn) btn.style.display = 'block';
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget.querySelector('.remove-from-preview');
                    if (btn) btn.style.display = 'none';
                  }}
                  onClick={() => handleProductClick(product)}
                >
                  <img
                    src={product.mainImage}
                    alt={product.productName}
                    className="product-on-wall"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                  />
                  <div
                    className="remove-from-preview"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProducts(prev => prev.filter(p => p._id !== product._id));
                      setProductPositions(prev => prev.filter((_, i) => i !== index));
                      setProductDimensions(prev => prev.filter((_, i) => i !== index));
                    }}
                  >
                    <span>X</span>
                  </div>
                </div>
              </DraggableCore>
            ))}
          </div>

          {/* PRODUCT DETAILS / OPTIONS */}
          {selectedProduct && (
            <div className="product-details p-3">
              <h4 className="mb-3">Product Details</h4>
              <div className="row gx-2 gy-3">
                <div className="col-12 col-sm-4">
                  <label className="form-label fw-bold">Frame Type:</label>
                  <select
                    className="form-select"
                    value={productDetails.frameType?._id || ''}
                    onChange={(e) =>
                      handleFrameTypeSelect(frameTypes.find(ft => ft._id === e.target.value))
                    }
                  >
                    <option value="">Select Frame Type</option>
                    {frameTypes.map(ft => (
                      <option key={ft._id} value={ft._id}>{ft.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-4">
                  <label className="form-label fw-bold">Sub Frame Type:</label>
                  <select
                    className="form-select"
                    value={productDetails.subFrameType?._id || ''}
                    onChange={(e) =>
                      handleSubFrameTypeSelect(subFrameTypes.find(sft => sft._id === e.target.value))
                    }
                  >
                    <option value="">Select Sub Frame Type</option>
                    {subFrameTypes.map(sft => (
                      <option key={sft._id} value={sft._id}>{sft.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-4">
                  <label className="form-label fw-bold">Size:</label>
                  <select
                    className="form-select"
                    value={productDetails.size?._id || ''}
                    onChange={(e) =>
                      handleSizeSelect(sizes.find(sz => sz._id === e.target.value))
                    }
                  >
                    <option value="">Select Size</option>
                    {sizes.map(sz => (
                      <option key={sz._id} value={sz._id}>
                        {sz.width} x {sz.height}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <Button variant="primary" onClick={handleAddToCart}>
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-CART POPUP */}
          {cart && cart.length > 0 && (
            <div className="sub-cart-popup">
              <div className="sub-cart-overlay" onClick={() => setCartMessage(null)} />
              <div className="sub-cart-body">
                <div className="sub-cart-header d-flex justify-content-between align-items-center">
                  <h2>Shopping Cart</h2>
                  <Button variant="secondary" onClick={() => setCartMessage(null)}>X</Button>
                </div>
                <div className="cart-items mt-3">{renderCartItems()}</div>
                <div className="cart-footer mt-3">
                  <p className="cart-total">Total: ₹{calculateTotalPrice()}</p>
                  <div className="cart-actions">
                    <Button variant="primary" onClick={() => navigate('/cart')}>
                      View Cart
                    </Button>
                    <Button variant="success" onClick={() => navigate('/checkout')}>
                      Checkout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WALL SELECTION & TOTAL PRICE */}
          <div className="controls d-flex flex-wrap align-items-center gap-3 p-3">
            <div>
              <Button onClick={() => setWallImage('/assets/placeholder-wall.jpg')} variant="outline-primary">
                Wall 1
              </Button>
              <Button onClick={() => setWallImage('/assets/placeholder-wall1.jpg')} variant="outline-primary" className="ms-2">
                Wall 2
              </Button>
            </div>
            <div className="ms-auto text-end">
              <h5 className="mb-0">Total Price: ₹{calculateTotalPrice()}</h5>
            </div>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <video ref={videoRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraComponent;
