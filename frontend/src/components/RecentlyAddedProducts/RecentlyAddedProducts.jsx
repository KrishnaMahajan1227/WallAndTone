import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./RecentlyAddedProducts.css";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

const RecentlyAddedProducts = () => {
const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://wallandtone.com');

  const [products, setProducts] = useState([]); // Ensure products is an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/products`);
        console.log("API Response:", response.data);

        if (Array.isArray(response.data)) {
          const recentProducts = response.data.slice(0, 10); // Get the 10 most recent products
          setProducts(recentProducts);
        } else {
          console.error("Unexpected API response structure:", response.data);
          setProducts([]); // Fallback to an empty array
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setProducts([]); // Fallback to an empty array on error
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
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
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
            <div key={product._id} className="recently-added-product-card">
              <div className="card" onClick={() => handleProductClick(product._id)}>
                <img
                  src={product.mainImage}
                  alt={product.productName}
                  className="card-img-top"
                />
                <div className="card-body">
                  <h5 className="card-title">{product.productName}</h5>
                  <p className="card-text">{product.description}</p>
                  <p className="card-text text-muted">Starting From Rs {product.startFromPrice}/-</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <p className="text-center recently-added-products-message">
          No recently added products found.
        </p>
      )}
    </div>
  );
};

export default RecentlyAddedProducts;
