import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TrackOrder.css";

const TrackOrder = () => {
  // Set the API URL – update this to your backend URL or use environment variables
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
  const [orderIdInput, setOrderIdInput] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrackOrder = async () => {
    if (!orderIdInput.trim()) {
      toast.error("Please enter an Order ID.");
      return;
    }
    setLoading(true);
    try {
      // Call the tracking endpoint from the backend
      const response = await axios.get(`${apiUrl}/api/shiprocket/track-order?order_id=${orderIdInput}`);
      if (response.data.success) {
        setOrderDetails(response.data.orderResponse);
        toast.success("Order details fetched successfully!");
      } else {
        setOrderDetails(null);
        toast.error(response.data.message || "Failed to fetch order details.");
      }
    } catch (error) {
      console.error(
        "Tracking error:",
        error.response ? error.response.data : error.message
      );
      setOrderDetails(null);
      toast.error("Error fetching tracking details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track-order">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="track-order-container">
        <h1>Track Your Order</h1>
        <p className="instructions">
          Enter your Order ID below to check the status of your order.
        </p>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter Order ID"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
          />
          <button onClick={handleTrackOrder} disabled={loading}>
            {loading ? "Tracking..." : "Track Order"}
          </button>
        </div>
        {orderDetails && (
          <div className="order-details-card">
            <h2>Order Details</h2>
            <div className="order-detail">
              <span className="label">Shiprocket Order ID:</span>
              <span className="value">{orderDetails.order_id || "N/A"}</span>
            </div>
            <div className="order-detail">
              <span className="label">Channel Order ID:</span>
              <span className="value">{orderDetails.channel_order_id || "N/A"}</span>
            </div>
            <div className="order-detail">
              <span className="label">Shipment ID:</span>
              <span className="value">{orderDetails.shipment_id || "N/A"}</span>
            </div>
            <div className="order-detail">
              <span className="label">AWB Code:</span>
              <span className="value">
                {orderDetails.awb_code && orderDetails.awb_code.trim() !== ""
                  ? orderDetails.awb_code
                  : "Not assigned yet"}
              </span>
            </div>
            <div className="order-detail">
              <span className="label">Status:</span>
              <span className="value">{orderDetails.status || "N/A"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
