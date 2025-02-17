import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import HistoryDropdown from '../History/HistoryDropdown';
import { WishlistContext } from '../Wishlist/WishlistContext';
import cartIconUrl from '../../assets/icons/cart-icon.svg';
import historyIconUrl from '../../assets/icons/history-icon.svg';
import heartIconUrl from '../../assets/icons/heart-icon.svg';
import wishlistIconUrl from '../../assets/icons/heart-icon-filled.svg';
import './SecondaryNavbar.css';

const SecondaryNavbar = () => {
  const [historyList, setHistoryList] = useState([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState([]);
  const { wishlistCount } = useContext(WishlistContext);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const historyRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHistoryList(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    if (token) {
      fetchHistory();
    }
  }, [token]);

  useEffect(() => {
    // Get path name without leading slash
    const currentPath = location.pathname.substring(1);
    if (!currentPath) return; // Skip if on home page
  
    // Define main navigation items
    const mainNavigationItems = [
      'search',
      'products',
      'about',
      'contact',
      'FreepikGenerator',
    ];
  
    // Check if current path is a main navigation item
    if (mainNavigationItems.includes(currentPath)) {
      // Convert path to readable name
      const pathName = currentPath
        .split('/')
        .pop()
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  
      // Update navigation history
      setNavigationHistory(prev => {
        const newHistory = [
          ...prev.filter(item => item.path !== currentPath),
          { path: currentPath, name: pathName }
        ].slice(-3); // Keep only last 3 items, starting from the end
  
        // Save to localStorage
        localStorage.setItem('navHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [location]);

  useEffect(() => {
    // Load navigation history from localStorage on component mount
    const savedHistory = localStorage.getItem('navHistory');
    if (savedHistory) {
      setNavigationHistory(JSON.parse(savedHistory));
    }
  }, []);

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

  return (
    <nav className="secondary-navbar">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <div className="All-btn">
          <Link to="/products" className="all-products-btn">
            All
          </Link>
          </div>
          <div className="history-breadcrump">
          {navigationHistory.map((item, index) => (
            <React.Fragment key={item.path}>
              {index > 0 && <span className="breadcrumb-separator"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="#2F231F" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m9 6l6 6l-6 6"/></svg></span>}
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
        </div>
      </div>
    </nav>
  );
};

export default SecondaryNavbar;