import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./RecentlyAddedProducts.css";
import { useNavigate } from "react-router-dom";

const RecentlyAddedProducts = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://wallandtone.com");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/products`);
        console.log("API Response:", response.data);

        if (Array.isArray(response.data)) {
          // Shuffle the products array randomly
          const shuffledProducts = response.data.sort(() => Math.random() - 0.5);
          // Take 10 random products
          const randomProducts = shuffledProducts.slice(0, 10);
          setProducts(randomProducts);
        } else {
          console.error("Unexpected API response structure:", response.data);
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const sliderSettings = {
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 2 },
      },
    ],
  };

  if (loading) return <div className="text-center my-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container recently-added-products-container">
      {products.length > 0 ? (
        <Slider {...sliderSettings}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} navigate={navigate} />
          ))}
        </Slider>
      ) : (
        <p className="text-center recently-added-products-message">
          No products found.
        </p>
      )}
    </div>
  );
};

// ---------------------- Product Card with Hover Effect ----------------------
const ProductCard = ({ product, navigate }) => {
  const [hovered, setHovered] = useState(false);
  const transitionDuration = 400; // Adjust for smoothness

  const randomMockup = useMemo(() => {
    if (!product.subFrameImages || product.subFrameImages.length === 0) return null;
    const mockupImages = product.subFrameImages.filter(imgObj =>
      imgObj.imageUrl &&
      typeof imgObj.imageUrl === "string" &&
      imgObj.imageUrl.toLowerCase().includes("mockup")
    );
    return mockupImages.length > 0
      ? mockupImages[Math.floor(Math.random() * mockupImages.length)].imageUrl
      : null;
  }, [product.subFrameImages]);

  return (
    <div className="recently-added-product-card">
      <div
        className="card product-card"
        onClick={() => navigate(`/product/${product._id}`)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: "pointer",
        }}
      >
        {/* Container with a fixed height, background color, and overflow hidden */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "250px",       // All cards share the same height
            background: "#e7e7e7", // Light-gray background
            overflow: "hidden",
            borderRadius:'4px',
          }}
        >
          {/* Main (smaller) image centered in the container */}
          <img
            src={product.mainImage}
            alt={product.productName}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: "80%",           // Smaller scale
              maxHeight: "80%",          // Keep within container
              objectFit: "contain",      // Prevent cropping/distortion
              transition: `opacity ${transitionDuration}ms ease`,
              opacity: hovered && randomMockup ? 0 : 1,
            }}
          />

          {/* Mockup image on hover, covering entire container */}
          {randomMockup && (
            <img
              src={randomMockup}
              alt={`${product.productName} Mockup`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover", // Full coverage on hover
                transition: `opacity ${transitionDuration}ms ease`,
                opacity: hovered ? 1 : 0,
              }}
            />
          )}
        </div>

        {/* Product Details */}
        <div className="card-body text-center">
          <h5 className="card-title">{product.productName}</h5>
          <p className="card-text text-muted">
            Starting From Rs {product.startFromPrice}/-
          </p>
        </div>
      </div>
    </div>
  );
};



export default RecentlyAddedProducts;
