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
            {/* <li><a href="/orders">Orders</a></li> */}
            <li><NavLink to="/Shipping&Delivery">Shipping & Delivery</NavLink></li>
            <li><NavLink to="/Return&Exchange">Return & Exchange</NavLink></li>
            <li><NavLink to="/about us/">About Us</NavLink></li>
            <li><NavLink to="/FAQ">FAQ</NavLink></li>
            </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Contact Us</h3> 
          <ul className="footer-links">
            <li>
              <a href="tel:+1234567890">+91-9226 735 394</a>
            </li>
            <li>
              <a href="mailto:contact@example.com">hello@wallandtone.com</a>
            </li>
            <li>
              <address><p>Pl.No 18, 19, 20, First Floor, </p>
                <p>Near BPCL, MIDC, Jalgaon, 425001,</p> Maharashtra
                 </address>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Notice</h3>
          <ul className="footer-links">
            <li><NavLink to="/Privacy&Policy">Privacy Policy</NavLink></li>
            <li><NavLink to="/Terms&Conditions">Terms & Conditions</NavLink></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Social</h3>
          <div className="social-links">
            <a href="https://www.instagram.com/wallandtone?igsh=MW5hZzB0andydnpzNQ==" target="_blank" rel="noopener noreferrer" className="social-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 16 16"><path fill="#D9D9D9" d="M8 1c-1.35 0-2.33.016-2.92.047a6 6 0 0 0-1.55.266a3.66 3.66 0 0 0-2.22 2.22a6 6 0 0 0-.266 1.55c-.031.594-.047 1.57-.047 2.92s.016 2.33.047 2.92c.019.525.108 1.05.266 1.55c.182.511.475.976.86 1.36c.38.382.846.666 1.36.828c.497.178 1.02.278 1.55.296c.594.031 1.57.047 2.92.047s2.33-.016 2.92-.047a6 6 0 0 0 1.55-.266a3.67 3.67 0 0 0 2.22-2.22q.236-.754.266-1.55c.031-.594.047-1.57.047-2.92s-.01-2.32-.031-2.91a6.3 6.3 0 0 0-.282-1.56a3.66 3.66 0 0 0-2.219-2.22a6 6 0 0 0-1.55-.266q-.893-.047-2.92-.047zm-.5 12.8q-1.25 0-1.94-.031a6.6 6.6 0 0 1-1.69-.25a2.38 2.38 0 0 1-1.344-1.344a6.6 6.6 0 0 1-.25-1.69c-.021-.458-.031-1.1-.031-1.94v-1q0-1.25.031-1.94c.006-.571.09-1.14.25-1.69a2.26 2.26 0 0 1 1.343-1.343a6.6 6.6 0 0 1 1.69-.25c.458-.021 1.1-.031 1.94-.031h1q1.25 0 1.94.031c.571.006 1.14.09 1.69.25a2.26 2.26 0 0 1 1.344 1.343c.16.549.244 1.12.25 1.69c.02.438.031 1.08.031 1.94v1q0 1.25-.031 1.94a6.6 6.6 0 0 1-.25 1.69a2.38 2.38 0 0 1-1.344 1.344c-.548.16-1.12.244-1.69.25c-.437.02-1.08.031-1.94.031zm4.25-10.4a.87.87 0 0 0-.616 1.49a.85.85 0 0 0 .944.195a.8.8 0 0 0 .272-.195c.16-.168.256-.385.275-.616a.89.89 0 0 0-.875-.875zM8 4.52a3.4 3.4 0 0 0-1.75.472c-.53.307-.971.748-1.28 1.28a3.5 3.5 0 0 0 0 3.5A3.52 3.52 0 0 0 8 11.524a3.515 3.515 0 0 0 3.502-3.502c0-.61-.163-1.22-.472-1.75a3.5 3.5 0 0 0-1.28-1.28A3.4 3.4 0 0 0 8 4.52m0 5.75a2.25 2.25 0 0 1 0-4.5a2.25 2.25 0 0 1 0 4.5"/></svg>
            </a>
            <a href="https://in.pinterest.com/wallandtone/?actingBusinessId=905997787446127979" className="pintrest-logo Scoial-logo" target="_blank" >
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><g fill="none" stroke="#D9D9D9" stroke-linecap="round" stroke-linejoin ="round" stroke-width="1.5"><path d="M8 14.5c-3-4.5 1.462-8 4.5-8S18 8.154 18 12c0 3.038-2 5-4 5s-3-2-2.5-5m.5-2L9 21.5"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10"/></g></svg>            </a>
            <a href="https://wa.me/message/57FQ46OW6LSKI1" className="whatsapp-logo Scoial-logo" target="_blank" >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#D9D9D9" d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"/></svg>            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;