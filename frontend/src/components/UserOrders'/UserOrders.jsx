import React, { useState, useEffect } from "react";
import "./UserOrders.css";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://wallandtone.com");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/orders/myorders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        // Expecting { orders: [...] } from the API response
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [apiUrl, token]);

  return (
    <div className="user-orders">
      <h1 className="user-orders__title">Your Orders</h1>
      {orders.length === 0 ? (
        <p className="user-orders__empty">You have no orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="user-orders__order">
            <div className="user-orders__order-header">
              <h2 className="user-orders__order-id">Order ID: {order._id}</h2>
              <p className="user-orders__order-status">
                Status: {order.orderStatus || "N/A"}
              </p>
            </div>
            <div className="user-orders__order-details">
              <p className="user-orders__order-date">
                Placed on:{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="user-orders__order-total">
                Total: ${order.finalTotal ? order.finalTotal.toFixed(2) : "0.00"}
              </p>
            </div>
            <div className="user-orders__order-items">
              {order.orderItems && order.orderItems.length > 0 ? (
                order.orderItems.map((item, index) => (
                  <div key={index} className="user-orders__order-item">
                    <img
                      src={
                        item.productId && item.productId.mainImage
                          ? item.productId.mainImage
                          : ""
                      }
                      alt={
                        item.productId && item.productId.productName
                          ? item.productId.productName
                          : "Product"
                      }
                      className="user-orders__item-image"
                    />
                    <div className="user-orders__item-info">
                      <p className="user-orders__item-name">
                        {item.productId && item.productId.productName
                          ? item.productId.productName
                          : "Unknown Product"}
                      </p>
                      <p className="user-orders__item-quantity">
                        Quantity: {item.qty || 0}
                      </p>
                      <p className="user-orders__item-price">
                        Price: $
                        {item.price ? item.price.toFixed(2) : "0.00"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No items found for this order.</p>
              )}
            </div>
            <div className="user-orders__order-tracking">
              <p>
                Tracking ID: {order.trackingId ? order.trackingId : "N/A"}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserOrders;
