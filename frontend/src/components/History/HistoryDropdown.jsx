import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./HistoryDropdown.css";

const HistoryDropdown = ({ onSelect }) => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://wallandtone.com");

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/api/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const historyData = response.data || [];
        const validHistory = historyData
          .filter((item) => item.productId && item.productId._id) // ✅ Filter out invalid entries
          .slice(-5); // ✅ Get the last 5 items

        setHistory(validHistory);
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

  if (!history.length) {
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
          key={item.productId._id}
          to={`/product/${item.productId._id}`}
          className="history-item"
          onClick={() => onSelect(item)}
        >
          <img
            src={item.productId.mainImage || "/default-image.jpg"} // ✅ Fallback image
            alt={item.productId.productName || "No Name"} // ✅ Fallback name
            className="history-image"
          />
          <div className="history-details">
            <span className="history-name">{item.productId.productName || "Unknown Product"}</span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default HistoryDropdown;
