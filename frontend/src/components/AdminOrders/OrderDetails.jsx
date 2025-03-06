import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./OrderDetails.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://wallandtone.com");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }
        const data = await response.json();
        setOrder(data);
        setOrderStatus(data.orderStatus || "");
        setPaymentStatus(data.paymentStatus || "");
        setTrackingId(data.trackingId || "");
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(err.message);
        toast.error("Error fetching order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [apiUrl, orderId, token]);

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
          trackingId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update order status");
      }
      const data = await response.json();
      setOrder(data.order);
      toast.success("Order updated successfully!");
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Error updating order status.");
    }
  };

  if (loading) return <div>Loading order details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!order) return <div>No order details found.</div>;

  return (
    <div className="order-details-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <button onClick={() => navigate(-1)} className="back-button">
        Back
      </button>
      <h1>Order Details</h1>
      <div className="order-info">
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>
        <p>
          <strong>User:</strong> {order.user?.name} ({order.user?.email})
        </p>
        <p>
          <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Total Price:</strong> Rs.{" "}
          {order.finalTotal ? order.finalTotal.toFixed(2) : "N/A"}
        </p>
        <p>
          <strong>Shipping Cost:</strong> Rs. {order.shippingCost ?? "N/A"}
        </p>
        <p>
          <strong>Tax Amount:</strong> Rs. {order.taxAmount ?? "N/A"}
        </p>
        <p>
          <strong>Discount Amount:</strong> Rs. {order.discountAmount ?? "N/A"}
        </p>
      </div>

      <div className="order-update">
        <h2>Update Order Status</h2>
        <div className="form-group">
          <label>Order Status</label>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
          >
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="form-group">
          <label>Payment Status</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        <div className="form-group">
          <label>Tracking ID</label>
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="Enter tracking ID"
          />
        </div>
        <button onClick={handleUpdateStatus} className="update-button">
          Update Order
        </button>
      </div>

      <div className="order-items">
        <h2>Ordered Items</h2>
        {order.orderItems?.length > 0 ? (
          order.orderItems.map((item, index) => (
            <div key={index} className="order-item">
              <img
                src={item.mainImage}
                alt={item.productName}
                className="item-image"
              />
              <div className="item-details">
                <p>
                  <strong>Product:</strong> {item.productName}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                <p>
                  <strong>Frame Type:</strong> {item.frameType?.name || "N/A"}
                </p>
                <p>
                  <strong>Sub Frame Type:</strong>{" "}
                  {item.subFrameType?.name || "N/A"}
                </p>
                <p>
                  <strong>Size:</strong> {item.size?.name || "N/A"}
                </p>
                <p>
                  <strong>Item Total:</strong> Rs.{" "}
                  {item.itemTotal ? item.itemTotal.toFixed(2) : "N/A"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No items found for this order.</p>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
