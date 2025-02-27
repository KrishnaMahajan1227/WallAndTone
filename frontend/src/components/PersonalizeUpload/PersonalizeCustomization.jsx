import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Heart, X } from "lucide-react";
import axios from "axios";
import { frameBackgrounds } from "../constants/frameImages";
import "../FreepikCustomization/FreepikCustomization.css";

const PersonalizeCustomization = () => {
  const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:8080" : "https://wallandtone.com");

  const location = useLocation();
  const navigate = useNavigate();
  const personalizedImage = location.state?.image;
  const isCustom = location.state?.isCustom;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [frameTypes, setFrameTypes] = useState([]);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [alertMessage, setAlertMessage] = useState("");
  const [activeImage, setActiveImage] = useState(null);
  const [subCartOpen, setSubCartOpen] = useState(false);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [wishlist, setWishlist] = useState([]);
  const [loadingSubFrame, setLoadingSubFrame] = useState(false);

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
          setError("Failed to fetch sub-frame types");
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
        setError("Failed to fetch sizes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSizes();
  }, []);

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
    setActiveImage(personalizedImage);
  };

  const handleSubFrameTypeSelect = async (subFrameType) => {
    setLoadingSubFrame(true);
    setSelectedSubFrameType(subFrameType);
    setActiveImage(personalizedImage);
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
        image: personalizedImage
      };

      if (token) {
        const response = await axios.post(`${apiUrl}/api/cart/add`, cartItem, { headers: { Authorization: `Bearer ${token}` } });

        if (response.data.cart) {
          setCart(response.data.cart);
          setAlertMessage("Added to cart successfully!");
          setSubCartOpen(true);
        } else {
          throw new Error("Invalid response from server");
        }
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      setAlertMessage("Failed to add to cart");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!personalizedImage) return <div>No image selected for customization</div>;

  return (
    <div className="product-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="product-details">
        <div className="image-section">
          <div className="main-image-container">
            {selectedSubFrameType && (
              <img src={frameBackgrounds[selectedSubFrameType.name]} alt="Frame background" className="frame-background" />
            )}
            <img src={activeImage || personalizedImage} alt="Uploaded Artwork" className="generated-artwork" />
          </div>
        </div>

        <div className="info-section">
          <h3 className="product-title">Customize Your Artwork</h3>
          <div className="options-section">
            <div className="frame-type-section">
              {frameTypes.map(frameType => (
                <button key={frameType._id} className={`option-button ${selectedFrameType?._id === frameType._id ? "active" : ""}`} onClick={() => handleFrameTypeSelect(frameType)}>
                  {frameType.name}
                </button>
              ))}
            </div>

            {selectedFrameType && subFrameTypes.length > 0 && (
              <div className="sub-frame-type-section">
                {subFrameTypes.map(subFrameType => (
                  <button key={subFrameType._id} className={`option-button ${selectedSubFrameType?._id === subFrameType._id ? "active" : ""}`} onClick={() => handleSubFrameTypeSelect(subFrameType)}>
                    {subFrameType.name}
                  </button>
                ))}
              </div>
            )}

            {selectedSubFrameType && sizes.length > 0 && (
              <div className="size-section">
                {sizes.map(size => (
                  <button key={size._id} className={`option-button ${selectedSize?._id === size._id ? "active" : ""}`} onClick={() => handleSizeSelect(size)}>
                    {size.width} x {size.height}
                  </button>
                ))}
              </div>
            )}
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
