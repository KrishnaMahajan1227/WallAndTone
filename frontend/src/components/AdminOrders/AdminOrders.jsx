import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminOrders.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
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
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }
        // For debugging: read response text
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse JSON from response:", responseText);
          throw new Error("Server returned invalid JSON");
        }
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
        toast.error("Error fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [apiUrl, token]);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-orders-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1>Order Management</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Total (Rs.)</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Tracking ID</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>
                  {order.user?.name} <br />
                  <small>{order.user?.email}</small>
                </td>
                <td>{order.finalTotal ? order.finalTotal.toFixed(2) : "N/A"}</td>
                <td>{order.orderStatus}</td>
                <td>{order.paymentStatus}</td>
                <td>{order.trackingId || "N/A"}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => navigate(`/admin/orders/${order._id}`)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrders;
