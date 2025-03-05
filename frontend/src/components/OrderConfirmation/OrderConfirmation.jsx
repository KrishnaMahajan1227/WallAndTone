import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./OrderConfirmation.css";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Expecting the Shiprocket order response to be passed via location state
  const orderResponse = location.state?.orderResponse || {};
  
  // Use the Shipment ID as the tracking ID (or use a different key if needed)
  const shipmentId = orderResponse.shipment_id || "N/A";

  return (
    <div className="order-confirmation">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="order-confirmation-container">
        <h1>Thank You For Your Order!</h1>
        <p className="confirmation-message">
          Your order has been placed successfully.
        </p>
        <div className="tracking-display">
          <h2>Your Order Tracking ID</h2>
          <p className="tracking-id">{shipmentId}</p>
        </div>
        <p className="info-message">
          Use this ID to track your order on our tracking page.
          You will also receive a confirmation email shortly with the details of your order.
          Please check your spam folder if you don't see it.
        </p>
        <button
          className="continue-button"
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
