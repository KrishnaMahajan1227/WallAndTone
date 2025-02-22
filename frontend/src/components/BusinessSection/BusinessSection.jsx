import React from 'react';
import { Mail, Apple as WhatsApp, MessageSquare } from 'lucide-react';
import './BusinessSection.css';
import mailiconblack from '../../assets/icons/mail-icon-black.png';
import messageiconblack from '../../assets/icons/message-icon-black.png';
import whatsappiconblack from '../../assets/icons/whatsapp-icon-black.png';
import ForBusinessbanner from '../../assets/forBusiness/For-Business-banner.png';
import ForBusinessemail from '../../assets/forBusiness/For-Business-email.png';
import ForBusinessshortlist from '../../assets/forBusiness/For-Business-shortlist.png';
import ForBusinesswhatsappreach from '../../assets/forBusiness/For-Business-whatsapp-reach.png';

const BusinessSection = () => {
  return (
    <div className="business-section">
      <div className="business-hero">
        <div className="business-content">
          <h1>Custom Wall Art for Businesses.</h1>
          <p>We Deliver Wall Art Solutions for Businesses That Require Wall Frames to Add Art to Their Space.</p>
          <button className="try-now">Try Now</button>
        </div>
      </div>

      <div className="business-info">
        <p className="business-description">
          If you're an interior designer, architect, restaurant chain, commercial builder, hospitality venue, space designer, art designer, or any business that needs wall frames, we've got special pricing just for you.
        </p>
        
        <p className="business-approach">
          We don't just sell art—we help you create the perfect ambiance. Whether it's a sleek office, a cozy café, a stylish restaurant, a luxurious hotel, or a buzzing co-working hub, we work with you to curate wall art that fits your brand, enhances the ambiance, and leaves a lasting impression.
        </p>

        <p className="business-statement">
          From modern statement pieces to classic masterpieces, our customized art solutions ensure your walls tell the right story. Let's make your space stand out!
        </p>

        <div className="contact-section">
          <h3>Follow the the steps below to unlock the best discounts on your bulk order.</h3>

          <div className="contact-methods">
            <div className="contact-method">
              <div className="contact-method-icon">
              <img src={mailiconblack} alt="mail-icon-black" />
              </div>
              <div className="contact-method-text">
                <p>Reach out to us using the chat bubble at the bottom of your screen.</p>
              </div>
              <div className="contact-method-samples">
                <img src={ForBusinessshortlist} alt="For-Business-shortlist" />
              </div>
              <h4 className="contact-method-title">Shortlist your desired prints</h4>
              <p className="contact-method-description">
                Navigate through our catalog (presently only on wallandtone.com) and select the prints you would like for your upcoming project.
              </p>
            </div>

            <div className="contact-method">
              <div className="contact-method-icon">
              <img src={whatsappiconblack} alt="whatsapp-icon-black" />
              </div>
              <div className="contact-method-text">
                <p>Reach out to us on Whatsapp at +91-9226735394</p>
              </div>
              <div className="contact-method-illustration">
                <img src={ForBusinesswhatsappreach} alt="For-Business-whatsapp-reach" />
              </div>
              <h4 className="contact-method-title">Reach out to us</h4>
              <p className="contact-method-description">
                Once you have selected your prints (wish-list / cart) send us a screenshot of the same via whatsapp or using the contact form.
              </p>
            </div>

            <div className="contact-method">
              <div className="contact-method-icon">
              <img src={messageiconblack} alt="message-icon-black" />
              </div>
              <div className="contact-method-text">
                <p>Send us an Email at hello@wallantone.com</p>
              </div>
              <div className="contact-method-illustration">
              <img src={ForBusinessemail} alt="For-Business-email" />
              </div>
              <h4 className="contact-method-title">Leave the rest to us</h4>
              <p className="contact-method-description">
                Once we have received all the prints that you like, the team will go through the same and provide the best discount for you.
              </p>
            </div>
          </div>

          <form className="contact-form">
            <h3>Please reach out to us.</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  placeholder="Enter Full Name" 
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input 
                  type="text" 
                  placeholder="Enter Company Name" 
                />
              </div>

              <div className="form-group">
                <label>What type of business are you?</label>
                <select>
                  <option value="">Select Type</option>
                  <option value="interior">Interior Designer</option>
                  <option value="architect">Architect</option>
                  <option value="restaurant">Restaurant Chain</option>
                  <option value="hotel">Hotel</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label>How can we help you?</label>
              <textarea 
                placeholder="Enter Requirements"
                rows="4"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="Enter Email" 
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="Enter Number" 
                />
              </div>

              <div className="form-group">
                <label>Upload Screenshot</label>
                <input 
                  type="text"
                  placeholder="Enter Screenshot of your cart"
                  readOnly
                  onClick={() => document.getElementById('fileInput').click()}
                />
                <input 
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  style={{ display: 'none' }}
                  multiple
                />
              </div>
            </div>

            <button type="submit" className="submit-btn">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessSection;