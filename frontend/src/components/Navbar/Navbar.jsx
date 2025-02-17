import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';
import whiteLogo from '../../assets/logo/wall-n-tone-white.png';

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Update navigation history when user clicks on a link
  const handleNavigation = (path, name) => {
    const currentHistory = JSON.parse(localStorage.getItem('navHistory') || '[]');
    const newHistory = [
      { path, name },
      ...currentHistory.filter(item => item.path !== path)
    ].slice(0, 3);
    localStorage.setItem('navHistory', JSON.stringify(newHistory));
  };

  // Navbar links for regular users
  const userLinks = (
    <>
      <li className="nav-item">
        <Link 
          to="/search" 
          className="nav-link"
          onClick={() => handleNavigation('search', 'Search')}
        >
          Search
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/products" 
          className="nav-link"
          onClick={() => handleNavigation('products', 'Products')}
        >
          Products
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/about" 
          className="nav-link"
          onClick={() => handleNavigation('about', 'About Us')}
        >
          About Us
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/contact" 
          className="nav-link"
          onClick={() => handleNavigation('contact', 'Contact')}
        >
          Contact
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/FreepikGenerator" 
          className="nav-link"
          onClick={() => handleNavigation('FreepikGenerator', 'Freepik Generator')}
        >
          FreepikGenerator
        </Link>
      </li>
    </>
  );

  // Navbar links for superadmin
  const superAdminLinks = (
    <>
      <li className="nav-item">
        <Link 
          to="/dashboard" 
          className="nav-link"
          onClick={() => handleNavigation('dashboard', 'Dashboard')}
        >
          Dashboard
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/users" 
          className="nav-link"
          onClick={() => handleNavigation('users', 'Manage Users')}
        >
          Manage Users
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/dashboard/manageProducts" 
          className="nav-link"
          onClick={() => handleNavigation('dashboard/manageProducts', 'Manage Products')}
        >
          Products
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/dashboard/FrameTypeManagement" 
          className="nav-link"
          onClick={() => handleNavigation('dashboard/FrameTypeManagement', 'Frame Types')}
        >
          FrameTypeManagement
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/reports" 
          className="nav-link"
          onClick={() => handleNavigation('reports', 'Reports')}
        >
          Reports
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/dashboard/CouponAdmin" 
          className="nav-link"
          onClick={() => handleNavigation('dashboard/CouponAdmin', 'Coupons')}
        >
          Coupons
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/dashboard/SizesAdmin" 
          className="nav-link"
          onClick={() => handleNavigation('dashboard/SizesAdmin', 'Sizes')}
        >
          Sizes
        </Link>
      </li>
    </>
  );

  return (
    <nav className="main-navbar navbar-expand-lg navbar-dark sticky-top">
      <div className="navbar-container container-fluid flex-column p-0">
        <a 
          href="/" 
          className="navbar-brand logo-container d-flex align-items-center"
          onClick={() => handleNavigation('', 'Home')}
        >
          <img src={whiteLogo} alt="Logo" className="logo" />
        </a>
    
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarSupportedContent" 
          aria-controls="navbarSupportedContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
    
        <div className="collapse navbar-collapse links-container flex-column align-items-center" id="navbarSupportedContent">
          <ul className="navbar-nav links-list w-100">
            {user && user.role === 'superadmin' ? superAdminLinks : userLinks}
          </ul>
    
          <div className="user-info-container mt-auto">
            {user ? (
              <div className="user-info d-flex align-items-center flex-column align-items-lg-center justify-content-center">
                <p
                  className="user-name text-white text-capitalize clickable"
                  onClick={() => {
                    handleNavigation('profile', 'Profile');
                    navigate('/profile');
                  }}
                >
                  {user.firstName}
                </p>
                <button className="logout-btn btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="login-container w-100 text-center">
                <Link 
                  to="/login" 
                  className="login-btn btn btn-primary"
                  onClick={() => handleNavigation('login', 'Login')}
                >
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