import React from 'react';
import Slider from 'react-slick';
import { Link, useNavigate } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./BannerSlider.css";

const BannerSlider = ({ BannerImages, isLoggedIn }) => {
  const navigate = useNavigate();
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
    cssEase: "linear",
    arrows: false,
    appendDots: (dots) => (
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <ul>{dots}</ul>
      </div>
    ),
  };

  return (
    <div className="banner-slider-container">
      <Slider {...settings}>
        {BannerImages.map((image, index) => (
          <div key={index} className="slider-item">
            <img src={image.src} alt={image.alt} className="slider-image" />
            <div className="slider-cta-container">
              <div className="slider-content">
                {image.caption && (
                  <p className="slider-caption">{image.caption}</p>
                )}
                <h2 className="slider-heading">{image.heading}</h2>
                <p className="slider-subheading">{image.subheading}</p>
                <div className="cta-buttons" aria-hidden="true">
                  {image.onClick ? (
                    // If onClick exists, render a button that calls the provided handler.
                    <button
                      className="cta-button"
                      onClick={(e) => {
                        e.preventDefault();
                        image.onClick(e);
                      }}
                    >
                      {image.ctaText1}
                    </button>
                  ) : (
                    // Otherwise render a Link with normal navigation.
                    <Link to={image.ctaLink1} className="cta-button">
                      {image.ctaText1}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default BannerSlider;
