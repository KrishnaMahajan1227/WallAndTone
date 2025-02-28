import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "https://wallandtone.com";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const location = useLocation();
  const cartItems = location.state?.cartItems || [];
  const initialTotal = location.state?.total || 0;
  const subtotal = location.state?.subtotal || 0;
  const shippingCost = location.state?.shippingCost || 0;
  const taxAmount = location.state?.taxAmount || 0;
  const discountAmount = location.state?.discountAmount || 0;
  const couponApplied = location.state?.couponApplied || false;
  const couponDiscount = location.state?.couponDiscount || 0;

  const [cart, setCart] = useState(cartItems);
  const [totalPrice, setTotalPrice] = useState(initialTotal);
  const [sameAddress, setSameAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  // ✅ Define Shipping Details with default values
  const [shippingDetails, setShippingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    shippingAddress: "",
    billingAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  useEffect(() => {
    setTotalPrice(initialTotal);
    fetchUserProfile();
    fetchCartDetails();
  }, [initialTotal]);

  // ✅ Fetch User Profile & Pre-Fill Shipping Details
  const fetchUserProfile = async () => {
    try {
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data;
      const userShipping = userData.shippingDetails.length > 0 ? userData.shippingDetails[0] : {};

      setShippingDetails({
        name: userData.firstName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        shippingAddress: userShipping.shippingAddress || "",
        billingAddress: userShipping.billingAddress || "",
        city: userShipping.city || "",
        state: userShipping.state || "",
        pincode: userShipping.pincode || "",
        country: userShipping.country || "India",
      });

      if (userShipping.shippingAddress === userShipping.billingAddress) {
        setSameAddress(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setAlertMessage("Could not fetch user profile.");
    }
  };

  // ✅ Fetch Cart Details from Backend
  const fetchCartDetails = async () => {
    try {
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(response.data.items);
      setTotalPrice(response.data.totalPrice);
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };

  // ✅ Handle Order Placement
  const handlePlaceOrder = async () => {
    if (
      !shippingDetails.name ||
      !shippingDetails.email ||
      !shippingDetails.phone ||
      !shippingDetails.shippingAddress ||
      !shippingDetails.city ||
      !shippingDetails.state ||
      !shippingDetails.pincode
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        cartItems: cart,
        totalPrice,
        shippingDetails,
        paymentMethod,
      };

      const response = await axios.post(`${apiUrl}/api/place-order`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        navigate("/order-confirmation", { state: { orderId: response.data.orderId } });
      }
    } catch (error) {
      console.error("Error placing order", error);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container container mt-5">
      <h2 className="mb-4">Checkout</h2>

      {/* Error Message */}
      {error && <div className="alert alert-danger">{error}</div>}
      {alertMessage && <div className="alert alert-warning">{alertMessage}</div>}

      {/* Shipping Details Form */}
      <div className="card p-4 mb-4">
        <h4>Shipping Details</h4>
        <input type="text" placeholder="Full Name" className="form-control mb-2" value={shippingDetails.name} required />
        <input type="email" placeholder="Email" className="form-control mb-2" value={shippingDetails.email} required />
        <input type="text" placeholder="Phone" className="form-control mb-2" value={shippingDetails.phone} required />
        <input type="text" placeholder="Shipping Address" className="form-control mb-2" value={shippingDetails.shippingAddress} required />
        <input type="text" placeholder="City" className="form-control mb-2" value={shippingDetails.city} required />
        <input type="text" placeholder="State" className="form-control mb-2" value={shippingDetails.state} required />
        <input type="text" placeholder="Pincode" className="form-control mb-2" value={shippingDetails.pincode} required />

        {/* Billing Address */}
        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" checked={sameAddress} onChange={() => setSameAddress(!sameAddress)} />
          <label className="form-check-label">Billing Address same as Shipping Address</label>
        </div>

        {!sameAddress && (
          <input type="text" placeholder="Billing Address" className="form-control mb-2" value={shippingDetails.billingAddress} required={!sameAddress} />
        )}
      </div>

      {/* Order Summary */}
      <div className="card p-4 mb-4">
        <h4>Order Summary</h4>
        {cart.map((item) => (
          <div key={item._id} className="d-flex justify-content-between">
            <p>{item.productId?.productName || "Custom Artwork"} (x{item.quantity})</p>
            <p>₹{item.quantity * (item.frameType.price + item.subFrameType.price + item.size.price)}</p>
          </div>
        ))}
        <hr />
        <p><strong>Subtotal:</strong> ₹{subtotal.toFixed(2)}</p>
        <p><strong>Shipping Cost:</strong> ₹{shippingCost.toFixed(2)}</p>
        <p><strong>Tax:</strong> ₹{taxAmount.toFixed(2)}</p>
        {couponApplied && <p><strong>Discount ({couponDiscount}%):</strong> -₹{discountAmount.toFixed(2)}</p>}
        <h4><strong>Total:</strong> ₹{totalPrice.toFixed(2)}</h4>
      </div>

      {/* Payment Methods */}
      <div className="card p-4 mb-4">
        <h4>Payment Method</h4>
        <select className="form-control" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="COD">Cash on Delivery</option>
        </select>
      </div>

      {/* Place Order Button */}
      <button className="btn btn-success w-100" onClick={handlePlaceOrder} disabled={loading}>
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
};

export default CheckoutPage;
