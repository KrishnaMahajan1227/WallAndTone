import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import axios from "axios";
import { frameBackgrounds } from "../constants/frameImages";
import { ToastContainer, toast } from "react-toastify";
import { Helmet } from "react-helmet";
import "react-toastify/dist/ReactToastify.css";
import "./PersonalizeCustomization.css"; // Keeps UI Consistency

const PersonalizeCustomization = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://wallandtone.com");

  const location = useLocation();
  const navigate = useNavigate();
  const personalizedImage = location.state?.image;
  // Even though orientation is sent from the previous screen, you can ignore it if needed.
  const selectedOrientation = location.state?.orientation || "portrait";
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [frameTypes, setFrameTypes] = useState([]);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  // 'sizes' are now derived from the selected frame type's frameSizes array
  const [sizes, setSizes] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });

  const [selectedFrameType, setSelectedFrameType] = useState(null);
  const [selectedSubFrameType, setSelectedSubFrameType] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Fetch frame types on mount
  useEffect(() => {
    const fetchFrameTypes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/frame-types`);
        setFrameTypes(response.data);
        if (response.data.length > 0) {
          // Default: select the first frame type
          const defaultFrameType = response.data[0];
          setSelectedFrameType(defaultFrameType);
        }
      } catch (err) {
        setError("Failed to fetch frame types");
      }
    };
    fetchFrameTypes();
  }, [apiUrl]);

  // When selectedFrameType changes, fetch its sub-frame types and update available sizes from frameSizes
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
        // Update sizes using the frameSizes field from the selected frame type
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
        orientation: selectedOrientation, // still sending if needed by backend
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!personalizedImage)
    return <div>No image selected for customization</div>;

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
        <link
          rel="canonical"
          href="https://wallandtone.com/personalize-customization"
        />
        <meta
          property="og:title"
          content="Customize Your Artwork | Wall & Tone"
        />
        <meta
          property="og:description"
          content="Create a personalized masterpiece by choosing from a range of frames and sizes. Transform your uploaded image into unique wall art with Wall & Tone."
        />
        <meta
          property="og:image"
          content="https://wallandtone.com/path-to-your-default-og-image.jpg"
        />
        <meta
          property="og:url"
          content="https://wallandtone.com/personalize-customization"
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
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
            {/* Render background only if frame type is not Canvas or Poster */}
            {selectedSubFrameType &&
              selectedFrameType &&
              !["canvas", "poster"].includes(
                selectedFrameType.name.toLowerCase()
              ) && (
                <img
                  src={frameBackgrounds[selectedSubFrameType.name]}
                  alt="Frame background"
                  className="frame-background"
                />
              )}
            <img
              src={personalizedImage}
              alt="Uploaded Artwork"
              className={`generated-artwork ${
                selectedFrameType?.name?.toLowerCase() === "acrylic"
                  ? "acrylic-style"
                  : ""
              }`}
            />
          </div>
        </div>

        <div className="info-section">
          <h3 className="product-title">Customize Your Artwork</h3>
          <div className="options-section">
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
          </div>

          <div className="price-section">
            <h3>Total Price: ₹{calculateTotalPrice()}</h3>
          </div>

          <button className="add-to-cart" onClick={handleAddToCart}>
            <ShoppingCart size={20} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizeCustomization;
