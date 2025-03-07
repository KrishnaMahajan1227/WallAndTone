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
            <li><NavLink to="/Shipping&Delivery">Shipping & Delivery</NavLink></li>
            <li><NavLink to="/Return&Exchange">Return & Exchange</NavLink></li>
            <li><NavLink to="/about">About Us</NavLink></li>
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
                <p>Near BPCL, Jalgaon, 425001,</p> Maharashtra
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
            <a href="https://in.pinterest.com/wallandtone/?actingBusinessId=905997787446127979" className="pintrest-logo Scoial-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><g fill="none" stroke="#D9D9D9" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M8 14.5c-3-4.5 1.462-8 4.5-8S18 8.154 18 12c0 3.038-2 5-4 5s-3-2-2.5-5m.5-2L9 21.5"/><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10"/></g></svg>            </a>
            <a href="https://wa.me/message/57FQ46OW6LSKI1" className="pintrest-logo Scoial-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24"><g fill="#2F231F" stroke="#D9D9D9" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" color="#D9D9D9"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12c0 1.379.28 2.693.784 3.888c.279.66.418.99.436 1.24c.017.25-.057.524-.204 1.073L2 22l3.799-1.016c.549-.147.823-.22 1.073-.204c.25.018.58.157 1.24.436A10 10 0 0 0 12 22"/><path d="M12.882 12C14.052 12 15 13.007 15 14.25s-.948 2.25-2.118 2.25h-2.47c-.666 0-.998 0-1.205-.203S9 15.768 9 15.115V12m3.882 0C14.052 12 15 10.993 15 9.75s-.948-2.25-2.118-2.25h-2.47c-.666 0-.998 0-1.205.203S9 8.232 9 8.885V12m3.882 0H9"/></g></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;