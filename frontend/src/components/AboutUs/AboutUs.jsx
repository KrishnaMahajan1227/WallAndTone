import React, { useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import aboutturningcanvases from '../../assets/about/About-Turning-Canvases.png';
import AboutDiscoverCollection from '../../assets/about/About-Discover-Collection.png';
import Empoweringchange from '../../assets/about/Empowering-change.png';
import { useMediaQuery } from 'react-responsive';

// ProductionImages
import PrecisionQualityCraftsmanship from '../../assets/about/Precision-Quality-Craftsmanship.png';
import MadeInIndia from '../../assets/about/Made-In-India.png';
import InHouseProduction from '../../assets/about/In-House-Production.png';
import PaperMatters from '../../assets/about/Paper-Matters.png';
import InHousePrinting from '../../assets/about/In-House-Printing.png';
import FramesDefineSpaces from '../../assets/about/Frames-Define-Spaces.png';

import './AboutUs.css';
import ImageContentComponent from '../ImageContentComponent/ImageContentComponent';
import { X, Sparkles, Lock, ArrowRight, Heart } from 'lucide-react';

const AboutContent = () => {
  const navigate = useNavigate();
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);

  // Separate functions for each offering
  const handleAiCreationClick = (route) => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate(route);
    } else {
      setShowAiModal(true);
    }
  };

  const handlePersonalizeClick = (route) => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate(route);
    } else {
      setShowPersonalizeModal(true);
    }
  };

  return (
    <>
      {/* Define keyframes for fadeIn animation */}
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

      <section className="aboutus-hero">
        <div className="aboutus-container">
          <div className="abt-sec1-content">
            <div className="content">
              <h2>Turning Walls Into Canvases</h2>
              <p className="aboutus-hero-subtext">
                At Wall & Tone, we believe in the power of art to transform spaces and evoke emotions.
                Our mission is to offer art that speaks to you—pieces that inspire, uplift, and make a statement.
                Born from a legacy of artists, and with a focus on craftsmanship, quality, and innovative designs,
                we ensure every piece is not just a decoration, but a piece of emotion, history, and personal connection.
              </p>
              <button className="aboutus-primary-button">Explore Collection</button>
            </div>
            <div className="img-sec">
              <img src="https://res.cloudinary.com/dxpf8q672/image/upload/v1741849527/About-Turning-Canvases_xsxz2o.png" alt="about-turning-canvases" />
            </div>
          </div>
        </div>
      </section>

      <section className="aboutus-collection-section">
        <div className="aboutus-container">
          <div className="aboutus-collection-grid">
            <div className="aboutus-collection-image">
              <img 
                src="https://res.cloudinary.com/dxpf8q672/image/upload/v1741849528/About-Discover-Collection_ony6az.png" 
                alt="About-Discover-Collection"
                className="aboutus-gallery-image"
              />
            </div>
            <div className="aboutus-collection-text">
              <h2>Discover the Wall & Tone Collection & Offerings</h2>
              <p>
                We've handpicked a diverse mix of wall art to suit every style,
                mood, and space. Whether you're into bold statements or subtle
                elegance, we've got something for you:
              </p>
              
              <div className="aboutus-collections-container">
                <div className="aboutus-collection-list">
                  <h3>Collection:</h3>
                  <ul>
                    <li>Pop Art</li>
                    <li>Monochrome</li>
                    <li>Abstract</li>
                    <li>Architects</li>
                    <li>Chinese Prints</li>
                    <li>European Style</li>
                    <li>Expressionist Art</li>
                  </ul>
                </div>
                <div className="aboutus-collection-list">
                  <h3>Also Featured:</h3>
                  <ul>
                    <li>Sci-Fi</li>
                    <li>Artprints</li>
                    <li>Nature & 3D Illusions</li>
                    <li>Anime & Movie Posters</li>
                    <li>Indian Art</li>
                    <li>Famous World Paintings</li>
                    <li>Japanese Art</li>
                  </ul>
                </div>
              </div>

              <div className="aboutus-offerings">
                <h3>Offerings:</h3>
                <ul>
                  <li>
                    <span 
                      style={{ color: "#5B2EFF", cursor: "pointer" }}
                      onClick={() => handleAiCreationClick('/Ai Creation')}
                    >
                      Create your Own wall art using AI
                    </span>
                  </li>
                  <li>
                    <span 
                      style={{ color: "#5B2EFF", cursor: "pointer" }}
                      onClick={() => handlePersonalizeClick('/Personalize')}
                    >
                      Bring your own inspiration/memories and we create it for you
                    </span>
                  </li>
                </ul>
                <p className="aboutus-offerings-note">
                  Each print comes in your choice of high-quality paper finishes.
                  Including through grade options, gloss, and matte finishes. Pair
                  them with modern, classic, or vintage-style frames to match your
                  vibe.
                </p>
                <p className="aboutus-brand-promise">
                  At Wall & Tone, your walls do the talking—let's make them say
                  something unforgettable!
                </p>
              </div>
              <button className="aboutus-primary-button">Explore Collection</button>
            </div>
          </div>
        </div>
      </section>
      <section className="aboutus-impact-section">
        <div className="aboutus-container">
          <div className="aboutus-impact-image-container">
            <div className="aboutus-impact-content">
              <h2>Empowering change, One wall at a Time</h2>
              <p>
                With every sector you buy, we donate to support children's
                education and welfare through art.org
              </p>
            </div>
            <img 
              src="https://res.cloudinary.com/dxpf8q672/image/upload/v1741849528/Empowering-change_jk9k1m.png"
              alt="Happy children learning"
              className="aboutus-impact-image"
            />
          </div>
        </div>
      </section>

      {/* AI Creation Login Popup */}
      {showAiModal && (
        <div 
          className="aboutus-login-modal modal-fade-in"
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
            padding: "1rem"
          }}
        >
          <div 
            className="aboutus-modal-content"
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              position: "relative"
            }}
          >
            <button 
              className="aboutus-modal-close" 
              onClick={() => setShowAiModal(false)}
              aria-label="Close modal"
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                cursor: "pointer"
              }}
            >
              <X size={24} />
            </button>
            
            <div className="aboutus-modal-header" style={{ textAlign: "center", marginBottom: "1rem" }}>
              <div className="aboutus-modal-icon" style={{ marginBottom: "0.5rem" }}>
                <Sparkles className="sparkle-icon" size={32} style={{ color: "#5B2EFF" }} />
              </div>
              <h2 style={{ margin: 0 }}>Unlock AI Creation Magic!</h2>
              <div className="aboutus-modal-subheader" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "0.5rem", gap: "0.5rem", color: "#555" }}>
                <Lock size={16} />
                <span>Exclusive AI Feature</span>
              </div>
            </div>

            <div className="aboutus-modal-body" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <p>Transform your ideas into stunning wall art using our AI-powered creation tools.</p>
              <ul className="aboutus-modal-features" style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <Sparkles size={16} style={{ color: "#5B2EFF" }} />
                  <span>Create unique, personalized designs</span>
                </li>
                <li style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <Sparkles size={16} style={{ color: "#5B2EFF" }} />
                  <span>Access exclusive AI art styles</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <Sparkles size={16} style={{ color: "#5B2EFF" }} />
                  <span>Save and modify your creations</span>
                </li>
              </ul>
            </div>

            <div className="aboutus-modal-buttons" style={{ display: "flex", justifyContent: "space-around" }}>
              <button 
                className="aboutus-btn-primary" 
                onClick={() => { setShowAiModal(false); navigate('/login'); }}
                style={{
                  backgroundColor: "#5B2EFF",
                  color: "#fff",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <span>Login Now</span>
                <ArrowRight size={16} />
              </button>
              <button 
                className="aboutus-btn-secondary" 
                onClick={() => setShowAiModal(false)}
                style={{
                  backgroundColor: "#fff",
                  color: "#5B2EFF",
                  border: "2px solid #5B2EFF",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personalize Login Popup */}
      {showPersonalizeModal && (
        <div 
          className="aboutus-login-modal modal-fade-in"
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
            padding: "1rem"
          }}
        >
          <div 
            className="aboutus-modal-content"
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              position: "relative"
            }}
          >
            <button 
              className="aboutus-modal-close" 
              onClick={() => setShowPersonalizeModal(false)}
              aria-label="Close modal"
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                cursor: "pointer"
              }}
            >
              <X size={24} />
            </button>
            
            <div className="aboutus-modal-header" style={{ textAlign: "center", marginBottom: "1rem" }}>
              <div className="aboutus-modal-icon" style={{ marginBottom: "0.5rem" }}>
                <Heart className="heart-icon" size={32} style={{ color: "#E63946" }} />
              </div>
              <h2 style={{ margin: 0 }}>Personalize Your Wall Art!</h2>
              <div className="aboutus-modal-subheader" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "0.5rem", gap: "0.5rem", color: "#555" }}>
                <Lock size={16} />
                <span>Exclusive Personalization</span>
              </div>
            </div>

            <div className="aboutus-modal-body" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <p>Bring your own inspiration or memories and let our experts create a unique wall art piece just for you.</p>
              <ul className="aboutus-modal-features" style={{ listStyle: "none", padding: 0 }}>
                <li style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <Heart size={16} style={{ color: "#E63946" }} />
                  <span>Craft personalized designs</span>
                </li>
                <li style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <Heart size={16} style={{ color: "#E63946" }} />
                  <span>Access custom art styles</span>
                </li>
                <li style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <Heart size={16} style={{ color: "#E63946" }} />
                  <span>Save your unique creation</span>
                </li>
              </ul>
            </div>

            <div className="aboutus-modal-buttons" style={{ display: "flex", justifyContent: "space-around" }}>
              <button 
                className="aboutus-btn-primary" 
                onClick={() => { setShowPersonalizeModal(false); navigate('/login'); }}
                style={{
                  backgroundColor: "#E63946",
                  color: "#fff",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <span>Login Now</span>
                <ArrowRight size={16} />
              </button>
              <button 
                className="aboutus-btn-secondary" 
                onClick={() => setShowPersonalizeModal(false)}
                style={{
                  backgroundColor: "#fff",
                  color: "#E63946",
                  border: "2px solid #E63946",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ProductionContent = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <section className="aboutus-production">
      <div className="aboutus-container">
        <div className="aboutus-production-content">
          <div className="aboutus-production-content-Precision">
            <ImageContentComponent
              image={PrecisionQualityCraftsmanship}
              heading="Precision, Quality and Craftsmanship"
              description={
                <>
                  <p>
                    Unlike mass-produced wall art, every frame, print, and material is thoughtfully designed, carefully sourced, and expertly crafted to guarantee an unmatchable quality, innovation, and artistry.
                  </p>
                  <p className="mt-4">
                    We partner with expert manufacturers who blend automated precision with years of craftsmanship, allowing us to perform with best-in-class frames and give room for future innovation. Our printing is done fully in-house, giving us full control over color accuracy, texture, and detail, ensuring that each frame stands for true artistic excellence.
                  </p>
                </>
              }
              reverse="yes"
            />
          </div>
          <div className="aboutus-production-content-Frames-Spaces">
            <ImageContentComponent
              image={FramesDefineSpaces}
              heading="Frames That Define Spaces"
              description={
                <>
                  <p>The frame is not just an edge; the frame is part of the artwork. With a huge inventory of solid wood, sleek metal, and bright neon acrylic frames, we cater to various styles:</p>
                  <ul className="mt-2">
                    <li>- Minimalist black & metal frames for modern interiors.</li>
                    <li>- Warm wooden frames for a timeless and classic feel.</li>
                    <li>- Eye-catching neon acrylics for bold statement pieces.</li>
                  </ul>
                  <p className="mt-4">
                    Each frame receives construction from quality materials and assembly with fastidious attention to enhance your space.
                  </p>
                </>
              }
            />
          </div>
          <div className="aboutus-production-content-Paper-Matters">
            <ImageContentComponent
              image={PaperMatters}
              heading="Paper Matters, for Every Artwork"
              description={
                <>
                  <p>We do not just print; we curate materials that do justice to the artwork. These include:</p>
                  <ul className="mt-2">
                    <li>Museum-Grade Canvas: Textured and stretched for eternal elegance.</li>
                    <li>Glass-Framed Prints: High-density, low-reflection paper for bright displays without glare.</li>
                    <li>No-Glass Frames: High-texture matte paper.</li>
                    <li>Acrylic Wall Art: Ultra-clear acrylic glass with a UV filter for eternal brilliance.</li>
                    <li>Rolled Prints: Available in gloss, matte, and fine art paper for versatility.</li>
                  </ul>
                </>
              }
              reverse={!isMobile ? "yes" : undefined}
            />
          </div>
          <div className="aboutus-impact-image-container">
            <div className="aboutus-impact-content">
              <h2>In-House Production for Premium Wall-Art</h2>
              <p>Crafting Every Piece with Precision, Quality and Expertise</p>
            </div>
            <img 
              src={InHouseProduction}
              alt="In-House Production"
              className="aboutus-impact-image"
            />
          </div>
          <div className="aboutus-production-content-In-House-Printing">
            <ImageContentComponent
              image={InHousePrinting}
              heading="In-House Printing"
              description={
                <>
                  <p>Using state-of-the-art UV and Giclée print technologies, we produce vivid colors, precise details, and enhanced depth. Our in-house printing assures:</p>
                  <ul className="mt-2">
                    <li>✔ Intricacy is maintained, from brush strokes to gradients.</li>
                    <li>✔ Our prints never fade; their glory holds for years to come.</li>
                    <li>✔ Best visibility under all lighting conditions.</li>
                  </ul>
                  <p className="mt-4">
                    We have kept printing in-house to undergo a continuous cycle of experimentation, refinement, and perfection for each artwork—achieving optimum results that surpass general expectations.
                  </p>
                </>
              }
              reverse={!isMobile ? "yes" : undefined}
            />
          </div>
          <div className="aboutus-production-content-Proudly-Made-INDIA">
            <ImageContentComponent
              image={MadeInIndia}
              heading="Proudly Made in INDIA"
              description={
                <>
                  <p>Wall & Tone is a fully homegrown Indian brand, dedicated to creating high-quality wall art and wall frames. Every canvas, poster, and frame is crafted in India by skilled Indian artisans using premium materials. We take pride in our in-house production, supporting local talent, ensuring exceptional craftsmanship.</p>
                  <p className="mt-0">With Wall & Tone, you’re not just decorating your space; you’re celebrating innovation and excellence, proudly Made in India.</p>
                </>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
};

function AboutUs() {
  return (
    <div className="aboutus-page">
      <Helmet>
        <title>About Us | Wall & Tone</title>
        <meta 
          name="description" 
          content="Discover the story behind Wall & Tone—where walls become canvases. Learn about our passion, our production excellence, and our commitment to transforming spaces with art." 
        />
        <meta 
          name="keywords" 
          content="About Us, Wall Art, Canvas, Production, Made in India, Quality Craftsmanship, Wall & Tone, Art Collection" 
        />
        <link rel="canonical" href="https://wallandtone.com/about-us" />
        <meta property="og:title" content="About Us | Wall & Tone" />
        <meta 
          property="og:description" 
          content="Discover the story behind Wall & Tone—where walls become canvases. Our innovative production and quality craftsmanship transform your spaces into art." 
        />
        <meta property="og:image" content={aboutturningcanvases} />
        <meta property="og:url" content="https://wallandtone.com/about-us" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="aboutus-tabs-container">
        <div className="aboutus-tabs">
          <NavLink 
            to="/about us/about"
            className={({ isActive }) => 
              `aboutus-tab-button ${isActive ? 'active' : ''}`
            }
          >
            About Us
          </NavLink>
          <div className="aboutus-tab-divider"></div>
          <NavLink 
            to="/about us/production"
            className={({ isActive }) => 
              `aboutus-tab-button ${isActive ? 'active' : ''}`
            }
          >
            Our Production
          </NavLink>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="about" replace />} />
        <Route path="about" element={<AboutContent />} />
        <Route path="production" element={<ProductionContent />} />
      </Routes>
    </div>
  );
}

export default AboutUs;
