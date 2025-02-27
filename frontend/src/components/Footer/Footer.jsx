import React from 'react';
import { Instagram } from 'lucide-react';
import { NavLink } from "react-router-dom";

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
            <li><NavLink to="/FAQ">FAQ</NavLink></li>
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
              <Instagram size={24} />
            </a>
            <a href="https://in.pinterest.com/wallandtone/?actingBusinessId=905997787446127979" className="pintrest-logo Scoial-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="21px" height="24px" viewBox="0 0 448 512"><path fill="#CB1F27" d="M384 32H64C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h72.6l-2.2-.8c-5.4-48.1-3.1-57.5 15.7-134.7c3.9-16 8.5-35 13.9-57.9c0 0-7.3-14.8-7.3-36.5c0-70.7 75.5-78 75.5-25c0 13.5-5.4 31.1-11.2 49.8c-3.3 10.6-6.6 21.5-9.1 32c-5.7 24.5 12.3 44.4 36.4 44.4c43.7 0 77.2-46 77.2-112.4c0-58.8-42.3-99.9-102.6-99.9C153 139 112 191.4 112 245.6c0 21.1 8.2 43.7 18.3 56c2 2.4 2.3 4.5 1.7 7c-1.1 4.7-3.1 12.9-4.7 19.2c-1 4-1.8 7.3-2.1 8.6c-1.1 4.5-3.5 5.5-8.2 3.3c-30.6-14.3-49.8-59.1-49.8-95.1C67.2 167.1 123.4 96 229.4 96c85.2 0 151.4 60.7 151.4 141.8c0 84.6-53.3 152.7-127.4 152.7c-24.9 0-48.3-12.9-56.3-28.2c0 0-12.3 46.9-15.3 58.4c-5 19.3-17.6 42.9-27.4 59.3H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;