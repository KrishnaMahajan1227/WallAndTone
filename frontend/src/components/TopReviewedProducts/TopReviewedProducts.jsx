import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TopReviewedProducts.css";

const TopReviewedProducts = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/';

  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/products`);
        console.log("API Response:", response.data);

        const products = Array.isArray(response.data) ? response.data : [];

        if (products.length > 0) {
          const filteredProducts = products
            .filter((product) => product.reviews.length > 1)
            .sort((a, b) => b.reviews.length - a.reviews.length);

          setTopProducts(filteredProducts.slice(0, 10));
        } else {
          console.warn("No products available.");
          setTopProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (loading) return <div className="text-center my-5">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="top-reviewed-products-container">
      {topProducts.length > 0 ? (
        <Slider {...sliderSettings}>
          {topProducts.map((product, index) => (
            <div key={index} className="top-reviewed-product-card">
              <div className="card">
                <img
                  src={`${product.mainImage}`}
                  alt={product.productName}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.productName}</h5>
                  <p className="card-text">
                    {product.reviews.length} Reviews
                  </p>
                  <p className="card-text">
                    <strong>${product.price}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <p className="text-center top-reviewed-products-message">
          No top-reviewed products found.
        </p>
      )}
    </div>
  );
};

export default TopReviewedProducts;