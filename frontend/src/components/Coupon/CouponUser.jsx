import React, { useState } from "react";
import axios from "axios";

const CouponUser = ({ onApplyCoupon }) => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // ✅ Track success or error
  const [discount, setDiscount] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const handleApplyCoupon = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      setMessage("⚠️ Please enter a coupon code.");
      setMessageType("error");
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/api/users/coupons/apply`, { code });

      if (response.data.success) {
        setMessage(response.data.message);
        setMessageType("success");
        setDiscount(response.data.discount);
        onApplyCoupon(true, response.data.discount);
      } else {
        setMessage(response.data.message);
        setMessageType("error");
        setDiscount(null);
      }
    } catch (error) {
      setMessage("❌ Failed to apply coupon. Please check your code and try again.");
      setMessageType("error");
      setDiscount(null);
    }
  };

  return (
    <div className="coupon-container">
      <h2>Apply Coupon</h2>
      <form onSubmit={handleApplyCoupon}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter Coupon Code"
          className="coupon-input"
        />
        <button type="submit" className="apply-coupon-btn">Apply</button>
      </form>
      
      {/* Show messages with styling */}
      {message && (
        <p className={`coupon-message ${messageType === "success" ? "success-msg" : "error-msg"}`}>
          {message}
        </p>
      )}
      
      {discount !== null && <p className="discount-info">🎉 Discount Applied: {discount}%</p>}
    </div>
  );
};

export default CouponUser;
