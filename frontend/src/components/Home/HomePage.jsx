import React, { useState, useEffect } from "react";
import { useNavigate, NavLink  } from "react-router-dom";
import axios from "axios";
import { X, Sparkles, Lock, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet";  // Import Helmet for SEO

import "bootstrap/dist/css/bootstrap.min.css";
import "./HomePage.css";
import BannerSlider from "./BannerSlider/BannerSlider";
import CameraComponent from "../CameraComponent/CameraComponent";
import TopReviewedProducts from "../TopReviewedProducts/TopReviewedProducts";
import RecentlyAddedProducts from "../RecentlyAddedProducts/RecentlyAddedProducts";
import ImageContentComponent from '../ImageContentComponent/ImageContentComponent';
import LivePreviewHome from '../../assets/Home/Live-Preview-Home.png';
import AiCreationHome from '../../assets/Home/Ai-Creation-Home.png';
import ArtforEveryCorner from '../../assets/Home/Art-for-Every-Corner.png';

import CreateYourWallArt from '../../assets/Home/create-your-Wall-art-home.png';
import createyouwallartframehome from '../../assets/Home/create-you-wall-art-frame-home.png';

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
    navigate('/Ai Creation');
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
      ctaLink1: "/Ai Creation",
      ctaText1: "Create Ai Art",
      onClick: handleAiCreationClick
    },
  ];

  return (
    <div className="homepage">
      {/* SEO Meta Tags for HomePage */}
      <Helmet>
        <title>Wall & Tone | Home - Exclusive Wall Art & Decor</title>
        <meta
          name="description"
          content="Discover unique wall art pieces for every space. Explore our exclusive collections, experience live previews, and create custom art with our AI-powered tools at Wall & Tone."
        />
        <meta
          name="keywords"
          content="wall art, home decor, live preview, AI art, exclusive wall art, custom art"
        />
        <link rel="canonical" href="https://wallandtone.com/" />
        {/* Open Graph Tags */}
        <meta
          property="og:title"
          content="Wall & Tone | Home - Exclusive Wall Art & Decor"
        />
        <meta
          property="og:description"
          content="Discover unique wall art pieces for every space. Explore our exclusive collections, experience live previews, and create custom art with our AI-powered tools at Wall & Tone."
        />
        <meta
          property="og:image"
          content="https://wallandtone.com/assets/og-home.jpg"
        />
        <meta property="og:url" content="https://wallandtone.com/" />
        <meta property="og:type" content="website" />
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Wall & Tone | Home - Exclusive Wall Art & Decor"
        />
        <meta
          name="twitter:description"
          content="Discover unique wall art pieces for every space. Explore our exclusive collections, experience live previews, and create custom art with our AI-powered tools at Wall & Tone."
        />
        <meta
          name="twitter:image"
          content="https://wallandtone.com/assets/og-home.jpg"
        />
      </Helmet>


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

      {/* 🔹 Best Seller tab is temporarily commented out */}
      {/* 
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === "top-reviewed" ? "active" : ""}`}
          onClick={() => setActiveTab("top-reviewed")}
        >
          Best Seller
        </button>
      </li>
      */}

      {/* 🔹 Best Offer tab is temporarily commented out */}
      {/* 
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === "top-reviewed" ? "active" : ""}`}
          onClick={() => setActiveTab("top-reviewed")}
        >
          Best Offer
        </button>
      </li>
      */}
    </ul>

    <div className="tab-content">
      {/* 🔹 Since Best Seller & Best Offer are commented, show only Recently Added */}
      <div className="tab-pane fade show active">
        <RecentlyAddedProducts />
      </div>

      {/* 🔹 Best Seller & Best Offer content is commented out */}
      {/* 
      {activeTab === "top-reviewed" ? (
        <div className="tab-pane fade show active">
          <TopReviewedProducts />
        </div>
      ) : null}
      */}
    </div>
  </div>
</section>


      <section className="homepage-Art-Corner">
        <ImageContentComponent
          image={ArtforEveryCorner}
          heading="Art for Every Corner"
          description="No more boring walls! Whether it’s your living room, office, café, hotel, or even that awkward empty hallway, the right wall art and frames can instantly transform any space. 
Go bold with pop art, keep it classy with monochromes, or add a touch of nostalgia with vintage prints — whatever your vibe, we’ve got a piece for it. 
From sleek modern frames to timeless classics, let’s turn your walls into conversation starters!"
          ctaText="Explore Collection"
          ctaLink="/products"
          reverse="yes"
        />
      </section>

      <section className="home-create-your-Wall-art">
        <img src={CreateYourWallArt} alt="Create-Your-Wall-Art" className="background-image" />
        <div className="image-frame">
            <img src={createyouwallartframehome} alt="create-your-wall-art-frame-home" />
        </div>
        <div className="overlay-content">
            <h2>Turn Your Favorite Moments into Wall Art</h2>
            <NavLink to="/Personalize">
  <button className="btn btn-primary">Create Your Wall Art</button>
</NavLink>        </div>
    </section>

      <section className="homepage-live-preview">
        <ImageContentComponent
          image={LivePreviewHome}
          heading="See the Perfect Fit Before You Commit"
          description="No more guessing if that piece of art will look good in your room. Upload a photo of your wall, select your favorite frame, and see how the art transforms your space. It's the simplest way to ensure your new piece fits perfectly in your home, office, or business."
          ctaText="Comming Soon !"
          ctaLink="#"
          reverse="yes"
        />
      </section>

      <section className="homepage-Ai-creation">
        <ImageContentComponent
          image={AiCreationHome}
          heading="AI-Powered Art Creation"
          description="Discover the art of personalization with our AI-powered design tool. Whether you're looking for the perfect frame or canvas, our intelligent system helps you craft a masterpiece that complements your style and space effortlessly. Choose from a variety of sizes, materials, and finishes to bring your vision to life—all in just a few clicks!"
          ctaText="Create with AI"
          ctaLink="/Ai Creation"
        />
      </section>

    </div>
  );
};

export default HomePage;