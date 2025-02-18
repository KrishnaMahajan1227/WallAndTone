import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import aboutturningcanvases from '../../assets/about/About-Turning-Canvases.png';
import AboutDiscoverCollection from '../../assets/about/About-Discover-Collection.png';
import Empoweringchange from '../../assets/about/Empowering-change.png';

import './AboutUs.css';


const AboutContent = () => (
  <>
    <section className="aboutus-hero">
      <div className="aboutus-container">
        <div className="abt-sec1-content">
            <div className="content">
            <h2>Turning Walls Into Canvases</h2>
        {/* <p className="aboutus-hero-text">
        At Wall & Tone, we believe in the power of art to transform spaces and evoke emotions. 
        Our mission is to offer art that speaks to you—pieces that inspire, uplift, and make a statement. Born from a legacy of artists, and with a focus on craftsmanship, quality, and innovative designs, we ensure every piece is not just a decoration, but a piece of emotion, history, and personal connection.
        </p> */}
        <p className="aboutus-hero-subtext">
        At Wall & Tone, we believe in the power of art to transform spaces and evoke emotions. 
        Our mission is to offer art that speaks to you—pieces that inspire, uplift, and make a statement. Born from a legacy of artists, and with a focus on craftsmanship, quality, and innovative designs, we ensure every piece is not just a decoration, but a piece of emotion, history, and personal connection.
        </p>
        <button className="aboutus-primary-button">Explore Collection</button>
            </div>
            <div className="img-sec">
                <img src={aboutturningcanvases} alt="about-turning-canvases" />
            </div>
        </div>
      </div>
    </section>

    <section className="aboutus-collection-section">
      <div className="aboutus-container">
        <div className="aboutus-collection-grid">
          <div className="aboutus-collection-image">
            <img 
              src={AboutDiscoverCollection} 
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
                <li>Create your Own wall art using AI</li>
                <li>Bring your own inspiration/memories and we create it for you</li>
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
  </>
);

const ProductionContent = () => (
  <section className="aboutus-production">
    <div className="aboutus-container">
      <div className="aboutus-production-content">
        <h1>Our Production Process</h1>
        <div className="aboutus-production-grid">
          <div className="aboutus-production-text">
            <h2>Crafting Excellence in Every Print</h2>
            <p className="aboutus-production-intro">
              Our production process combines cutting-edge technology with traditional craftsmanship to ensure every piece meets our exacting standards.
            </p>
            
            <div className="aboutus-process-steps">
              <div className="aboutus-process-step">
                <h3>1. Digital Mastering</h3>
                <p>Each artwork undergoes precise digital optimization to ensure perfect color accuracy and detail preservation.</p>
              </div>
              
              <div className="aboutus-process-step">
                <h3>2. Premium Materials</h3>
                <p>We use museum-grade papers and archival inks that guarantee your art will remain vibrant for generations.</p>
              </div>
              
              <div className="aboutus-process-step">
                <h3>3. Quality Control</h3>
                <p>Every print is individually inspected to meet our rigorous quality standards before being carefully packaged.</p>
              </div>
            </div>
          </div>
          <div className="aboutus-production-image">
            <img 
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" 
              alt="Production process showcase"
              className="aboutus-gallery-image"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

function AboutUs() {
  return (
    <div className="aboutus-page">
      <div className="aboutus-tabs-container">
        <div className="aboutus-tabs">
          <NavLink 
            to="/aboutus/about"
            className={({ isActive }) => 
              `aboutus-tab-button ${isActive ? 'active' : ''}`
            }
          >
            About Us
          </NavLink>
          <div className="aboutus-tab-divider"></div>
          <NavLink 
            to="/aboutus/production"
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
              src={Empoweringchange}
              alt="Happy children learning"
              className="aboutus-impact-image"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;