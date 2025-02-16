// HistoryDropdown.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './HistoryDropdown.css';

const HistoryDropdown = ({ onSelect }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/history', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const historyData = response.data;
        const last5Products = historyData.slice(-5);
        setHistory(last5Products);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchHistory();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="history-dropdown loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-dropdown error">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="history-dropdown empty">
        <p>No recent history</p>
      </div>
    );
  }

  return (
    <div className="history-dropdown">
      <h6 className="history-title">Recently Viewed</h6>
      {history.map((item) => (
        <Link
  key={item._id}
  to={`/product/${item.productId._id}`}
  className="history-item"
  onClick={() => onSelect(item)}
>
  <img
    src={`${item.productId.mainImage}`}
    alt={item.productId.productName}
    className="history-image"
  />
  <div className="history-details">
    <span className="history-name">{item.productId.productName}</span>
  </div>
</Link>
      ))}
    </div>
  );
};

export default HistoryDropdown;