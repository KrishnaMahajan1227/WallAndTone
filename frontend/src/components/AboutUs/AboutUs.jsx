import React, { useState } from 'react';
import './AboutUs.css';

function AboutUs() {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className="aboutus-page">
      <div className="aboutus-tabs-container">
        <div className="aboutus-tabs">
          <button 
            className={`aboutus-tab-button ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About Us
          </button>
          <div className="aboutus-tab-divider"></div>
          <button 
            className={`aboutus-tab-button ${activeTab === 'production' ? 'active' : ''}`}
            onClick={() => setActiveTab('production')}
          >
            Our Production
          </button>
        </div>
      </div>

      <section className="aboutus-hero">
        <div className="aboutus-container">
          <h1>Turning Walls Into Canvases</h1>
          <p className="aboutus-hero-text">
            At Wall & Tone, we believe in the power of art to transform spaces
            and evoke emotions.
          </p>
          <p className="aboutus-hero-subtext">
            Our mission is to offer art that speaks to you—pieces that inspire,
            uplift, and make a statement. Born from a legacy of artists, and
            with a focus on craftsmanship, quality, and innovative designs, we
            bring you a curated collection that embodies our rich artistic
            history and personal connection.
          </p>
          <button className="aboutus-primary-button">Explore Collection</button>
        </div>
      </section>

      <section className="aboutus-collection-section">
        <div className="aboutus-container">
          <div className="aboutus-collection-grid">
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
                <button className="aboutus-primary-button">Explore Collection</button>
              </div>
            </div>
            <div className="aboutus-collection-image">
              <img 
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" 
                alt="Gallery wall with framed artwork"
                className="aboutus-gallery-image"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="aboutus-impact-section">
        <div className="aboutus-container">
          <h2>Empowering change, One wall at a Time</h2>
          <p>
            With every sector you buy, we donate to support children's
            education and welfare through art.org
          </p>
          <img 
            src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Happy children learning"
            className="aboutus-impact-image"
          />
        </div>
      </section>
    </div>
  );
}

export default AboutUs;