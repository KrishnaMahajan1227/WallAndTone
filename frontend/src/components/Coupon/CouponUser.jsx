import React, { useState } from "react";
import axios from "axios";

const CouponUser = ({ onApplyCoupon }) => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/user/coupons/apply", { code });
      if (response.data.success) {
        setMessage(`Coupon applied successfully! Discount: ${response.data.discount}%`);
        onApplyCoupon(true, response.data.discount);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("An error occurred while applying the coupon.");
    }
  };

  return (
    <div>
      <h1>Coupon User</h1>
      <form onSubmit={handleApplyCoupon}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter Coupon Code"
        />
        <button type="submit">Apply Coupon</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default CouponUser;
