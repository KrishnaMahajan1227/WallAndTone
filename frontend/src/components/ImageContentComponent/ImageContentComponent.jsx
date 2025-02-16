// ImageContentComponent.js
import React, { useState } from 'react';
import './ImageContentComponent.css';

const ImageContentComponent = ({
  image,
  heading,
  description,
  ctaText,
  ctaLink,
  reverse,
  openInPopup,
  popupComponent,
}) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleCTAClick = (e) => {
    if (openInPopup) {
      e.preventDefault();
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className={`image-content-component ${reverse ? 'reverse' : ''}`}>
      <div className="row">
        {reverse ? (
          <div className="col-md-6">
            <div className="content">
              <h2 className="heading">{heading}</h2>
              <p className="description">{description}</p>
              {openInPopup ? (
                <button onClick={handleCTAClick} className="cta-button">
                  {ctaText}
                </button>
              ) : (
                <a href={ctaLink} className="cta-button">
                  {ctaText}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="col-md-6">
            <img src={image} alt={heading} className="image" />
          </div>
        )}
        {reverse ? (
          <div className="col-md-6">
            <img src={image} alt={heading} className="image" />
          </div>
        ) : (
          <div className="col-md-6">
            <div className="content">
              <h2 className="heading">{heading}</h2>
              <p className="description">{description}</p>
              {openInPopup ? (
                <button onClick={handleCTAClick} className="cta-button">
                  {ctaText}
                </button>
              ) : (
                <a href={ctaLink} className="cta-button">
                  {ctaText}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}>
              &times;
            </span>
            {popupComponent}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageContentComponent;