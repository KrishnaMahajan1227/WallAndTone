import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';
import whiteLogo from '../../assets/logo/wall-n-tone-white.png';
import HistoryDropdown from '../History/HistoryDropdown';
import { WishlistContext } from '../Wishlist/WishlistContext';
import cartIconUrl from '../../assets/icons/cart-icon.svg';
import historyIconUrl from '../../assets/icons/history-icon.svg';
import heartIconUrl from '../../assets/icons/heart-icon.svg';
import wishlistIconUrl from '../../assets/icons/heart-icon-filled.svg';

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { wishlistCount } = useContext(WishlistContext);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsNavOpen(false);
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

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
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
          to="/aboutus" 
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
    <nav className={`main-navbar ${isNavOpen ? 'show' : ''}`}>
      <div className="navbar-container container-fluid flex-column p-0">
        <Link 
          to="/" 
          className="navbar-brand logo-container"
          onClick={() => handleNavigation('', 'Home')}
        >
          <img src={whiteLogo} alt="Logo" className="logo" />
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleNav}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`links-container ${isNavOpen ? 'show' : ''}`}>
          <ul className="navbar-nav links-list w-100">
            {user && user.role === 'superadmin' ? superAdminLinks : userLinks}
          </ul>

          {/* Mobile Secondary Nav */}
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
              <div className="user-info d-flex flex-column align-items-center">
                <p
                  className="user-name text-white text-capitalize clickable mb-2"
                  onClick={() => {
                    handleNavigation('profile', 'Profile');
                    navigate('/profile');
                  }}
                >
                  {user.firstName}
                </p>
                <button className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="login-container text-center">
                <Link 
                  to="/login" 
                  className="btn btn-primary"
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