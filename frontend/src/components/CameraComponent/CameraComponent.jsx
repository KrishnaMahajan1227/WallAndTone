import React, { useState, useEffect, useRef, useMemo } from "react";
import Webcam from "react-webcam";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, ToastContainer, Pagination } from "react-bootstrap";
import { DraggableCore } from "react-draggable";
import heartIcon from "../../assets/icons/heart-icon.svg";
import heartIconFilled from "../../assets/icons/heart-icon-filled.svg";
import whiteLogo from "../../assets/logo/wall-n-tone-white.png";
import "./CameraComponent.css";
import SecondaryNavbar from "../Navbar/SecondaryNavbar";

const CameraComponent = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://wallandtone.com");

  // Global states
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productPositions, setProductPositions] = useState([]);
  const [productDimensions, setProductDimensions] = useState([]); // { width, height } per product

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);

  // Active product details
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [activeImage, setActiveImage] = useState(null);

  // Options for details panel
  const [frameTypes, setFrameTypes] = useState([]);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [selectedFrameType, setSelectedFrameType] = useState(null);
  const [selectedSubFrameType, setSelectedSubFrameType] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Wall image & camera capture
  const [wallImage, setWallImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [subFrameThumbnails, setSubFrameThumbnails] = useState([]);
  const [loadingSubFrame, setLoadingSubFrame] = useState(false);

  // Camera and mobile overlay states
  const [showWebcam, setShowWebcam] = useState(false);
  const [showProductList, setShowProductList] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Track dragging status
  const [isDragging, setIsDragging] = useState(false);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewContainerRef = useRef(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Helper: Parse raw size values from a string like "6 x 4"
  // Here the first number is interpreted as the height and the second as the width.
  const parseSizeValues = (sizeName) => {
    if (!sizeName) return [1, 1];
    const parts = sizeName.split("x");
    if (parts.length < 2) return [1, 1];
    const rawHeight = parseFloat(parts[0].trim());
    const rawWidth = parseFloat(parts[1].trim());
    if (isNaN(rawHeight) || isNaN(rawWidth)) return [1, 1];
    return [rawHeight, rawWidth];
  };

  // ------------------- FETCH DATA -------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await fetch(`${apiUrl}/api/products`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        const productsData = await productsRes.json();
        setProducts(productsData);

        if (token) {
          const wishlistRes = await fetch(`${apiUrl}/api/wishlist`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (!wishlistRes.ok) throw new Error("Failed to fetch wishlist");
          const wishlistData = await wishlistRes.json();
          const wishlistItems = wishlistData.items.filter(
            (item) => item.productId !== null
          );
          setWishlist(wishlistItems);

          const cartRes = await fetch(`${apiUrl}/api/cart`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (!cartRes.ok) throw new Error("Failed to fetch cart");
          const cartData = await cartRes.json();
          setCart(cartData);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, [token, apiUrl]);

  // ------------------- CAMERA FUNCTIONS -------------------
  const startCamera = () => {
    setError(null);
    setShowWebcam(true);
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        setCapturedImage(screenshot);
      } else {
        console.error("Captured screenshot is empty");
      }
      setShowWebcam(false);
    }
  };

  // ------------------- WALL PHOTO UPLOAD & RETAKE -------------------
  const handleUploadWallPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWallImage(reader.result);
        setShowWebcam(false);
        setCapturedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetakeWall = () => {
    setWallImage(null);
    setCapturedImage(null);
    setShowWebcam(true);
  };

  // ------------------- AUTH HANDLERS -------------------
  const handleAuthRequired = () => setShowAuthPopup(true);
  const handleAuthPopupClose = () => setShowAuthPopup(false);
  const handleAuthLogin = () => {
    setShowAuthPopup(false);
    navigate("/login");
  };

  // ------------------- PRODUCT PREVIEW & SELECTION -------------------
  const handleProductSelect = (product) => {
    if (!wallImage && !capturedImage && !showWebcam) {
      setCartMessage("Please select your wall first or upload/capture a wall photo");
      return;
    }
    if (selectedProducts.some((p) => p && p._id === product._id)) return;
    setSelectedProducts((prev) => [...prev, { ...product, options: {} }]);
    setProductPositions((prev) => [...prev, { x: 200, y: 200 }]);
    setProductDimensions((prev) => [...prev, { width: 300, height: 300 }]);
    setSelectedProduct(product);
    setProductDetails({});
    setSelectedFrameType(null);
    setSelectedSubFrameType(null);
    setSelectedSize(null);
    fetchProductData(product._id);
    setCartMessage(`${product.productName} added for preview`);
    setTimeout(() => setCartMessage(null), 3000);
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
      console.error("Error fetching product data:", err);
    }
  };

  const updateSelectedProductOptions = (newOptions) => {
    if (!selectedProduct) return;
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p && p._id === selectedProduct._id ? { ...p, options: { ...p.options, ...newOptions } } : p
      )
    );
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
        localStorage.setItem("frameType", JSON.stringify(data[0]));
        updateSelectedProductOptions({ frameType: data[0]._id });
        fetchSubFrameTypesByFrameType(data[0]._id);
        if (data[0].frameSizes && Array.isArray(data[0].frameSizes)) {
          setSizes(data[0].frameSizes);
        } else {
          setSizes([]);
          setSelectedSize(null);
        }
      }
    } catch (err) {
      console.error("Error fetching frame types:", err);
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
        localStorage.setItem("subFrameType", JSON.stringify(data[0]));
        updateSelectedProductOptions({ subFrameType: data[0]._id });
      }
    } catch (err) {
      console.error("Error fetching sub frame types:", err);
    }
  };

  const fetchSizes = async (productId) => {
    // Assume sizes are provided as part of frame type data.
  };

  const handleFrameTypeSelect = async (frameType) => {
    try {
      const response = await fetch(`${apiUrl}/api/frame-types/${frameType._id}`);
      if (!response.ok) throw new Error("Failed to fetch frame type details");
      const data = await response.json();
      setSelectedFrameType(data);
      setProductDetails((prev) => ({ ...prev, frameType: data }));
      localStorage.setItem("frameType", JSON.stringify(data));
      updateSelectedProductOptions({ frameType: data._id });
      fetchSubFrameTypesByFrameType(data._id);
      if (data.frameSizes && Array.isArray(data.frameSizes)) {
        setSizes(data.frameSizes);
      } else {
        setSizes([]);
        setSelectedSize(null);
      }
    } catch (err) {
      console.error("Error selecting frame type:", err);
    }
  };

  const fetchSubFrameTypesByFrameType = async (frameTypeId) => {
    try {
      const res = await fetch(`${apiUrl}/api/sub-frame-types/${frameTypeId}`);
      if (!res.ok) throw new Error(`Error fetching sub frame types: ${res.status}`);
      const data = await res.json();
      setSubFrameTypes(data);
      setSelectedSubFrameType(data.length > 0 ? data[0] : null);
      if (data.length > 0) {
        localStorage.setItem("subFrameType", JSON.stringify(data[0]));
        updateSelectedProductOptions({ subFrameType: data[0]._id });
      }
    } catch (err) {
      console.error("Error fetching sub frame types:", err);
    }
  };

  const handleSubFrameTypeSelect = async (subFrameType) => {
    setSelectedSubFrameType(subFrameType);
    setProductDetails((prev) => ({ ...prev, subFrameType }));
    localStorage.setItem("subFrameType", JSON.stringify(subFrameType));
    updateSelectedProductOptions({ subFrameType: subFrameType._id });
    setLoadingSubFrame(true);
    try {
      const res = await fetch(
        `${apiUrl}/api/products/${selectedProduct._id}/subframe-image/${subFrameType._id}`
      );
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      let imageUrl = "";
      if (data.images && Array.isArray(data.images)) {
        const frontImage = data.images.find((img) =>
          img.toLowerCase().includes("front")
        );
        imageUrl = frontImage || data.images[0];
      } else if (data.imageUrl) {
        imageUrl = data.imageUrl;
      }
      if (!imageUrl) imageUrl = selectedProduct.mainImage;
      setActiveImage(imageUrl);
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p && p._id === selectedProduct._id ? { ...p, mainImage: imageUrl } : p
        )
      );
      const constantSubFrameImages = subFrameType.images || [];
      const updatedThumbnails = [imageUrl, ...constantSubFrameImages];
      setSubFrameThumbnails([...new Set(updatedThumbnails)]);
    } catch (err) {
      console.error("Error fetching subframe image:", err);
      setActiveImage(selectedProduct.mainImage);
      setSubFrameThumbnails(subFrameType.images || []);
    } finally {
      setLoadingSubFrame(false);
    }
  };

  // ------------------- UPDATED SIZE HANDLER -------------------
  // We now interpret the size string as: first number is the height and the second is the width.
  // We then compute the preview dimensions by multiplying the raw values by a constant factor.
  // This constant factor is chosen (e.g. 15px per unit) so that different sizes yield different dimensions.
  // If the computed width exceeds a maximum (say, 50% of the preview container), we scale it down.
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setProductDetails((prev) => ({ ...prev, size }));
    updateSelectedProductOptions({ size: size._id });

    const container = previewContainerRef.current;
    if (!container) {
      console.error("Preview container is not available");
      return;
    }

    // Use a constant multiplier (e.g., 15px per unit)
    const baseMultiplier = 8;
    const [rawHeight, rawWidth] = parseSizeValues(size.name);
    let computedWidth = rawWidth * baseMultiplier;
    let computedHeight = rawHeight * baseMultiplier;

    // Optional: Clamp the computed width to not exceed 50% of container width.
    const maxWidth = container.clientWidth * 0.5;
    if (computedWidth > maxWidth) {
      const scaleDown = maxWidth / computedWidth;
      computedWidth = computedWidth * scaleDown;
      computedHeight = computedHeight * scaleDown;
    }

    console.log(`Size "${size.name}" -> New dimensions: ${computedWidth}px (width) x ${computedHeight}px (height)`);

    const productIndex = selectedProducts.findIndex(
      (p) => p && p._id === selectedProduct._id
    );
    if (productIndex !== -1) {
      setProductDimensions((prev) => {
        const updated = [...prev];
        updated[productIndex] = { width: computedWidth, height: computedHeight };
        return updated;
      });
    }
  };

  // ------------------- WINDOW RESIZE LISTENER -------------------
  useEffect(() => {
    const handleResize = () => {
      if (isDragging) return;
      if (selectedProduct && selectedSize && previewContainerRef.current) {
        const container = previewContainerRef.current;
        const baseMultiplier = 8;
        const productIndex = selectedProducts.findIndex(
          (p) => p && p._id === selectedProduct._id
        );
        if (productIndex !== -1) {
          const [rawHeight, rawWidth] = parseSizeValues(selectedSize.name);
          let computedWidth = rawWidth * baseMultiplier;
          let computedHeight = rawHeight * baseMultiplier;
          const maxWidth = container.clientWidth * 0.5;
          if (computedWidth > maxWidth) {
            const scaleDown = maxWidth / computedWidth;
            computedWidth = computedWidth * scaleDown;
            computedHeight = computedHeight * scaleDown;
          }
          setProductDimensions((prev) => {
            const updated = [...prev];
            updated[productIndex] = { width: computedWidth, height: computedHeight };
            return updated;
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedProduct, selectedSize, selectedProducts, isDragging]);

  // ------------------- DRAG & DROP -------------------
  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragStop = (e, data, index) => {
    setIsDragging(false);
    const updatedPositions = [...productPositions];
    updatedPositions[index] = { x: data.x, y: data.y };
    setProductPositions(updatedPositions);
  };

  const removeProduct = (product, index, e) => {
    e.stopPropagation();
    setSelectedProducts((prev) => prev.filter((p) => p && p._id !== product._id));
    setProductPositions((prev) => prev.filter((_, i) => i !== index));
    setProductDimensions((prev) => prev.filter((_, i) => i !== index));
    setCartMessage(`${product.productName} removed from preview`);
    setTimeout(() => setCartMessage(null), 3000);
  };

  // ------------------- CART & WISHLIST HANDLERS -------------------
  const handleAddToCart = async () => {
    if (!token) {
      setShowAuthPopup(true);
      setCartMessage("Please log in to add items to your cart.");
      return;
    }
    const itemsToAdd = selectedProducts
      .filter((prod) => prod !== null)
      .map((prod) => {
        const opts = prod.options || {};
        if (!opts.frameType || !opts.subFrameType || !opts.size) {
          console.error(`Missing options for product ${prod.productName}`);
          return null;
        }
        return {
          productId: prod._id,
          frameType: opts.frameType,
          subFrameType: opts.subFrameType,
          size: opts.size,
          quantity: 1,
        };
      })
      .filter((item) => item !== null);

    if (itemsToAdd.length === 0) {
      setCartMessage("Please select options for at least one product");
      return;
    }

    try {
      await Promise.all(
        itemsToAdd.map((item) =>
          fetch(`${apiUrl}/api/cart/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(item),
          })
        )
      );
      setCartMessage("Products added to cart successfully!");
      setTimeout(() => setCartMessage(null), 3000);
    } catch (err) {
      console.error("Error adding products to cart:", err);
      setCartMessage("Failed to add products to cart");
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!product || !product._id) return;
    if (!token) {
      setShowAuthPopup(true);
      setCartMessage("Please log in to add items to your wishlist.");
      return;
    }
    const productInWishlist = wishlist.find(
      (item) => item.productId && item.productId._id === product._id
    );
    if (productInWishlist) return;
    try {
      await fetch(`${apiUrl}/api/wishlist/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });
      setWishlist((prev) => [...prev, { productId: product }]);
      setCartMessage(`${product.productName} added to wishlist`);
      setTimeout(() => setCartMessage(null), 3000);
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
    }
  };

  const handleRemoveFromWishlist = async (wishlistItem) => {
    try {
      await fetch(`${apiUrl}/api/wishlist/remove/${wishlistItem.productId._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist((prev) => prev.filter((item) => item._id !== wishlistItem._id));
      setCartMessage("Product removed from wishlist");
      setTimeout(() => setCartMessage(null), 3000);
    } catch (error) {
      console.error("Error removing product from wishlist:", error);
    }
  };

  const handleUpdateQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    if (token) {
      try {
        const res = await fetch(`${apiUrl}/api/cart/update/${item.productId._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: newQty,
            frameType: item.frameType._id,
            subFrameType: item.subFrameType._id,
            size: item.size._id,
          }),
        });
        if (!res.ok) throw new Error("Failed to update quantity");
      } catch (err) {
        console.error("Failed to update quantity:", err);
      }
    }
  };

  const handleRemoveFromCart = async (item) => {
    if (token) {
      try {
        const res = await fetch(
          `${apiUrl}/api/cart/remove/${item.productId._id}/${item.frameType._id}/${item.subFrameType._id}/${item.size._id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to remove item from cart");
      } catch (err) {
        console.error("Failed to remove item from cart:", err);
      }
    }
  };

  const renderCartItems = () => {
    if (!Array.isArray(cart) || cart.length === 0) {
      return <p>Your cart is empty</p>;
    }
    return cart.map((item, idx) => (
      <div key={item.uniqueId || idx} className="cart-item d-flex mb-3 align-items-center">
        <img
          src={item.isCustom ? item.image : item.productId?.mainImage}
          alt={item.isCustom ? "Custom Artwork" : item.productId?.productName}
          className="cart-item-image me-2"
        />
        <div className="cart-item-details flex-grow-1">
          <h5>{item.productId?.productName || "Custom Artwork"}</h5>
          <p>Frame: {item.frameType?.name || "N/A"}</p>
          <p>Type: {item.subFrameType?.name || "N/A"}</p>
          <p>Size: {item.size?.name} - ₹{item.size?.price}</p>
          <div className="quantity-controls">
            <button onClick={() => handleUpdateQuantity(item, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
            <span className="mx-2">{item.quantity}</span>
            <button onClick={() => handleUpdateQuantity(item, item.quantity + 1)}>+</button>
          </div>
          <p className="mt-2">Price: ₹{calculateItemPrice(item)}</p>
        </div>
        <button className="remove-item ms-2" onClick={() => handleRemoveFromCart(item)}>
          <span style={{ color: "#fff", fontWeight: "bold", fontSize: "18px" }}>X</span>
        </button>
      </div>
    ));
  };

  // --- Compute sortedProducts so order remains fixed ---
  const sortedProducts = useMemo(() => {
    const likedProductIds = wishlist.map((item) => item.productId?._id);
    const likedProducts = products.filter((product) =>
      likedProductIds.includes(product._id)
    );
    const otherProducts = products.filter(
      (product) => !likedProductIds.includes(product._id)
    );
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    return [...shuffleArray(likedProducts), ...shuffleArray(otherProducts)];
  }, [products, wishlist]);

  // --- Compute displayedProducts for current page ---
  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedProducts.slice(startIndex, startIndex + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  // --- Truncated Pagination Rendering ---
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const renderTruncatedPagination = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <Pagination.Item key={i} active={currentPage === i} onClick={() => setCurrentPage(i)}>
            {i}
          </Pagination.Item>
        );
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(
            <Pagination.Item key={i} active={currentPage === i} onClick={() => setCurrentPage(i)}>
              {i}
            </Pagination.Item>
          );
        }
        pages.push(<Pagination.Ellipsis key="e1" disabled />);
        pages.push(
          <Pagination.Item key={totalPages} onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </Pagination.Item>
        );
      } else if (currentPage > totalPages - 4) {
        pages.push(
          <Pagination.Item key={1} onClick={() => setCurrentPage(1)}>
            1
          </Pagination.Item>
        );
        pages.push(<Pagination.Ellipsis key="e1" disabled />);
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(
            <Pagination.Item key={i} active={currentPage === i} onClick={() => setCurrentPage(i)}>
              {i}
            </Pagination.Item>
          );
        }
      } else {
        pages.push(
          <Pagination.Item key={1} onClick={() => setCurrentPage(1)}>
            1
          </Pagination.Item>
        );
        pages.push(<Pagination.Ellipsis key="e1" disabled />);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(
            <Pagination.Item key={i} active={currentPage === i} onClick={() => setCurrentPage(i)}>
              {i}
            </Pagination.Item>
          );
        }
        pages.push(<Pagination.Ellipsis key="e2" disabled />);
        pages.push(
          <Pagination.Item key={totalPages} onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </Pagination.Item>
        );
      }
    }
    return pages;
  };

  const renderPagination = () => (
    <Pagination className="justify-content-center my-3">
      <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
      <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
      {renderTruncatedPagination()}
      <Pagination.Next onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
      <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
    </Pagination>
  );

  // ------------------- PRODUCT CARD RENDERING -------------------
  const renderProductCard = (product, isLarge = false) => (
    <div className={`card product-card h-100 ${isLarge ? "large-card" : ""}`}>
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
            if (
              wishlist &&
              wishlist.some((item) => item.productId && item.productId._id === product._id)
            ) {
              handleRemoveFromWishlist(product);
            } else {
              handleAddToWishlist(product);
            }
          }}
        >
          <img
            src={
              wishlist &&
              wishlist.some((item) => item.productId && item.productId._id === product._id)
                ? heartIconFilled
                : heartIcon
            }
            alt="Heart Icon"
          />
        </div>
      </div>
      <div className="card-body text-center d-flex flex-column">
        <h5 className="card-title product-title">{product.productName}</h5>
        <p className="card-text text-muted">Starting From Rs {product.startFromPrice}/-</p>
      </div>
    </div>
  );

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
    selectedProducts
      .filter((p) => p !== null)
      .forEach((product) => {
        total += parseFloat(calculateItemPrice({ productId: product, quantity: 1 }));
      });
    return total.toFixed(2);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    // Implementation for review submission...
  };

  const handleProceedToCheckout = () => {
    // Implementation for proceeding to checkout...
  };

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="camera-component container-fluid px-0">
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999 }}
      />
      <header className="camera-header d-flex justify-content-between align-items-center">
        <Link to="/" className="d-flex align-items-center">
          <img src={whiteLogo} alt="Logo" className="logo-img" />
        </Link>
        <button
          className="hamburger-menu d-md-none btn btn-outline-light"
          onClick={() => setShowProductList(!showProductList)}
        >
          Products ☰
        </button>
      </header>
      {showProductList && (
        <div className="mobile-product-list-overlay d-md-none show">
          <div className="mobile-product-list-header d-flex justify-content-between align-items-center p-2">
            <h5 className="mb-0 text-white">Products</h5>
            <button className="btn btn-outline-light" onClick={() => setShowProductList(false)}>
              ✕
            </button>
          </div>
          <div className="products-scrollable">
            <div className="row g-3 mx-0">
              {displayedProducts.map((product) => (
                <div
                  key={product._id}
                  className="col-12 product-card-wrapper"
                  onClick={() => {
                    handleProductSelect(product);
                    setShowProductList(false);
                  }}
                >
                  <div className="product-card">
                    <div className="product-image-wrapper position-relative">
                      <img
                        src={product.mainImage}
                        alt={product.productName}
                        className="product-card-img"
                      />
                    </div>
                    <div className="product-card-body">
                      <h5 className="product-title">{product.productName}</h5>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-center">{renderPagination()}</div>
          </div>
        </div>
      )}
      <div className="row g-0">
        <div className="col-md-3 camera-left-panel">
          <div className="products-scrollable">
            <h4 className="products-title">Select Product</h4>
            <div className="row g-3 mx-0">
              {displayedProducts.map((product) => (
                <div
                  key={product._id}
                  className="col-12 product-card-wrapper"
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="product-card">
                    <div className="product-image-wrapper position-relative">
                      <img
                        src={product.mainImage}
                        alt={product.productName}
                        className="product-card-img"
                      />
                      <div
                        className="wishlist-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          const inWishlist = wishlist.find(
                            (item) =>
                              item.productId && item.productId._id === product._id
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
                              (item) =>
                                item.productId && item.productId._id === product._id
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-center">{renderPagination()}</div>
          </div>
        </div>
        <div className="col-12 col-md-9 camera-right-panel">
          <div className="preview-container" ref={previewContainerRef}>
            {wallImage ? (
              <img src={wallImage} alt="Wall Preview" className="preview-image" />
            ) : showWebcam ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png"
                videoConstraints={{
                  facingMode: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
                    ? { ideal: "environment" }
                    : "user",
                }}
                className="preview-video"
              />
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
                    style={{ display: "none" }}
                    onChange={handleUploadWallPhoto}
                    accept="image/*"
                  />
                </div>
              </div>
            )}
            {showWebcam && (
              <div className="preview-controls top show">
                <Button onClick={capturePhoto} variant="secondary">
                  Capture Photo
                </Button>
                <Button variant="success" onClick={() => fileInputRef.current.click()}>
                  Upload Wall Photo
                </Button>
              </div>
            )}
            {capturedImage && !wallImage && (
              <div className="preview-controls bottom show">
                <Button variant="primary" onClick={() => { setWallImage(capturedImage); setCapturedImage(null); }}>
                  Done
                </Button>
                <Button variant="warning" onClick={handleRetakeWall}>
                  Retake
                </Button>
              </div>
            )}
            {wallImage && (
              <div className="preview-controls bottom show">
                <Button variant="warning" onClick={handleRetakeWall}>
                  Retake Wall Photo
                </Button>
                <Button onClick={() => setWallImage("/assets/placeholder-wall.jpg")} variant="outline-primary">
                  Wall 1
                </Button>
                <Button onClick={() => setWallImage("/assets/placeholder-wall1.jpg")} variant="outline-primary" className="ms-2">
                  Wall 2
                </Button>
              </div>
            )}
            {selectedProducts.filter((p) => p !== null).map((product, index) => (
              <DraggableCore
                key={`${product._id}-${productDimensions[index]?.width}-${productDimensions[index]?.height}`}
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
                    left: productPositions[index]?.x || 100,
                    top: productPositions[index]?.y || 100,
                    width: productDimensions[index]?.width || 300,
                    height: productDimensions[index]?.height || 300,
                  }}
                  onClick={() => handleProductClick(product)}
                >
                  <img
                    src={product.mainImage}
                    alt={product.productName}
                    className="product-on-wall"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                  />
                  <div
                    className="remove-from-preview"
                    onClick={(e) => removeProduct(product, index, e)}
                    onTouchEnd={(e) => removeProduct(product, index, e)}
                  >
                    <span>X</span>
                  </div>
                </div>
              </DraggableCore>
            ))}
          </div>
          {selectedProduct && (
            <div className="product-details p-3">
              <div className="row gx-2 gy-3 w-100">
                <div className="col-12 col-sm-3">
                  <label className="form-label fw-bold">Frame Type:</label>
                  <select
                    className="form-select"
                    value={productDetails.frameType?._id || ""}
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
                <div className="col-12 col-sm-3">
                  <label className="form-label fw-bold">Sub Frame Type:</label>
                  <select
                    className="form-select"
                    value={productDetails.subFrameType?._id || ""}
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
                <div className="col-12 col-sm-3">
                  <label className="form-label fw-bold">Size:</label>
                  <select
                    className="form-select"
                    value={productDetails.size?._id || ""}
                    onChange={(e) =>
                      handleSizeSelect(sizes.find(sz => sz._id === e.target.value))
                    }
                  >
                    <option value="">Select Size</option>
                    {sizes.map(sz => (
                      <option key={sz._id} value={sz._id}>{sz.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-3">
                  <Button variant="primary" onClick={handleAddToCart}>Add to Cart</Button>
                </div>
              </div>
            </div>
          )}
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
      <Modal show={showAuthPopup} onHide={() => setShowAuthPopup(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please log in to add items to your cart.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAuthPopup(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => { setShowAuthPopup(false); navigate('/login'); }}>
            Login
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999 }}
      />
    </div>
  );
};

export default CameraComponent;
