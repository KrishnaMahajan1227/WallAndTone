import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import './BusinessSection.css';
import mailiconblack from '../../assets/icons/mail-icon-black.png';
import messageiconblack from '../../assets/icons/message-icon-black.png';
import whatsappiconblack from '../../assets/icons/whatsapp-icon-black.png';
import ForBusinessbanner from '../../assets/forBusiness/For-Business-banner.png';
import ForBusinessemail from '../../assets/forBusiness/For-Business-email.png';
import ForBusinessshortlist from '../../assets/forBusiness/For-Business-shortlist.png';
import ForBusinesswhatsappreach from '../../assets/forBusiness/For-Business-whatsapp-reach.png';
import Footer from '../Footer/Footer';

const BusinessSection = () => {
  const [showThankYou, setShowThankYou] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef();
  const fileInputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target);
      const file = fileInputRef.current.files[0];

      const templateParams = {
        from_name: formData.get('name'),
        company_name: formData.get('companyName'),
        business_type: formData.get('businessType'),
        requirements: formData.get('requirements'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        screenshots: file ? `Screenshot: ${file.name}` : 'No screenshots',
      };

      await emailjs.send(
        'service_iafvbdi',  // Your EmailJS service ID
        'template_7hjkgfk', // Your EmailJS template ID
        templateParams,
        '5sscvhVAwptcmyQnp'  // Your EmailJS public key
      );

      setShowThankYou(true);
      e.target.reset();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error sending email:', error);
      alert('There was an error sending your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ThankYouModal = () => (
    <div className="thank-you-modal">
      <div className="thank-you-content">
        <button 
          className="close-button"
          onClick={() => setShowThankYou(false)}
          aria-label="Close modal"
        >
          <span>&times;</span>
        </button>
        
        <div className="success-icon">✓</div>
        
        <h2>Thank You!</h2>
        <p>We've received your business inquiry and will get back to you shortly.</p>
        
        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>Our team will review your requirements</li>
            <li>We'll prepare a custom quote for your project</li>
            <li>Expect a response within 24-48 business hours</li>
          </ul>
        </div>
        
        <button 
          className="close-modal-button"
          onClick={() => setShowThankYou(false)}
        >
          Continue Browsing
        </button>
      </div>
    </div>
  );

  return (
    <div className="business-section">
      {showThankYou && <ThankYouModal />}
      
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
          <h3>Follow the steps below to unlock the best discounts on your bulk order.</h3>

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

          <form ref={formRef} onSubmit={handleSubmit} className="contact-form">
            <h3>Please reach out to us.</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Enter Full Name"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input 
                  type="text" 
                  name="companyName"
                  placeholder="Enter Company Name"
                  required 
                />
              </div>

              <div className="form-group">
                <label>What type of business are you?</label>
                <select
                  name="businessType"
                  required
                >
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
                name="requirements"
                placeholder="Enter Requirements"
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Enter Email"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  placeholder="Enter Number"
                  required 
                />
              </div>

              <div className="form-group">
                <label>Upload Screenshot</label>
                <input 
                  type="text"
                  placeholder="Enter Screenshot of your cart"
                  readOnly
                  onClick={() => fileInputRef.current.click()}
                />
                <input 
                  ref={fileInputRef}
                  type="file"
                  name="screenshots"
                  accept="image/*"
                  style={{ display: 'none' }}
                  multiple
                  onChange={(e) => {
                    const fileNames = Array.from(e.target.files || [])
                      .map(file => file.name)
                      .join(', ');
                    e.target.previousSibling.value = fileNames || 'Enter Screenshot of your cart';
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
};

export default BusinessSection;