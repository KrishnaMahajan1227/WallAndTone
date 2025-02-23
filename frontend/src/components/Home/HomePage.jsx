import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { X, Sparkles, Lock, ArrowRight } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HomePage.css";
import BannerSlider from "./BannerSlider/BannerSlider";
import CameraComponent from "../CameraComponent/CameraComponent";
import TopReviewedProducts from "../TopReviewedProducts/TopReviewedProducts";
import RecentlyAddedProducts from "../RecentlyAddedProducts/RecentlyAddedProducts";
import ImageContentComponent from '../ImageContentComponent/ImageContentComponent';
import searchImage from '../../assets/searchPage/searchPagebusinesec.png';
import Footer from "../Footer/Footer";

const HomePage = () => {
const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://wallandtone.com');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState("recently-added");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/products`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleAiCreationClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return false;
    }
    navigate('/AiCreation');
    return true;
  };

  const LoginModal = () => (
    <div className="homepage-login-modal">
      <div className="homepage-modal-content">
        <button 
          className="homepage-modal-close" 
          onClick={() => setShowLoginModal(false)}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        
        <div className="homepage-modal-header">
          <div className="homepage-modal-icon">
            <Sparkles className="sparkle-icon" size={32} />
          </div>
          <h2>Unlock AI Creation Magic!</h2>
          <div className="homepage-modal-subheader">
            <Lock size={16} />
            <span>Exclusive Feature</span>
          </div>
        </div>

        <div className="homepage-modal-body">
          <p>Transform your ideas into stunning wall art with our AI-powered creation tools.</p>
          <ul className="homepage-modal-features">
            <li>
              <Sparkles size={16} />
              <span>Create unique, personalized designs</span>
            </li>
            <li>
              <Sparkles size={16} />
              <span>Access exclusive AI art styles</span>
            </li>
            <li>
              <Sparkles size={16} />
              <span>Save and modify your creations</span>
            </li>
          </ul>
        </div>

        <div className="homepage-modal-buttons">
          <button 
            className="homepage-btn-primary" 
            onClick={() => navigate('/login')}
          >
            <span>Login Now</span>
            <ArrowRight size={16} />
          </button>
          <button 
            className="homepage-btn-secondary" 
            onClick={() => setShowLoginModal(false)}
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );

  const BannerImages = [
    {
      src: "/assets/banner-slider-images/Home-Banner-ArtFor.png",
      alt: "Home-Banner-ArtFor.png",
      heading: "Art for Every Wall, Every Mood",
      subheading: "Home, office, or cafe—whatever the space, we've got the perfect piece to match your vibe.",
      ctaLink1: "/products",
      ctaText1: "Explore Collection",
    },
    {
      src: "/assets/banner-slider-images/Home-Banner-Memories.png",
      alt: "Home-Banner-Memories",
      heading: "Your Memories, Your Masterpiece",
      subheading: "Turn special moments into timeless art—because your walls deserve a personal touch.",
      ctaLink1: "#",
      ctaText1: "Explore Collection",
    },
    {
      src: "/assets/banner-slider-images/Home-Banner-AI-Art.png",
      alt: "Home-Banner-AI-Art",
      heading: "Create Your Own AI-Designed Art",
      subheading: "Design your wall, your way. We help you use AI to craft the perfect piece and make your space truly yours!",
      ctaLink1: "/AiCreation",
      ctaText1: "Explore Collection",
      onClick: handleAiCreationClick
    },
  ];

  return (
    <div className="homepage">
      {showLoginModal && <LoginModal />}
      
      <section className="homepage-banner-slider-section">
        <BannerSlider BannerImages={BannerImages} isLoggedIn={isLoggedIn} />
      </section>

      <section className="homepage-products-section py-5">
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

      <div className="homepage-live-preview">
        <ImageContentComponent
          image={searchImage}
          heading="See the Perfect Fit Before You Commit"
          description="No more guessing if that piece of art will look good in your room. Upload a photo of your wall, select your favorite frame, and see how the art transforms your space. It's the simplest way to ensure your new piece fits perfectly in your home, office, or business."
          ctaText="Preview Your Art"
          ctaLink="/livePreview"
        />
      </div>

      <section className="homepage-about-section py-5">
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