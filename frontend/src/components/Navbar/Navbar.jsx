import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext'; // Import UserContext
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';
import whiteLogo from '../../assets/logo/wall-n-tone-white.png';

const Navbar = () => {
  const { user, logout } = useContext(UserContext); // Access user and logout from context
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    logout(); // Call the logout function from context
    navigate('/'); // Redirect to the home page after logout
  };

  // Navbar links for regular users
  const userLinks = (
    <>
      <li className="nav-item">
        <Link to="/search" className="nav-link">Search</Link>
      </li>
      <li className="nav-item">
        <Link to="/products" className="nav-link">Products</Link>
      </li>
      <li className="nav-item">
        <Link to="/about" className="nav-link">About Us</Link>
      </li>
      <li className="nav-item">
        <Link to="/contact" className="nav-link">Contact</Link>
      </li>
      <li className="nav-item">
        <Link to="/FreepikGenerator" className="nav-link">FreepikGenerator</Link>
      </li>
    </>
  );

  // Navbar links for superadmin
  const superAdminLinks = (
    <>
      <li className="nav-item">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
      </li>
      <li className="nav-item">
        <Link to="/users" className="nav-link">Manage Users</Link>
      </li>
      <li className="nav-item">
        <Link to="/dashboard/manageProducts" className="nav-link">Products</Link>
      </li>
      <li className="nav-item">
        <Link to="/dashboard/FrameTypeManagement" className="nav-link">FrameTypeManagement</Link>
      </li>
      <li className="nav-item">
        <Link to="/reports" className="nav-link">Reports</Link>
      </li>
      <li className="nav-item">
        <Link to="/dashboard/CouponAdmin" className="nav-link">Coupons</Link>
      </li>
      <li className="nav-item">
        <Link to="/dashboard/SizesAdmin" className="nav-link">Sizes</Link>
      </li>
    </>
  );

  return (
    <nav className="main-navbar navbar-expand-lg navbar-dark sticky-top">
      <div className="navbar-container container-fluid flex-column p-0">
        {/* Logo */}
        <a href="/" className="navbar-brand logo-container d-flex align-items-center">
          <img src={whiteLogo} alt="Logo" className="logo" />
        </a>
    
        {/* Collapsible button */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
    
        {/* Navbar links */}
        <div className="collapse navbar-collapse links-container flex-column align-items-center" id="navbarSupportedContent">
          <ul className="navbar-nav links-list w-100">
            {/* Conditionally render links based on user role */}
            {user && user.role === 'superadmin' ? superAdminLinks : userLinks}
          </ul>
    
          {/* User info and Logout */}
          <div className="user-info-container mt-auto">
            {user ? (
              <div className="user-info d-flex align-items-center flex-column align-items-lg-center justify-content-center">
                <p
                  className="user-name text-white text-capitalize clickable"
                  onClick={() => navigate('/profile')}
                >
                  {user.firstName}
                </p>
                <button className="logout-btn btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="login-container w-100 text-center">
                <Link to="/login" className="login-btn btn btn-primary">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;