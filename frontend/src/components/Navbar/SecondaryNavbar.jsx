// SecondaryNavbar.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { wishlistCount } = useContext(WishlistContext);
  const navigate = useNavigate();
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
  <img src={wishlistCount > 0 ? wishlistIconUrl : heartIconUrl} alt="Wishlist" className="wishlist-icon" />
  {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
</Link>
        </div>
      </div>
    </nav>
  );
};

export default SecondaryNavbar;