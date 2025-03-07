import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { WishlistContext } from '../Wishlist/WishlistContext';
import { X, Sparkles, Lock, ArrowRight, Heart } from "lucide-react";
import whiteLogo from '../../assets/logo/wall-n-tone-white.png';
import cartIconUrl from '../../assets/icons/cart-icon.svg';
import heartIconUrl from '../../assets/icons/heart-icon.svg';
import wishlistIconUrl from '../../assets/icons/heart-icon-filled.svg';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const { wishlistCount } = useContext(WishlistContext);
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  // Separate modal states for AI and Personalize
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);

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

  // Handler for AI Creation – if not logged in, show AI modal
  const handleAiCreationClick = (e) => {
    e.preventDefault();
    if (!user) {
      setShowAiModal(true);
      return;
    }
    navigate('/Ai Creation');
    setIsNavOpen(false);
  };

  // Handler for Personalize – if not logged in, show Personalize modal
  const handlePersonalizeClick = (e) => {
    e.preventDefault();
    if (!user) {
      setShowPersonalizeModal(true);
      return;
    }
    navigate('/Personalize');
    setIsNavOpen(false);
  };

  // Smooth fade-in animation styles
  const modalAnimationStyles = (
    <style>
      {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}
    </style>
  );

  // AI Creation Login Modal Component
  const AiLoginModal = () => (
    <>
      {modalAnimationStyles}
      <div
        className="homepage-login-modal modal-fade-in"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "1rem",
        }}
      >
        <div
          className="homepage-modal-content"
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "2rem",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            position: "relative",
          }}
        >
          <button
            className="homepage-modal-close"
            onClick={() => setShowAiModal(false)}
            aria-label="Close modal"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={24} />
          </button>

          <div
            className="homepage-modal-header"
            style={{ textAlign: "center", marginBottom: "1rem" }}
          >
            <div
              className="homepage-modal-icon"
              style={{ marginBottom: "0.5rem" }}
            >
              <Sparkles className="sparkle-icon" size={32} style={{ color: "#5B2EFF" }} />
            </div>
            <h2>Unlock AI Creation Magic!</h2>
            <div
              className="homepage-modal-subheader"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "0.5rem",
                gap: "0.5rem",
                color: "#555",
              }}
            >
              <Lock size={16} />
              <span>Exclusive AI Feature</span>
            </div>
          </div>

          <div
            className="homepage-modal-body"
            style={{ textAlign: "center", marginBottom: "1.5rem" }}
          >
            <p>
              Transform your ideas into stunning wall art with our AI-powered creation tools.
            </p>
            <ul
              className="homepage-modal-features"
              style={{ listStyle: "none", padding: 0 }}
            >
              <li
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Sparkles size={16} />
                <span>Create unique, personalized designs</span>
              </li>
              <li
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Sparkles size={16} />
                <span>Access exclusive AI art styles</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Sparkles size={16} />
                <span>Save and modify your creations</span>
              </li>
            </ul>
          </div>

          <div
            className="homepage-modal-buttons"
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <button
              className="homepage-btn-primary"
              onClick={() => {
                setShowAiModal(false);
                navigate("/login");
              }}
              style={{
                backgroundColor: "#5B2EFF",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>Login Now</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="homepage-btn-secondary"
              onClick={() => setShowAiModal(false)}
              style={{
                backgroundColor: "#fff",
                color: "#5B2EFF",
                border: "2px solid #5B2EFF",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // Personalize Login Modal Component – using the provided personalize popup design
  const PersonalizeLoginModal = () => (
    <>
      {modalAnimationStyles}
      <div
        className="homepage-login-modal modal-fade-in"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "1rem",
        }}
      >
        <div
          className="homepage-modal-content"
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "2rem",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            position: "relative",
          }}
        >
          <button
            className="homepage-modal-close"
            onClick={() => setShowPersonalizeModal(false)}
            aria-label="Close modal"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={24} />
          </button>

          <div
            className="homepage-modal-header"
            style={{ textAlign: "center", marginBottom: "1rem" }}
          >
            <div
              className="homepage-modal-icon"
              style={{ marginBottom: "0.5rem" }}
            >
              <Heart className="heart-icon" size={32} style={{ color: "#E63946" }} />
            </div>
            <h2>Personalize Your Wall Art!</h2>
            <div
              className="homepage-modal-subheader"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "0.5rem",
                gap: "0.5rem",
                color: "#555",
              }}
            >
              <Lock size={16} />
              <span>Exclusive Personalization</span>
            </div>
          </div>

          <div
            className="homepage-modal-body"
            style={{ textAlign: "center", marginBottom: "1.5rem" }}
          >
            <p>
              Bring your own inspiration or memories and let our experts create a unique wall art piece just for you.
            </p>
            <ul
              className="homepage-modal-features"
              style={{ listStyle: "none", padding: 0 }}
            >
              <li
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Heart size={16} style={{ color: "#E63946" }} />
                <span>Craft personalized designs</span>
              </li>
              <li
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Heart size={16} style={{ color: "#E63946" }} />
                <span>Access custom art styles</span>
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Heart size={16} style={{ color: "#E63946" }} />
                <span>Save your unique creation</span>
              </li>
            </ul>
          </div>

          <div
            className="homepage-modal-buttons"
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <button
              className="homepage-btn-primary"
              onClick={() => {
                setShowPersonalizeModal(false);
                navigate("/login");
              }}
              style={{
                backgroundColor: "#E63946",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>Login Now</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="homepage-btn-secondary"
              onClick={() => setShowPersonalizeModal(false)}
              style={{
                backgroundColor: "#fff",
                color: "#E63946",
                border: "2px solid #E63946",
                padding: "0.75rem 1.5rem",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </>
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
          to="/about us" 
          className="nav-link"
          onClick={() => handleNavigation('about us', 'About Us')}
        >
          About Us
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/Ai Creation" 
          className="nav-link"
          onClick={(e) => {
            handleAiCreationClick(e);
            handleNavigation('Ai Creation', 'Create With AI');
          }}
        >
          Create With AI
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/for business" 
          className="nav-link"
          onClick={() => handleNavigation('for business', 'For Business')}
        >
          For Business
        </Link>
      </li>
      <li className="nav-item">
        <Link 
          to="/Personalize" 
          className="nav-link"
          onClick={(e) => {
            e.preventDefault();
            handlePersonalizeClick(e);
            handleNavigation('Personalize', 'Personalize');
          }}
        >
          Personalize
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
      <li className="nav-item">
        <Link 
          to="/admin/orders" 
          className="nav-link"
          onClick={() => handleNavigation('/admin/orders', 'Orders')}
        >
          Orders
        </Link>
      </li>
    </>
  );

  return (
    <>
      <div className={`main-navbar-overlay ${isNavOpen ? 'show' : ''}`} onClick={() => setIsNavOpen(false)} />
      <nav className={`main-navbar ${isNavOpen ? 'show' : ''}`}>
        {/* Render both modals if needed */}
        {showAiModal && <AiLoginModal />}
        {showPersonalizeModal && <PersonalizeLoginModal />}
        <div className="navbar-container">
          <div className="navbar-header">
            <div className="logo-container">
              <Link to="/" onClick={() => handleNavigation('', 'Home')}>
                <img src={whiteLogo} alt="Logo" className="logo" />
              </Link>
            </div>
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
                <div className="login-container-nav">
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
