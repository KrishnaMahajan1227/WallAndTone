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
  const initialTotal = Number(location.state?.total) || 0;
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

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

  useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);
}, []);


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

  const handlePayment = async () => {
    setLoading(true);
    try {
      const orderResponse = await axios.post(`${apiUrl}/api/payment/create-order`, {
        amount: totalPrice * 100,
        currency: "INR",
        receipt: `order_rcptid_${Date.now()}`,
      });
  
      const options = {
        key: razorpayKey,
        amount: orderResponse.data.order.amount,
        currency: "INR",
        name: "Wall and Tone",
        description: "Order Payment",
        order_id: orderResponse.data.order.id,
        handler: async (response) => {
          console.log("Payment Successful:", response);
  
          // ✅ Fetch a new Shiprocket token
          const shiprocketAuth = await axios.post(`${apiUrl}/api/shiprocket/auth`);
          const shiprocketToken = shiprocketAuth.data.token;
  
          // ✅ Create Shiprocket Order
          const shiprocketOrderData = {
            token: shiprocketToken,
            orderData: {
              order_id: `WT-${Date.now()}`,
              order_date: new Date().toISOString().split("T")[0],
              pickup_location: "Primary",
              billing_customer_name: shippingDetails.name,
              billing_last_name: "",
              billing_address: shippingDetails.shippingAddress,
              billing_city: shippingDetails.city,
              billing_pincode: shippingDetails.pincode,
              billing_state: shippingDetails.state,
              billing_country: shippingDetails.country,
              billing_email: shippingDetails.email,
              billing_phone: shippingDetails.phone,
              shipping_is_billing: true,
              order_items: cart.map((item) => ({
                name: item.productId?.productName || "Custom Artwork",
                sku: item.productId?._id || "CUSTOM",
                units: item.quantity,
                selling_price: item.frameType.price + item.subFrameType.price + item.size.price,
                discount: 0,
                tax: 50,
                hsn: 44140010,
              })),
              payment_method: "Prepaid",
              sub_total: totalPrice,
              length: 12,
              breadth: 10,
              height: 8,
              weight: 2,
            },
          };
  
          const shiprocketResponse = await axios.post(`${apiUrl}/api/shiprocket/create-order`, shiprocketOrderData);
  
          if (shiprocketResponse.data.success) {
            console.log("Shiprocket Order Created:", shiprocketResponse.data);
            navigate("/order-confirmation", { state: { orderId: shiprocketResponse.data.orderResponse.order_id } });
          } else {
            console.error("Shiprocket Order Failed:", shiprocketResponse.data);
            setError("Payment successful but Shiprocket order failed.");
          }
        },
        prefill: {
          name: shippingDetails.name,
          email: shippingDetails.email,
          contact: shippingDetails.phone,
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: () => setError("Payment cancelled by user."),
        },
      };
  
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment Error:", error);
      setError("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const placeOrder = async (paymentId = null) => {
    setLoading(true);
    try {
      const orderData = {
        cartItems: cart,
        totalPrice,
        shippingDetails,
        paymentMethod: paymentId ? "Online Payment" : "COD",
        paymentId,
      };

      const response = await axios.post(`${apiUrl}/api/place-order`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        navigate("/order-confirmation", { state: { orderId: response.data.orderId } });
      }
    } catch (error) {
      console.error("Error placing order:", error);
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
        {couponApplied && <p><strong>Discount ({couponDiscount}%):</strong> -₹{discountAmount.toFixed(2)}</p>}
        <h4><strong>Total:</strong> ₹{totalPrice.toFixed(2)}</h4>
      </div>

      {/* Payment Methods */}
<div className="card p-4 mb-4">
  <h4>Payment Method</h4>
  <div className="form-check">
    <input
      className="form-check-input"
      type="radio"
      id="cod"
      value="COD"
      checked={paymentMethod === "COD"}
      onChange={(e) => setPaymentMethod(e.target.value)}
    />
    <label className="form-check-label" htmlFor="cod">
      Cash on Delivery (COD)
    </label>
  </div>

  <div className="form-check">
    <input
      className="form-check-input"
      type="radio"
      id="online"
      value="Online"
      checked={paymentMethod === "Online"}
      onChange={(e) => setPaymentMethod(e.target.value)}
    />
    <label className="form-check-label" htmlFor="online">
      Online Payment (via Razorpay)
    </label>
  </div>

  {paymentMethod === "Online" && (
    <button
      className="btn btn-primary mt-3"
      onClick={handlePayment}
      disabled={loading}
    >
      {loading ? "Processing Payment..." : "Pay Now"}
    </button>
  )}
</div>


      <button className="btn btn-success w-100" onClick={handlePlaceOrder} disabled={loading}>
        {loading ? "Processing..." : "Place Order"}
      </button>
    </div>
  );
};

export default CheckoutPage;
