import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Heart, X } from "lucide-react";
import axios from "axios";
import { frameBackgrounds } from "../constants/frameImages";
import "./FreepikCustomization.css";
import { Modal, Button, Toast, ToastContainer } from "react-bootstrap";

const FreepikCustomization = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://wallandtone.com");

  const location = useLocation();
  const navigate = useNavigate();
  const generatedImage = location.state?.image;
  const prompt = location.state?.prompt;
  const isCustom = location.state?.isCustom;
  const passedOrientation = location.state?.orientation; // Orientation passed from generator component
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [frameTypes, setFrameTypes] = useState([]);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  // Sizes will now be derived from the selected frame type's "frameSizes" property
  const [sizes, setSizes] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [alertMessage, setAlertMessage] = useState("");
  const [activeImage, setActiveImage] = useState(null);
  const [subCartOpen, setSubCartOpen] = useState(false);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [wishlist, setWishlist] = useState([]);
  const [loadingSubFrame, setLoadingSubFrame] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Retrieve previously selected options from localStorage if available
  const [selectedFrameType, setSelectedFrameType] = useState(() => {
    const stored = localStorage.getItem("selectedFrameType");
    return stored ? JSON.parse(stored) : null;
  });
  const [selectedSubFrameType, setSelectedSubFrameType] = useState(() => {
    const stored = localStorage.getItem("selectedSubFrameType");
    return stored ? JSON.parse(stored) : null;
  });
  const [selectedSize, setSelectedSize] = useState(() => {
    const stored = localStorage.getItem("selectedSize");
    return stored ? JSON.parse(stored) : null;
  });

  const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
  const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");

  // Responsive check – if window width is less than 768px, use dropdowns
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch frame types on mount
  useEffect(() => {
    const fetchFrameTypes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/frame-types`);
        setFrameTypes(response.data);
        if (response.data.length > 0 && !selectedFrameType) {
          const defaultFrame = response.data[0];
          setSelectedFrameType(defaultFrame);
          localStorage.setItem("selectedFrameType", JSON.stringify(defaultFrame));
        }
      } catch (err) {
        setError("Failed to fetch frame types");
        console.error(err);
      }
    };
    fetchFrameTypes();
  }, [apiUrl, selectedFrameType]);

  // Fetch sub-frame types when selectedFrameType changes
  useEffect(() => {
    const fetchSubFrameTypes = async () => {
      if (selectedFrameType?._id) {
        try {
          const response = await axios.get(
            `${apiUrl}/api/sub-frame-types/${selectedFrameType._id}`
          );
          setSubFrameTypes(response.data);
          if (response.data.length > 0 && !selectedSubFrameType) {
            setSelectedSubFrameType(response.data[0]);
            localStorage.setItem("selectedSubFrameType", JSON.stringify(response.data[0]));
          }
        } catch (err) {
          setError("Failed to fetch sub-frame types");
          console.error(err);
        }
      }
    };
    fetchSubFrameTypes();
  }, [selectedFrameType, apiUrl, selectedSubFrameType]);

  // Update sizes based on the selected frame type's frameSizes field.
  useEffect(() => {
    if (selectedFrameType && selectedFrameType.frameSizes && selectedFrameType.frameSizes.length > 0) {
      setSizes(selectedFrameType.frameSizes);
      if (!selectedSize) {
        setSelectedSize(selectedFrameType.frameSizes[0]);
        localStorage.setItem("selectedSize", JSON.stringify(selectedFrameType.frameSizes[0]));
      }
    } else {
      setSizes([]);
      setSelectedSize(null);
      localStorage.removeItem("selectedSize");
    }
    setLoading(false);
  }, [selectedFrameType, selectedSize]);

  // Persist selections in localStorage
  useEffect(() => {
    if (selectedFrameType && selectedSubFrameType && selectedSize) {
      localStorage.setItem("selectedFrameType", JSON.stringify(selectedFrameType));
      localStorage.setItem("selectedSubFrameType", JSON.stringify(selectedSubFrameType));
      localStorage.setItem("selectedSize", JSON.stringify(selectedSize));
    }
  }, [selectedFrameType, selectedSubFrameType, selectedSize]);

  const calculateTotalPrice = () => {
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) return 0;
    let total =
      parseFloat(selectedFrameType.price) +
      parseFloat(selectedSubFrameType.price) +
      parseFloat(selectedSize.price);
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

  const handleSubFrameTypeSelect = (subFrameType) => {
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
      setAlertMessage("Please select all options before adding to cart");
      return;
    }
    try {
      const cartItem = {
        quantity,
        frameType: selectedFrameType._id,
        subFrameType: selectedSubFrameType._id,
        size: selectedSize._id,
        isCustom: true,
        image: generatedImage,
        orientation: passedOrientation || "portrait",
      };
      if (token) {
        const response = await axios.post(`${apiUrl}/api/cart/add`, cartItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.cart) {
          setCart(response.data.cart);
          setAlertMessage("Added to cart successfully!");
        } else {
          throw new Error("Invalid response from server");
        }
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const updatedCart = [...guestCart, cartItem];
        setCart({ items: updatedCart, totalPrice: parseFloat(calculateTotalPrice()) });
        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
        setAlertMessage("Added to cart successfully!");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      setAlertMessage(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleAddToWishlist = async () => {
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) {
      setAlertMessage("Please select all options before adding to wishlist");
      return;
    }
    try {
      // Upload image if needed
      const imageFormData = new FormData();
      imageFormData.append("image", generatedImage);
      const uploadResponse = await axios.post(
        `${apiUrl}/api/upload/image`,
        imageFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const wishlistItem = {
        image: uploadResponse.data.imageUrl,
        frameType: selectedFrameType._id,
        subFrameType: selectedSubFrameType._id,
        size: selectedSize._id,
        isCustom: true,
      };
      if (token) {
        const response = await axios.post(`${apiUrl}/api/wishlist/add`, wishlistItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist(response.data.wishlist);
        setAlertMessage("Added to wishlist successfully!");
      } else {
        const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
        const updatedWishlist = [...guestWishlist, wishlistItem];
        setWishlist(updatedWishlist);
        localStorage.setItem("guestWishlist", JSON.stringify(updatedWishlist));
        setAlertMessage("Added to wishlist successfully!");
      }
    } catch (err) {
      setAlertMessage("Failed to add to wishlist");
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="freepik-customization product-details-container">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="freepik-customization product-details-container">
        {error}
      </div>
    );
  if (!generatedImage)
    return (
      <div className="freepik-customization product-details-container">
        No image selected for customization
      </div>
    );

  return (
    <div className="freepik-customization product-details-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="product-details">
        <div className="image-section">
          <div
            className={`main-image-container ${
              (passedOrientation || "portrait") === "landscape" ? "landscape-mode" : ""
            }`}
          >
            {selectedSubFrameType && (
              <img
                src={frameBackgrounds[selectedSubFrameType.name]}
                alt="Frame background"
                className={`frame-background ${(passedOrientation || "portrait")}`}
              />
            )}
            <img
              src={activeImage || generatedImage}
              alt="Generated artwork"
              className={`generated-artwork ${(passedOrientation || "portrait")}`}
            />
          </div>
        </div>

        <div className="info-section">
          <h3 className="product-title">
            {prompt ? prompt : "Customize Your Artwork"}
          </h3>
          <div className="options-section">
            <div className="frame-type-section">
              {isMobile ? (
                <select
                  className="dropdown-select"
                  value={selectedFrameType?._id || ""}
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
                        selectedFrameType?._id === frameType._id ? "active" : ""
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
                    value={selectedSubFrameType?._id || ""}
                    onChange={(e) => {
                      const subFrame = subFrameTypes.find((sft) => sft._id === e.target.value);
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
                          selectedSubFrameType?._id === subFrameType._id ? "active" : ""
                        }`}
                        onClick={() => handleSubFrameTypeSelect(subFrameType)}
                        disabled={loadingSubFrame}
                      >
                        {loadingSubFrame &&
                        selectedSubFrameType?._id === subFrameType._id
                          ? "Loading..."
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
                    value={selectedSize?._id || ""}
                    onChange={(e) => {
                      const size = sizes.find((s) => s._id === e.target.value);
                      handleSizeSelect(size);
                    }}
                  >
                    {sizes.map((size) => (
                      <option key={size._id} value={size._id}>
                        {size.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="size-buttons">
                    {sizes.map((size) => (
                      <button
                        key={size._id}
                        className={`option-button ${
                          selectedSize?._id === size._id ? "active" : ""
                        }`}
                        onClick={() => handleSizeSelect(size)}
                      >
                        {size.name}
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
              <ShoppingCart size={20} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreepikCustomization;
