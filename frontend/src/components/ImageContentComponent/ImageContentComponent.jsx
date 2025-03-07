import React from "react";
import { NavLink } from "react-router-dom";
import "./ImageContentComponent.css";

const ImageContentComponent = ({
  image,
  heading,
  description,
  ctaText,
  ctaLink,
  reverse,
  openInPopup,
  onClick, // expecting a function from parent
}) => {
  return (
    <div className={`image-content-component ${reverse ? "reverse" : ""}`}>
      <div className="row">
        {reverse ? (
          <>
            <div className="col-md-6">
              <div className="content">
                <h2 className="heading">{heading}</h2>
                <p className="description">{description}</p>
                {openInPopup ? (
                  <button onClick={(e) => { e.preventDefault(); onClick(e); }} className="cta-button">
                    {ctaText}
                  </button>
                ) : (
                  <NavLink to={ctaLink} className="cta-button">
                    {ctaText}
                  </NavLink>
                )}
              </div>
            </div>
            <div className="col-md-6 sec-image">
              <img src={image} alt={heading} className="image" />
            </div>
          </>
        ) : (
          <>
            <div className="col-md-6 sec-image">
              <img src={image} alt={heading} className="image" />
            </div>
            <div className="col-md-6">
              <div className="content">
                <h2 className="heading">{heading}</h2>
                <p className="description">{description}</p>
                {openInPopup ? (
                  <button onClick={(e) => { e.preventDefault(); onClick(e); }} className="cta-button">
                    {ctaText}
                  </button>
                ) : (
                  <NavLink to={ctaLink} className="cta-button">
                    {ctaText}
                  </NavLink>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageContentComponent;
