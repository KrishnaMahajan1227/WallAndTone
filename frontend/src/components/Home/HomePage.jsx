import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HomePage.css";
import BannerSlider from "./BannerSlider/BannerSlider";
import CameraComponent from "../CameraComponent/CameraComponent";
import TopReviewedProducts from "../TopReviewedProducts/TopReviewedProducts";
import RecentlyAddedProducts from "../RecentlyAddedProducts/RecentlyAddedProducts";
import ImageContentComponent from '../ImageContentComponent/ImageContentComponent';
import searchImage from '../../assets/searchPage/searchPagebusinesec.png';


const HomePage = () => {
  // State for storing products fetched from the backend
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Fetch products from the backend on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/products"); // Ensure backend API is correctly set up
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Data for the banner slider
  const BannerImages = [
    {
      src: "/assets/banner-slider-images/banner1.png",
      alt: "Banner 1",
      caption: "Stunning Frames for Every Space",
      heading: "Design Something Truly Yours with AI Wall Art",
      subheading: "Design your wall, your way. Use Wall & Tone’s AI to make the perfect piece and make your space feel like home",
      ctaLink1: "/products",
      ctaText1: "Browse the Collection",
    },
    {
      src: "/assets/banner-slider-images/banner2.png",
      alt: "Banner 2",
      caption: "Unique Wall Art Designs",
      heading: "Turn Cherished Moments into Timeless Art",
      subheading: "From special milestones to everyday joys, transform your memories into personalized wall art that lasts forever with Wall & Tone",
      ctaLink1: "#",
      ctaText1: "Browse the Collection",
    },
    {
      src: "/assets/banner-slider-images/banner1.png",
      alt: "Banner 3",
      caption: "Transform Your Walls Today",
      heading: "Designs for Every Wall, Every Mood",
      subheading: "Whether it’s your home, office, or business, Wall & Tone has the perfect art for you",
      ctaLink1: "#",
      ctaText1: "Browse the Collection",
    },
  ];

  const [activeTab, setActiveTab] = useState("recently-added");

  return (
    <div className="home-page m-auto">
      {/* Hero Section: Banner Slider */}
      <section className="banner-slider-section">
        <BannerSlider BannerImages={BannerImages} />
      </section>

      {/* Products Section */}
      <section className="products-section py-5">
        <div className="container">
          <ul className="nav nav-tabs">
           
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "recently-added" ? "active" : ""}`}
                onClick={() => setActiveTab("recently-added")}
              >
                New In
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "top-reviewed" ? "active" : ""}`}
                onClick={() => setActiveTab("top-reviewed")}
              >
                Best Seller
              </button>
            </li>

            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "top-reviewed" ? "active" : ""}`}
                onClick={() => setActiveTab("top-reviewed")}
              >
                Best Offer
              </button>
            </li>


          </ul>
          <div className="tab-content">
            {activeTab === "top-reviewed" ? (
              <div className="tab-pane fade show active">
                <TopReviewedProducts />
              </div>
            ) : (
              <div className="tab-pane fade show active">
                <RecentlyAddedProducts />
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="Live_preview">
      <ImageContentComponent
        image={searchImage}
        heading="See the Perfect Fit Before You Commit"
        description="No more guessing if that piece of art will look good in your room. Upload a photo of your wall, select your favorite frame, and see how the art transforms your space. It’s the simplest way to ensure your new piece fits perfectly in your home, office, or business."
        ctaText="Preview Your Art"
        ctaLink="/livePreview"
      />
    </div>


      {/* About Us Section */}
      <section className="about-us-section py-5">
        <div className="container text-center">
          <h2 className="section-title">About Us</h2>
          <p className="section-description">
            We are dedicated to bringing you the best products with exceptional service. Our mission is to make your shopping experience seamless and enjoyable.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;