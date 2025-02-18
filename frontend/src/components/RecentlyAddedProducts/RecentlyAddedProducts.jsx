import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./RecentlyAddedProducts.css";
import { useNavigate } from 'react-router-dom';
import { Alert, Modal, Button } from 'react-bootstrap';

const RecentlyAddedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
// Get all the quick view buttons
  const navigate = useNavigate();

const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/products");
        console.log("API Response:", response.data);

        const recentProducts = response.data.slice(0, 10); // Get the 10 most recent products

        setProducts(recentProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const sliderSettings = {
    infinite: false, /* Set infinite to false to prevent the slider from looping */
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false, /* Remove the arrows as they are not needed */
    dots: true, /* Remove the dots as they are not needed */
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
    <div className="container recently-added-products-container">
      {products.length > 0 ? (
        <Slider {...sliderSettings}>
          {products.map((product) => (
            <div key={product._id} className="recently-added-product-card">
              <div className="card">
                <img
                  src={`${product.mainImage}`}
                  alt={product.productName}
                  className="card-img-top"
                />
                <div className="overlay">
                <Button variant="primary" onClick={() => handleProductClick(product._id)} className="quick-view-button">
                    Quick View
                </Button>                
                </div>
                <div className="card-body">
                  <h5 className="card-title">{product.productName}</h5>
                  <p className="card-text">{product.description}</p>
                  <p className="card-text">
                    <strong>${product.price}</strong>
                  </p>
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