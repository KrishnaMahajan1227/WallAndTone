import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  // Separate modal states for AI and Personalize
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);

  // Agar livepreview route hai to Navbar render na ho
  if (location.pathname === '/livepreview') {
    return null;
  }

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
            <h2>Unlock AI Creation Magic<br />FOR FREE !</h2>
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
            <h2>Personalize Your Wall Art <br />FOR FREE !</h2>
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
      <li className="nav-item">
        <Link 
          to="/livePreview" 
          className="nav-link"
        >
          Live Preview
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
              <div className="nav-buttons">
                <Link to="/cart" className="nav-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512">
                    <path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M80 176a16 16 0 0 0-16 16v216c0 30.24 25.76 56 56 56h272c30.24 0 56-24.51 56-54.75V192a16 16 0 0 0-16-16Zm80 0v-32a96 96 0 0 1 96-96h0a96 96 0 0 1 96 96v32"/>
                  </svg>
                </Link>
                <Link to="/wishlist" className="nav-button">
                  {wishlistCount > 0 ? (
                    <img 
                      src={wishlistIconUrl} 
                      alt="Wishlist" 
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 512 512">
                      <path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M352.92 80C288 80 256 144 256 144s-32-64-96.92-64c-52.76 0-94.54 44.14-95.08 96.81c-1.1 109.33 86.73 187.08 183 252.42a16 16 0 0 0 18 0c96.26-65.34 184.09-143.09 183-252.42c-.54-52.67-42.32-96.81-95.08-96.81"/>
                    </svg>
                  )}
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h7v2zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5z"/>
                    </svg>
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
