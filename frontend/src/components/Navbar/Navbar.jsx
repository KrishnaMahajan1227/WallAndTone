import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { WishlistContext } from '../Wishlist/WishlistContext';
import { X, Sparkles, Lock, ArrowRight } from "lucide-react";
import whiteLogo from '../../assets/logo/wall-n-tone-white.png';
import cartIconUrl from '../../assets/icons/cart-icon.svg';
import heartIconUrl from '../../assets/icons/heart-icon.svg';
import wishlistIconUrl from '../../assets/icons/heart-icon-filled.svg';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { wishlistCount } = useContext(WishlistContext);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsNavOpen(false);
  };

  const handleNavigation = (path, name) => {
    const currentHistory = JSON.parse(localStorage.getItem('navHistory') || '[]');
    const newHistory = [
      { path, name },
      ...currentHistory.filter(item => item.path !== path)
    ].slice(0, 3);
    localStorage.setItem('navHistory', JSON.stringify(newHistory));
    setIsNavOpen(false);
  };

  const handleAiCreationClick = (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    navigate('/AiCreation');
    setIsNavOpen(false);
  };

  const LoginModal = () => (
    <div className="homepage-login-modal">
      <div className="homepage-modal-content">
        <button 
          className="homepage-modal-close" 
          onClick={() => setShowLoginModal(false)}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        
        <div className="homepage-modal-header">
          <div className="homepage-modal-icon">
            <Sparkles className="sparkle-icon" size={32} />
          </div>
          <h2>Unlock AI Creation Magic!</h2>
          <div className="homepage-modal-subheader">
            <Lock size={16} />
            <span>Exclusive Feature</span>
          </div>
        </div>

        <div className="homepage-modal-body">
          <p>Transform your ideas into stunning wall art with our AI-powered creation tools.</p>
          <ul className="homepage-modal-features">
            <li>
              <Sparkles size={16} />
              <span>Create unique, personalized designs</span>
            </li>
            <li>
              <Sparkles size={16} />
              <span>Access exclusive AI art styles</span>
            </li>
            <li>
              <Sparkles size={16} />
              <span>Save and modify your creations</span>
            </li>
          </ul>
        </div>

        <div className="homepage-modal-buttons">
          <button 
            className="homepage-btn-primary" 
            onClick={() => {
              setShowLoginModal(false);
              navigate('/login');
            }}
          >
            <span>Login Now</span>
            <ArrowRight size={16} />
          </button>
          <button 
            className="homepage-btn-secondary" 
            onClick={() => setShowLoginModal(false)}
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );

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
          to="/aboutus" 
          className="nav-link"
          onClick={() => handleNavigation('About Us', 'About Us')}
        >
          About Us
        </Link>
      </li>
      <li className="nav-item">
  <Link 
    to="/AiCreation" 
    className="nav-link"
    onClick={(event) => {
      handleAiCreationClick(event);  // Keep the existing function
      handleNavigation('AiCreation', 'Create With AI');  // Add new function
    }}
  >
    Create With AI
  </Link>
</li>

      <li className="nav-item">
        <Link 
          to="/forbusiness" 
          className="nav-link"
          onClick={() => handleNavigation('forbusiness', 'For Business')}
        >
          For Business
        </Link>
      </li>
    </>
  );

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
          Frame Types
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
    <>
      <div className={`main-navbar-overlay ${isNavOpen ? 'show' : ''}`} onClick={() => setIsNavOpen(false)} />
      <nav className={`main-navbar ${isNavOpen ? 'show' : ''}`}>
        {showLoginModal && <LoginModal />}
        <div className="navbar-container">
          <div className="navbar-header">
            <Link 
              to="/" 
              className="logo-container"
              onClick={() => handleNavigation('', 'Home')}
            >
              <img src={whiteLogo} alt="Logo" className="logo" />
            </Link>

            <button 
              className="navbar-toggler" 
              type="button" 
              onClick={() => setIsNavOpen(!isNavOpen)}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div className={`links-container ${isNavOpen ? 'show' : ''}`}>
            <ul className="navbar-nav links-list">
              {user && user.role === 'superadmin' ? superAdminLinks : userLinks}
            </ul>

            <div className="mobile-secondary-nav">
              <Link to="/products" className="all-products-btn">
                All Products
              </Link>
              <div className="nav-buttons">
                <Link to="/cart" className="nav-button">
                  <img src={cartIconUrl} alt="Cart" />
                </Link>
                <Link to="/wishlist" className="nav-button">
                  <img 
                    src={wishlistCount > 0 ? wishlistIconUrl : heartIconUrl} 
                    alt="Wishlist"
                  />
                  {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
                </Link>
              </div>
            </div>

            <div className="user-info-container">
              {user ? (
                <div className="user-info">
                  <p
                    className="user-name"
                    onClick={() => {
                      handleNavigation('profile', 'Profile');
                      navigate('/profile');
                    }}
                  >
                    {user.firstName}
                  </p>
                  <button className="btn-logout btn btn-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="login-container">
                  <Link 
                    to="/login" 
                    className="btn-login"
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
    </>
  );
};

export default Navbar;