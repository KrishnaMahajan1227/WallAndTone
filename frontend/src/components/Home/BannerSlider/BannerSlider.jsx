import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./BannerSlider.css";

const BannerSlider = ({ BannerImages }) => {
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
                <h2 className="slider-heading">{image.heading}</h2>
                <p className="slider-subheading">{image.subheading}</p>
                <div className="cta-buttons">
                  <a href={image.ctaLink1} className="cta-button">{image.ctaText1}</a>
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