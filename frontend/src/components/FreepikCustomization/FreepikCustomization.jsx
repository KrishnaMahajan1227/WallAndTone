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
  const [sizes, setSizes] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [alertMessage, setAlertMessage] = useState("");
  const [activeImage, setActiveImage] = useState(null);
  const [loadingSubFrame, setLoadingSubFrame] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Previously selected options
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
  // For non-poster frames – UI state only for grouping sizes by category.
  const [selectedSizeCategory, setSelectedSizeCategory] = useState("");

  // Responsive check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
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

  // Fetch sub-frame types when frame type changes
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

  // Update sizes based on selected frame type
  useEffect(() => {
    if (
      selectedFrameType &&
      selectedFrameType.frameSizes &&
      selectedFrameType.frameSizes.length > 0
    ) {
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

  // Persist selections
  useEffect(() => {
    if (selectedFrameType && selectedSubFrameType && selectedSize) {
      localStorage.setItem("selectedFrameType", JSON.stringify(selectedFrameType));
      localStorage.setItem("selectedSubFrameType", JSON.stringify(selectedSubFrameType));
      localStorage.setItem("selectedSize", JSON.stringify(selectedSize));
    }
  }, [selectedFrameType, selectedSubFrameType, selectedSize]);

  // Helper: Determine size category from size name.
  const getSizeCategory = (size) => {
    if (size.name && size.name.includes("x")) {
      const parts = size.name.split("x").map((part) => parseFloat(part.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const maxDim = Math.max(parts[0], parts[1]);
        if (maxDim <= 10) return "Small";
        if (maxDim <= 18) return "Medium";
        if (maxDim <= 30) return "Large";
        return "Extra Large";
      }
    }
    return "Poster";
  };

  // Group sizes by category
  const groupSizesByCategory = (sizesArray) => {
    return sizesArray.reduce((acc, size) => {
      const category = getSizeCategory(size);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(size);
      return acc;
    }, {});
  };

  // Set default size category for non-poster frames
  useEffect(() => {
    if (
      selectedFrameType &&
      selectedFrameType.name.toLowerCase() !== "poster"
    ) {
      const grouped = groupSizesByCategory(sizes);
      const categories = Object.keys(grouped);
      if (categories.length > 0 && !selectedSizeCategory) {
        setSelectedSizeCategory(categories[0]);
      }
    }
  }, [sizes, selectedSizeCategory, selectedFrameType]);

  const calculateTotalPrice = () => {
    const framePrice = parseFloat(selectedFrameType?.price) || 0;
    const subFramePrice = parseFloat(selectedSubFrameType?.price) || 0;
    const sizePrice = parseFloat(selectedSize?.price) || 0;
    const total = framePrice + subFramePrice + sizePrice;
    return (total * quantity).toFixed(2);
  };

  const handleQuantityChange = (e) => {
    setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1));
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
          setAlertMessage("Added to cart successfully!");
        } else {
          throw new Error("Invalid response from server");
        }
      } else {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const updatedCart = [...guestCart, cartItem];
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
        const response = await axios.post(
          `${apiUrl}/api/wishlist/add`,
          wishlistItem,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAlertMessage("Added to wishlist successfully!");
      } else {
        const guestWishlist = JSON.parse(localStorage.getItem("guestWishlist") || "[]");
        const updatedWishlist = [...guestWishlist, wishlistItem];
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

  // Group sizes by category for non-poster frames
  const groupedSizes = groupSizesByCategory(sizes);
  const categoryOrder = ["Small", "Medium", "Large", "Extra Large", "Poster"];
  const availableCategories = Object.keys(groupedSizes).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
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
            {selectedSubFrameType &&
              selectedFrameType &&
              !["canvas", "poster"].includes(
                selectedFrameType.name.toLowerCase()
              ) && (
                <img
                  src={frameBackgrounds[selectedSubFrameType.name]}
                  alt="Frame background"
                  className={`frame-background ${(passedOrientation || "portrait")}`}
                />
              )}
            <img
              src={activeImage || generatedImage}
              alt="Generated artwork"
              className={`generated-artwork ${(passedOrientation || "portrait")} ${
                selectedFrameType?.name?.toLowerCase() === "acrylic" ? "acrylic-style" : ""
              }`}
            />
          </div>
        </div>

        <div className="info-section">
          <h3 className="product-title">
            {prompt ? prompt : "Customize Your Artwork"}
          </h3>
          <div className="price-section">
            <p>Total Price: ₹{calculateTotalPrice()}</p>
          </div>
          <div className="options-section">
            {/* Frame Type remains as buttons */}
            <div className="frame-type-section">
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
            </div>

            {/* Sub-Frame Type */}
            {selectedFrameType && subFrameTypes.length > 0 && (
              <div className="sub-frame-type-section">
                {isMobile ? (
                  <select
                    className="dropdown-select"
                    value={selectedSubFrameType?._id || ""}
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

            {/* Size Section */}
            {selectedSubFrameType && sizes.length > 0 && (
              <div className="size-section">
                {selectedFrameType &&
                selectedFrameType.name.toLowerCase() === "poster" ? (
                  // For poster frames, display sizes directly
                  isMobile ? (
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
                  )
                ) : (
                  // For non-poster frames, use category grouping
                  isMobile ? (
                    <>
                      <select
                        className="dropdown-select"
                        value={selectedSizeCategory}
                        onChange={(e) => setSelectedSizeCategory(e.target.value)}
                      >
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <select
                        className="dropdown-select"
                        value={selectedSize?._id || ""}
                        onChange={(e) => {
                          const size = groupedSizes[selectedSizeCategory].find(
                            (s) => s._id === e.target.value
                          );
                          handleSizeSelect(size);
                        }}
                      >
                        {groupedSizes[selectedSizeCategory]?.map((size) => (
                          <option key={size._id} value={size._id}>
                            {size.name}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <div className="size-category-buttons">
                        {availableCategories.map((cat) => (
                          <button
                            key={cat}
                            className={`option-button ${
                              selectedSizeCategory === cat ? "active" : ""
                            }`}
                            onClick={() => setSelectedSizeCategory(cat)}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <div className="size-buttons">
                        {groupedSizes[selectedSizeCategory]?.map((size) => (
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
                    </>
                  )
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="quantity-section">
              {isMobile ? (
                <input
                  type="number"
                  className="dropdown-select quantity-input"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              ) : (
                <div className="quantity-group">
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
              )}
            </div>
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
