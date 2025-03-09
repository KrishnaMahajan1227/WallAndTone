import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import HistoryDropdown from '../History/HistoryDropdown';
import { WishlistContext } from '../Wishlist/WishlistContext';
import cartIconUrl from '../../assets/icons/cart-icon.svg';
import historyIconUrl from '../../assets/icons/history-icon.svg';
import heartIconUrl from '../../assets/icons/Sec-nav-heart-icon.svg';
import wishlistIconUrl from '../../assets/icons/heart-icon-filled.svg';
import profileicon from '../../assets/icons/Profile-Icon.svg';

import './SecondaryNavbar.css';
import { UserContext } from '../../contexts/UserContext';

const SecondaryNavbar = () => {
  const apiUrl = import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://wallandtone.com');

  const { user, logout } = useContext(UserContext);
  const { wishlist, setWishlist } = useContext(WishlistContext);
  
  const [historyList, setHistoryList] = useState([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const historyRef = useRef(null);

  // Wishlist count (ensuring it's 0 if empty)
  const wishlistCount = wishlist.length || 0;

  // Fetch history using axios, agar token available ho
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistoryList(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    if (token) {
      fetchHistory();
    }
  }, [token, apiUrl]);

  // Navigation history update
  useEffect(() => {
    const currentPath = location.pathname.substring(1);
    if (!currentPath) return;

    const mainNavigationItems = [
      'search',
      'products',
      'aboutus',
      'contact',
      'AiCreation',
      'forbusiness',
      'Personalize'
    ];

    if (mainNavigationItems.includes(currentPath)) {
      const pathName = currentPath
        .split('/')
        .pop()
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      setNavigationHistory(prev => {
        const newHistory = [
          ...prev.filter(item => item.path !== currentPath),
          { path: currentPath, name: pathName }
        ].slice(-3);
        localStorage.setItem('navHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [location]);

  // Load navigation history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('navHistory');
    if (savedHistory) {
      setNavigationHistory(JSON.parse(savedHistory));
    }
  }, []);

  // History dropdown ko hide karne ke liye agar click bahar ho jaye
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHistorySelect = (item) => {
    setShowHistoryDropdown(false);
    navigate(`/product/${item.productId}`);
  };

  // Fetch wishlist data from API
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) {
        setWishlist([]); // Ensure empty state if not logged in
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/api/wishlist`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        const wishlistData = await response.json();

        // Ensure wishlistData.items is an array and correctly update state
        if (wishlistData && Array.isArray(wishlistData.items)) {
          setWishlist(wishlistData.items);
        } else {
          setWishlist([]);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error.message);
        setWishlist([]); // Reset wishlist on error
      }
    };

    fetchWishlist();
  }, [token, apiUrl, setWishlist]);

  return (
    <nav className="secondary-navbar">
      <div className="container">
        <div className="breadcrumbs">
          <div className="history-breadcrump">
            {navigationHistory.map((item, index) => (
              <React.Fragment key={item.path}>
                {index > 0 && (
                  <span className="breadcrumb-separator">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                      <path fill="none" stroke="#2F231F" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m9 6l6 6l-6 6"/>
                    </svg>
                  </span>
                )}
                <Link to={`/${item.path}`} className="breadcrumb-item">
                  {item.name}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="nav-buttons">
          <div className="history-button" ref={historyRef}>
            <button onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}>
              <img src={historyIconUrl} alt="History" className="history-icon" />
            </button>
            {showHistoryDropdown && (
              <HistoryDropdown
                history={historyList}
                onSelect={handleHistorySelect}
              />
            )}
          </div>
          <Link to="/cart" className="cart-button">
            <img src={cartIconUrl} alt="Cart" className="cart-icon" />
          </Link>
          <Link to="/wishlist" className="wishlist-button">
            <img
              src={wishlistCount > 0 ? wishlistIconUrl : heartIconUrl}
              alt="Wishlist"
              className="wishlist-icon"
            />
            {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
          </Link>
          {/* Profile icon sirf tab dikhaye jab user logged in ho */}
          {user && (
            <Link to="/profile" className="profile-button">
              <img src={profileicon} alt="Profile-Icon" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SecondaryNavbar;
