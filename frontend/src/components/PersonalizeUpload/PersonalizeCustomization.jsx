import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import axios from "axios";
import { frameBackgrounds } from "../constants/frameImages";
import "./PersonalizeCustomization.css"; // Keeps UI Consistency

const PersonalizeCustomization = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 
    (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://wallandtone.com");

  const location = useLocation();
  const navigate = useNavigate();
  const personalizedImage = location.state?.image;
  const selectedOrientation = location.state?.orientation || "portrait"; // Default: Portrait
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [frameTypes, setFrameTypes] = useState([]);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [alertMessage, setAlertMessage] = useState("");
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });

  const [selectedFrameType, setSelectedFrameType] = useState(null);
  const [selectedSubFrameType, setSelectedSubFrameType] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

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
          setError("Failed to fetch sub-frame types");
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
        setError("Failed to fetch sizes");
      } finally {
        setLoading(false);
      }
    };
    fetchSizes();
  }, []);

  const calculateTotalPrice = () => {
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) return 0;
    let total = parseFloat(selectedFrameType.price) + parseFloat(selectedSubFrameType.price) + parseFloat(selectedSize.price);
    return (total * quantity).toFixed(2);
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
        image: personalizedImage,
        orientation: selectedOrientation // ✅ Send orientation to backend
      };

      if (token) {
        const response = await axios.post(`${apiUrl}/api/cart/add`, cartItem, { headers: { Authorization: `Bearer ${token}` } });
        setCart(response.data.cart);
        setAlertMessage("Added to cart successfully!");
      }
    } catch (err) {
      setAlertMessage("Failed to add to cart");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!personalizedImage) return <div>No image selected for customization</div>;

  return (
    <div className="personalize-customization">
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="customization-details">
        <div className="image-section">
          <div className={`main-image-container ${selectedOrientation === "landscape" ? "landscape-mode" : ""}`}>
            {selectedSubFrameType && (
              <img src={frameBackgrounds[selectedSubFrameType.name]} alt="Frame background" className="frame-background" />
            )}
            <img src={personalizedImage} alt="Uploaded Artwork" className="generated-artwork" />
          </div>
        </div>

        <div className="info-section">
          <h3 className="product-title">Customize Your Artwork</h3>
          <div className="options-section">
            <h4>Select Frame Type</h4>
            <div className="frame-type-buttons">
              {frameTypes.map(frameType => (
                <button key={frameType._id} className={`option-button ${selectedFrameType?._id === frameType._id ? "active" : ""}`} onClick={() => setSelectedFrameType(frameType)}>
                  {frameType.name}
                </button>
              ))}
            </div>

            <h4>Select Sub-Frame</h4>
            <div className="sub-frame-type-buttons">
              {subFrameTypes.map(subFrameType => (
                <button key={subFrameType._id} className={`option-button ${selectedSubFrameType?._id === subFrameType._id ? "active" : ""}`} onClick={() => setSelectedSubFrameType(subFrameType)}>
                  {subFrameType.name}
                </button>
              ))}
            </div>

            <h4>Select Size</h4>
            <div className="size-buttons">
              {sizes.map(size => (
                <button key={size._id} className={`option-button ${selectedSize?._id === size._id ? "active" : ""}`} onClick={() => setSelectedSize(size)}>
                  {size.width} x {size.height}
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
