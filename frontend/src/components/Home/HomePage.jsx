import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import { X, Sparkles, Lock, ArrowRight, Heart } from "lucide-react";
import { Helmet } from "react-helmet"; // Import Helmet for SEO

import "bootstrap/dist/css/bootstrap.min.css";
import "./HomePage.css";
import BannerSlider from "./BannerSlider/BannerSlider";
import CameraComponent from "../CameraComponent/CameraComponent";
import RecentlyAddedProducts from "../RecentlyAddedProducts/RecentlyAddedProducts";
import ImageContentComponent from "../ImageContentComponent/ImageContentComponent";
import LivePreviewHome from "../../assets/Home/Live-Preview-Home.png";
import AiCreationHome from "../../assets/Home/Ai-Creation-Home.png";
import ArtforEveryCorner from "../../assets/Home/Art-for-Every-Corner.png";

import CreateYourWallArt from "../../assets/Home/create-your-Wall-art-home.png";
import createyouwallartframehome from "../../assets/Home/create-you-wall-art-frame-home.png";

const HomePage = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://wallandtone.com");
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);
  const [activeTab, setActiveTab] = useState("recently-added");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bannerImages, setBannerImages] = useState([]);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Fetch products
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
  }, [apiUrl]);

  // Functions for redirection
  const handleAiCreationClick = useCallback(
    (e) => {
      e.preventDefault();
      if (!isLoggedIn) {
        setShowAiModal(true);
        return;
      }
      navigate("/Ai Creation");
    },
    [isLoggedIn, navigate]
  );

  const handlePersonalizeClick = useCallback(
    (e) => {
      e.preventDefault();
      if (!isLoggedIn) {
        setShowPersonalizeModal(true);
        return;
      }
      navigate("/Personalize");
    },
    [isLoggedIn, navigate]
  );

  // Responsive BannerImages logic
// Responsive BannerImages logic
useEffect(() => {
  const updateBannerImages = () => {
    console.log("Window width:", window.innerWidth);
    if (window.innerWidth <= 778) {
      setBannerImages([
        {
          src: "/assets/banner-slider-images/Home-Banner-Memories-Mobile.png",
          alt: "Responsive Home-Banner-Memories",
          heading: "Your Memories, Your Masterpiece",
          subheading:
            "Turn special moments into timeless art—because your walls deserve a personal touch.",
          ctaLink1: "/Personalize",
          ctaText1: "Create Your Wall Art",
          onClick: handlePersonalizeClick,
        },
        {
          src: "/assets/banner-slider-images/Home-Banner-AI-Art-Mobile.png",
          alt: "Responsive Home-Banner-AI-Art",
          heading: "Create Your Own AI-Designed Art",
          subheading:
            "Design your wall, your way. We help you use AI to craft the perfect piece and make your space truly yours!",
          ctaLink1: "/Ai Creation",
          ctaText1: "Create Ai Art",
          onClick: handleAiCreationClick,
        },
        {
          src: "/assets/banner-slider-images/Home-Banner-ArtFor-Mobile.png",
          alt: "Responsive Home-Banner-ArtFor",
          heading: "Art for Every Wall, Every Mood",
          subheading:
            "Home, office, or cafe—whatever the space, we've got the perfect piece to match your vibe.",
          ctaLink1: "/products",
          ctaText1: "Explore Collection",
        },
      ]);
    } else {
      setBannerImages([
        {
          src: "/assets/banner-slider-images/Home-Banner-Memories.png",
          alt: "Home-Banner-Memories",
          heading: "Your Memories, Your Masterpiece",
          subheading:
            "Turn special moments into timeless art—because your walls deserve a personal touch.",
          ctaLink1: "/Personalize",
          ctaText1: "Create Your Wall Art",
          onClick: handlePersonalizeClick,
        },
        {
          src: "/assets/banner-slider-images/Home-Banner-AI-Art.png",
          alt: "Home-Banner-AI-Art",
          heading: "Create Your Own AI-Designed Art",
          subheading:
            "Design your wall, your way. We help you use AI to craft the perfect piece and make your space truly yours!",
          ctaLink1: "/Ai Creation",
          ctaText1: "Create Ai Art",
          onClick: handleAiCreationClick,
        },
        {
          src: "/assets/banner-slider-images/Home-Banner-ArtFor.png",
          alt: "Home-Banner-ArtFor.png",
          heading: "Art for Every Wall, Every Mood",
          subheading:
            "Home, office, or cafe—whatever the space, we've got the perfect piece to match your vibe.",
          ctaLink1: "/products",
          ctaText1: "Explore Collection",
        },
      ]);
    }
  };

  updateBannerImages();
  window.addEventListener("resize", updateBannerImages);
  return () => window.removeEventListener("resize", updateBannerImages);
}, [handleAiCreationClick, handlePersonalizeClick]);


  // Smooth fade-in animation styles (applied via a style tag)
  const modalAnimationStyles = (
    <style>
      {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}
    </style>
  );

  // AI Creation Login Modal Component
  const AiLoginModal = () => (
    <>
      {modalAnimationStyles}
      <div
        className="homepage-login-modal modal-fade-in"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "1rem",
        }}
      >
        <div
          className="homepage-modal-content"
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "2rem",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            position: "relative",
          }}
        >
          <button
            className="homepage-modal-close"
            onClick={() => setShowAiModal(false)}
            aria-label="Close modal"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={24} />
          </button>

          <div
            className="homepage-modal-header"
            style={{ textAlign: "center", marginBottom: "1rem" }}
          >
            <div
              className="homepage-modal-icon"
              style={{ marginBottom: "0.5rem" }}
            >
              <Sparkles
                className="sparkle-icon"
                size={32}
                style={{ color: "#5B2EFF" }}
              />
            </div>
            <h2>Unlock AI Creation Magic<br />FOR FREE !</h2>
          </div>

          <div
            className="homepage-modal-body"
            style={{ textAlign: "center", marginBottom: "1.5rem" }}
          >
            <p>
              Transform your ideas into stunning wall art with our AI-powered
              creation tools.
            </p>
            <ul
              className="homepage-modal-features"
              style={{ listStyle: "none", padding: 0 }}
            >
              <li
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Sparkles size={16} />
                <span>Create unique, personalized designs</span>
              </li>
              <li
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Sparkles size={16} />
                <span>Access exclusive AI art styles</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Sparkles size={16} />
                <span>Save and modify your creations</span>
              </li>
            </ul>
          </div>

          <div
            className="homepage-modal-buttons"
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <button
              className="homepage-btn-primary"
              onClick={() => {
                setShowAiModal(false);
                navigate("/login");
              }}
              style={{
                backgroundColor: "#5B2EFF",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>Login Now</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="homepage-btn-secondary"
              onClick={() => setShowAiModal(false)}
              style={{
                backgroundColor: "#fff",
                color: "#5B2EFF",
                border: "2px solid #5B2EFF",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Personalize Login Modal Component
  const PersonalizeLoginModal = () => (
    <>
      {modalAnimationStyles}
      <div
        className="homepage-login-modal modal-fade-in"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "1rem",
        }}
      >
        <div
          className="homepage-modal-content"
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "2rem",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            position: "relative",
          }}
        >
          <button
            className="homepage-modal-close"
            onClick={() => setShowPersonalizeModal(false)}
            aria-label="Close modal"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={24} />
          </button>

          <div
            className="homepage-modal-header"
            style={{ textAlign: "center", marginBottom: "1rem" }}
          >
            <div
              className="homepage-modal-icon"
              style={{ marginBottom: "0.5rem" }}
            >
              <Heart
                className="heart-icon"
                size={32}
                style={{ color: "#E63946" }}
              />
            </div>
            <h2>Personalize Your Wall Art<br />FOR FREE !</h2>
          </div>

          <div
            className="homepage-modal-body"
            style={{ textAlign: "center", marginBottom: "1.5rem" }}
          >
            <p>
              Bring your own inspiration or memories and let our experts create a unique wall art piece just for you.
            </p>
            <ul
              className="homepage-modal-features"
              style={{ listStyle: "none", padding: 0 }}
            >
              <li
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Heart size={16} style={{ color: "#E63946" }} />
                <span>Craft personalized designs</span>
              </li>
              <li
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Heart size={16} style={{ color: "#E63946" }} />
                <span>Access custom art styles</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Heart size={16} style={{ color: "#E63946" }} />
                <span>Save your unique creation</span>
              </li>
            </ul>
          </div>

          <div
            className="homepage-modal-buttons"
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <button
              className="homepage-btn-primary"
              onClick={() => {
                setShowPersonalizeModal(false);
                navigate("/login");
              }}
              style={{
                backgroundColor: "#E63946",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>Login Now</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="homepage-btn-secondary"
              onClick={() => setShowPersonalizeModal(false)}
              style={{
                backgroundColor: "#fff",
                color: "#E63946",
                border: "2px solid #E63946",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </>
  );

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

      {showAiModal && <AiLoginModal />}
      {showPersonalizeModal && <PersonalizeLoginModal />}

      <section className="homepage-banner-slider-section">
        <BannerSlider BannerImages={bannerImages} isLoggedIn={isLoggedIn} />
      </section>

      <section className="homepage-products-section py-5">
        <div className="container">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "recently-added" ? "active" : ""
                }`}
                onClick={() => setActiveTab("recently-added")}
              >
                New In
              </button>
            </li>
          </ul>

          <div className="tab-content">
            <div className="tab-pane fade show active">
              <RecentlyAddedProducts />
            </div>
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
        <img
          src={CreateYourWallArt}
          alt="Create-Your-Wall-Art"
          className="background-image"
        />
        <div className="image-frame">
          <img
            src={createyouwallartframehome}
            alt="create-your-wall-art-frame-home"
          />
        </div>
        <div className="overlay-content">
          <h2>Turn Your Favorite Moments into Wall Art</h2>
          <button className="btn btn-primary" onClick={handlePersonalizeClick}>
            Create Your Wall Art
          </button>
        </div>
      </section>

      <section className="homepage-Ai-creation mt-5">
        <ImageContentComponent
          image={AiCreationHome}
          heading="AI-Powered Art Creation"
          description="Discover the art of personalization with our AI-powered design tool. Whether you're looking for the perfect frame or canvas, our intelligent system helps you craft a masterpiece that complements your style and space effortlessly. Choose from a variety of sizes, materials, and finishes to bring your vision to life—all in just a few clicks!"
          ctaText="Create with AI"
          ctaLink="/Ai Creation"
          onClick={handleAiCreationClick}
          openInPopup={true}
          reverse="yes"
        />
      </section>

      <section className="homepage-live-preview">
        <ImageContentComponent
          image={LivePreviewHome}
          heading="See the Perfect Fit Before You Commit"
          description="No more guessing if that piece of art will look good in your room. Upload a photo of your wall, select your favorite frame, and see how the art transforms your space. It's the simplest way to ensure your new piece fits perfectly in your home, office, or business."
          ctaText="Coming Soon !"
          ctaLink="#"
        />
      </section>
    </div>
  );
};

export default HomePage;
