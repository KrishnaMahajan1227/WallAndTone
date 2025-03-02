import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
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
import Footer from '../Footer/Footer';

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
  </>
);

const ProductionContent = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 }); // ✅ Define `isMobile`

  return (
    <section className="aboutus-production">
      <div className="aboutus-container">
        <div className="aboutus-production-content">

          {/* Precision, Quality, and Craftsmanship */}
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
              reverse="yes" // ✅ Fix reverse logic

            />
          </div>

          {/* Frames That Define Spaces */}
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

          {/* Paper Matters */}
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
              reverse={!isMobile ? "yes" : undefined} // ✅ Remove reverse on mobile
            />
          </div>

          {/* Impact Image Section */}
          <div className="aboutus-impact-image-container">
            <div className="aboutus-impact-content">
              <h2>In-House Production for Premium Wall-Art</h2>
              <p>Crafting Every Piece with Precision, Quality and Expertise</p>
            </div>
            <img 
              src={InHouseProduction}
              alt="Happy children learning"
              className="aboutus-impact-image"
            />
          </div>

          {/* In-House Printing */}
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
              reverse={!isMobile ? "yes" : undefined} // ✅ Remove reverse on mobile
            />
          </div>

          {/* Made in India */}
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

      
    </div>
  );
}

export default AboutUs;