import React from 'react';
import { Instagram } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-heading">Customer Service</h3>
          <ul className="footer-links">
            <li><a href="/track-order">Track Your Order</a></li>
            <li><a href="/orders">Orders</a></li>
            <li><a href="/shipping">Shipping & Delivery</a></li>
            <li><a href="/returns">Returns & Exchange</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Contact Us</h3>
          <ul className="footer-links">
            <li>
              <span className="footer-label">Phone:</span>
              <a href="tel:+1234567890">+91-9226 735 394</a>
            </li>
            <li>
              <span className="footer-label">Email:</span>
              <a href="mailto:contact@example.com">hello@wallandtone.com</a>
            </li>
            <li>
              <span className="footer-label">Address:</span>
              <address>Shopno 13</address>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Notice</h3>
          <ul className="footer-links">
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms & Condition</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Social</h3>
          <div className="social-links">
            <a href="https://www.instagram.com/wallandtone?igsh=MW5hZzB0andydnpzNQ==" target="_blank" rel="noopener noreferrer" className="social-link">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;