import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import axios from "axios";
import { frameBackgrounds } from "../constants/frameImages";
import { ToastContainer, toast } from "react-toastify";
import { Helmet } from "react-helmet";
import "react-toastify/dist/ReactToastify.css";
import "./PersonalizeCustomization.css";
import RecentlyAddedProducts from "../RecentlyAddedProducts/RecentlyAddedProducts";

const PersonalizeCustomization = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://wallandtone.com");

  const location = useLocation();
  const navigate = useNavigate();
  const personalizedImage = location.state?.image;
  const selectedOrientation = location.state?.orientation || "portrait";
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [frameTypes, setFrameTypes] = useState([]);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });

  const [selectedFrameType, setSelectedFrameType] = useState(null);
  const [selectedSubFrameType, setSelectedSubFrameType] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  // For non-poster frame types, allow grouping by size category.
  const [selectedSizeCategory, setSelectedSizeCategory] = useState("");

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

  // Group sizes by category.
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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch frame types.
  useEffect(() => {
    const fetchFrameTypes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/frame-types`);
        setFrameTypes(response.data);
        if (response.data.length > 0) {
          setSelectedFrameType(response.data[0]);
        }
      } catch (err) {
        setError("Failed to fetch frame types");
      }
    };
    fetchFrameTypes();
  }, [apiUrl]);

  // When selectedFrameType changes, fetch its sub-frame types and sizes.
  useEffect(() => {
    const fetchSubFrameTypesAndSizes = async () => {
      if (selectedFrameType?._id) {
        try {
          const subResponse = await axios.get(
            `${apiUrl}/api/sub-frame-types/${selectedFrameType._id}`
          );
          setSubFrameTypes(subResponse.data);
          if (subResponse.data.length > 0) {
            setSelectedSubFrameType(subResponse.data[0]);
          } else {
            setSelectedSubFrameType(null);
          }
        } catch (err) {
          setError("Failed to fetch sub-frame types");
        }
        if (
          selectedFrameType.frameSizes &&
          Array.isArray(selectedFrameType.frameSizes) &&
          selectedFrameType.frameSizes.length > 0
        ) {
          setSizes(selectedFrameType.frameSizes);
          setSelectedSize(selectedFrameType.frameSizes[0]);
        } else {
          setSizes([]);
          setSelectedSize(null);
        }
      } else {
        setSubFrameTypes([]);
        setSizes([]);
        setSelectedSize(null);
      }
      setLoading(false);
    };
    fetchSubFrameTypesAndSizes();
  }, [selectedFrameType, apiUrl]);

  // Persist selections.
  useEffect(() => {
    if (selectedFrameType && selectedSubFrameType && selectedSize) {
      localStorage.setItem("selectedFrameType", JSON.stringify(selectedFrameType));
      localStorage.setItem("selectedSubFrameType", JSON.stringify(selectedSubFrameType));
      localStorage.setItem("selectedSize", JSON.stringify(selectedSize));
    }
  }, [selectedFrameType, selectedSubFrameType, selectedSize]);

  const calculateTotalPrice = () => {
    const framePrice = parseFloat(selectedFrameType?.price) || 0;
    const subFramePrice = parseFloat(selectedSubFrameType?.price) || 0;
    const sizePrice = parseFloat(selectedSize?.price) || 0;
    const total = framePrice + subFramePrice + sizePrice;
    return (total * quantity).toFixed(2);
  };

  const handleAddToCart = async () => {
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) {
      toast.error("Please select all options before adding to cart");
      return;
    }
    try {
      const cartItem = {
        quantity,
        frameType: selectedFrameType._id,
        subFrameType: selectedSubFrameType._id,
        size: selectedSize._id,
        isCustom: true,
        image: personalizedImage,
        orientation: selectedOrientation,
      };
      if (token) {
        const response = await axios.post(`${apiUrl}/api/cart/add`, cartItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(response.data.cart);
        toast.success("Added to cart successfully!");
      }
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const handleQuantityChange = (e) => {
    setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1));
  };

  // Check if the selected frame type is a poster.
  const isPosterFrame =
    selectedFrameType && selectedFrameType.name.toLowerCase() === "poster";

  // For non-poster frame types, group sizes by category.
  const groupedSizes = groupSizesByCategory(sizes);
  const categoryOrder = ["Small", "Medium", "Large", "Extra Large", "Poster"];
  const availableCategories = Object.keys(groupedSizes).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  // Set default size category for non-poster frames.
  useEffect(() => {
    if (!isPosterFrame && availableCategories.length > 0 && !selectedSizeCategory) {
      setSelectedSizeCategory(availableCategories[0]);
    }
  }, [availableCategories, selectedSizeCategory, isPosterFrame]);

  // Ensure a valid size is selected when the size category changes.
  useEffect(() => {
    if (!isPosterFrame && selectedSizeCategory && groupedSizes[selectedSizeCategory]?.length > 0) {
      const validSize = groupedSizes[selectedSizeCategory].find(
        (s) => s._id === selectedSize?._id
      );
      if (!validSize) {
        setSelectedSize(groupedSizes[selectedSizeCategory][0]);
      }
    }
  }, [selectedSizeCategory, sizes, isPosterFrame, groupedSizes, selectedSize]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!personalizedImage) return <div>No image selected for customization</div>;

  return (
    <div className="personalize-customization">
      <Helmet>
        <title>Customize Your Artwork | Wall & Tone</title>
        <meta
          name="description"
          content="Customize your uploaded artwork by selecting frame types, sub-frames, and sizes. Create a masterpiece that reflects your unique style with Wall & Tone."
        />
        <meta
          name="keywords"
          content="Customize Artwork, Personalize Wall Art, Custom Frame, Wall & Tone, Frame Customization, Art Customization"
        />
        <link rel="canonical" href="https://wallandtone.com/personalize-customization" />
        <meta property="og:title" content="Customize Your Artwork | Wall & Tone" />
        <meta
          property="og:description"
          content="Create a personalized masterpiece by choosing from a range of frames and sizes. Transform your uploaded image into unique wall art with Wall & Tone."
        />
        <meta
          property="og:image"
          content="https://wallandtone.com/path-to-your-default-og-image.jpg"
        />
        <meta property="og:url" content="https://wallandtone.com/personalize-customization" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* ToastContainer ensures that toast notifications display */}
      <ToastContainer />

      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="customization-details">
        <div className="image-section">
          <div
            className={`main-image-container ${
              selectedOrientation === "landscape" ? "landscape-mode" : ""
            }`}
          >
            {selectedSubFrameType &&
              selectedFrameType &&
              !["canvas", "poster"].includes(selectedFrameType.name.toLowerCase()) && (
                <img
                  src={frameBackgrounds[selectedSubFrameType.name]}
                  alt="Frame background"
                  className="frame-background"
                />
              )}
<img
  src={personalizedImage}
  alt="Uploaded Artwork"
  className={`generated-artwork 
    ${selectedOrientation === "landscape" ? "landscape-artwork" : ""} 
    ${
      selectedFrameType?.name?.toLowerCase() === "frame"
        ? "frame-type-style"
        : !["canvas", "poster"].includes(selectedFrameType?.name?.toLowerCase())
        ? "acrylic-style"
        : ""
    }`}
/>


          </div>
        </div>

        <div className="info-section">
          <h3 className="product-title">Customize Your Artwork</h3>
          <div className="price-section">
            <p>Total Price: ₹{calculateTotalPrice()}</p>
          </div>
          <div className="options-section">
            {/* Frame Type - remains as buttons */}
            <div className="frame-type-buttons">
              {frameTypes.map((frameType) => (
                <button
                  key={frameType._id}
                  className={`option-button ${
                    selectedFrameType?._id === frameType._id ? "active" : ""
                  }`}
                  onClick={() => setSelectedFrameType(frameType)}
                >
                  {frameType.name}
                </button>
              ))}
            </div>

            {/* For mobile: Sub-frame, Size, Quantity as dropdowns */}
            {isMobile ? (
              <>
                <div className="dropdown-group">
                  <select
                    className="dropdown-select"
                    value={selectedSubFrameType?._id || ""}
                    onChange={(e) => {
                      const newSubFrame = subFrameTypes.find(
                        (sft) => sft._id === e.target.value
                      );
                      setSelectedSubFrameType(newSubFrame);
                    }}
                  >
                    {subFrameTypes.map((subFrameType) => (
                      <option key={subFrameType._id} value={subFrameType._id}>
                        {subFrameType.name}
                      </option>
                    ))}
                  </select>
                </div>

                {isPosterFrame ? (
                  <div className="dropdown-group">
                    <select
                      className="dropdown-select"
                      value={selectedSize?._id || ""}
                      onChange={(e) => {
                        const size = sizes.find((s) => s._id === e.target.value);
                        setSelectedSize(size);
                      }}
                    >
                      {sizes.map((size) => (
                        <option key={size._id} value={size._id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="dropdown-group">
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
                    </div>
                    <div className="dropdown-group">
                      <select
                        className="dropdown-select"
                        value={selectedSize?._id || ""}
                        onChange={(e) => {
                          const size = groupedSizes[selectedSizeCategory].find(
                            (s) => s._id === e.target.value
                          );
                          setSelectedSize(size);
                        }}
                      >
                        {groupedSizes[selectedSizeCategory]?.map((size) => (
                          <option key={size._id} value={size._id}>
                            {size.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="dropdown-group">
                  <input
                    type="number"
                    className="dropdown-select quantity-input"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                  />
                </div>
              </>
            ) : (
              // Desktop view: Use button groups
              <>
                <div className="sub-frame-type-buttons">
                  {subFrameTypes.map((subFrameType) => (
                    <button
                      key={subFrameType._id}
                      className={`option-button ${
                        selectedSubFrameType?._id === subFrameType._id ? "active" : ""
                      }`}
                      onClick={() => setSelectedSubFrameType(subFrameType)}
                    >
                      {subFrameType.name}
                    </button>
                  ))}
                </div>

                <div className="size-section">
                  {isPosterFrame ? (
                    <div className="size-buttons">
                      {sizes.map((size) => (
                        <button
                          key={size._id}
                          className={`option-button ${
                            selectedSize?._id === size._id ? "active" : ""
                          }`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
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
                            onClick={() => setSelectedSize(size)}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="quantity-group">
                  <input
                    type="number"
                    className="quantity-input"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                  />
                </div>
              </>
            )}
          </div>

          <button className="add-to-cart" onClick={handleAddToCart}>
            <ShoppingCart size={20} /> Add to Cart
          </button>
        </div>
      </div>

      <hr className="productDetails-spacing my-5" />
      <div className="recommendations mb-5">
        <h2>Recommendations</h2>
        <RecentlyAddedProducts />
      </div>
    </div>
  );
};

export default PersonalizeCustomization;
