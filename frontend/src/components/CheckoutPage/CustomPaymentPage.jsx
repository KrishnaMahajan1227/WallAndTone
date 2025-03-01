import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./CustomPaymentPage.css";

const CustomPaymentPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "https://wallandtone.com";
  const location = useLocation();
  const navigate = useNavigate();

  const totalAmount = location.state?.total || 0;
  const [name, setName] = useState(location.state?.name || "");
  const [email, setEmail] = useState(location.state?.email || "");
  const [phone, setPhone] = useState(location.state?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!name || !email || !phone) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const response = await axios.post(`${apiUrl}/api/create-order`, {
        amount: totalAmount * 100, // Convert INR to paise
        currency: "INR",
        customer: { name, email, phone },
      });

      const { orderId } = response.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: totalAmount * 100,
        currency: "INR",
        name: "Wall and Tone",
        description: "Secure Checkout",
        image: "/logo.png", // Your brand logo
        order_id: orderId,
        handler: async (response) => {
          console.log("Payment Success:", response);
          setSuccessMessage("Payment Successful! Redirecting...");
          setTimeout(() => {
            navigate("/order-confirmation", { state: { paymentId: response.razorpay_payment_id } });
          }, 2000);
        },
        prefill: { name, email, contact: phone },
        theme: { color: "#ff6600" },
        modal: { ondismiss: () => setError("Payment cancelled by user.") },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-wrapper">
      <div className="payment-container">
        <h2>Complete Your Payment</h2>
        <p className="payment-subtext">Secure checkout powered by Razorpay</p>

        <div className="payment-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="payment-input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="payment-input"
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="payment-input"
            required
          />
        </div>

        <div className="amount-box">
          <span>Total Amount:</span>
          <strong>₹{totalAmount.toFixed(2)}</strong>
        </div>

        <button className="pay-button" onClick={handlePayment} disabled={loading}>
          {loading ? "Processing..." : `Pay ₹${totalAmount}`}
        </button>

        {error && <p className="payment-status error">{error}</p>}
        {successMessage && <p className="payment-status success">{successMessage}</p>}
      </div>
    </div>
  );
};

export default CustomPaymentPage;
