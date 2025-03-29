import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "https://wallandtone.com";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const location = useLocation();

  const cartItems = location.state?.cartItems || [];
  const finalPrice = Number(location.state?.total) || 0;
  const discountAmount = Number(location.state?.discountAmount) || 0;
  const couponApplied = location.state?.couponApplied || false;
  const couponDiscount = Number(location.state?.couponDiscount) || 0;

  const [cart, setCart] = useState(cartItems);
  const [totalPrice, setTotalPrice] = useState(finalPrice);
  const paymentMethod = "Online";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  const [sameAddress, setSameAddress] = useState(true);

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    setTotalPrice(finalPrice);
    fetchUserProfile();
    fetchCartDetails();
  }, [finalPrice]);

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
        billingAddress: userShipping.billingAddress || userShipping.shippingAddress || "",
        city: userShipping.city || "",
        state: userShipping.state || "",
        pincode: userShipping.pincode || "",
        country: userShipping.country || "India",
      });
      if (userShipping.shippingAddress === userShipping.billingAddress || !userShipping.billingAddress) {
        setSameAddress(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Could not fetch user profile.");
    }
  };

  const fetchCartDetails = async () => {
    try {
      if (!token) return;
      const response = await axios.get(`${apiUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data.items);
      setTotalPrice(finalPrice);
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };

  const validateFields = () => {
    if (
      !shippingDetails.name ||
      !shippingDetails.email ||
      !shippingDetails.phone ||
      !shippingDetails.shippingAddress ||
      !shippingDetails.city ||
      !shippingDetails.state ||
      !shippingDetails.pincode ||
      (!sameAddress && !shippingDetails.billingAddress)
    ) {
      toast.error("Please fill in all required fields.");
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateFields()) return;
    setLoading(true);
    try {
      const orderResponse = await axios.post(
        `${apiUrl}/api/payment/create-order`,
        {
          amount: totalPrice * 100,
          currency: "INR",
          receipt: `order_rcptid_${Date.now()}`,
        }
      );
      const { order } = orderResponse.data;
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: "INR",
        name: "Wall and Tone",
        description: "Order Payment",
        order_id: order.id,
        handler: async (response) => {
          toast.success("Payment successful!");

          // Map each cart item to an order item with proper fallbacks.
          const orderItems = cart.map((item, index) => ({
            sku: (item.productId ? item.productId._id : "CUSTOM") + "-" + index,
            name: item.productId ? item.productId.productName : "Custom Artwork",
            mainImage: item.isCustom ? item.image : (item.productId?.mainImage || ""),
            units: item.quantity || 1,
            selling_price:
              (item.productId?.price || 0) +
              (item.frameType?.price || 0) +
              (item.subFrameType?.price || 0) +
              (item.size?.price || 0),
            discount: 0,
            tax: 0,
            hsn: 44140010,
            frameType: item.frameType ? item.frameType : { name: "Not Provided" },
            subFrameType: item.subFrameType ? item.subFrameType : { name: "Not Provided" },
            size: item.size ? item.size : { name: "Not Provided" },
          }));

          const orderData = {
            order_id: `WT-${Date.now()}`,
            order_date: new Date().toISOString().split("T")[0],
            pickup_location: "Work",
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
            order_items: orderItems,
            payment_method: "Prepaid",
            sub_total: totalPrice,
            length: 12,
            breadth: 10,
            height: 8,
            weight: 2,
          };

          try {
            const shiprocketAuth = await axios.post(`${apiUrl}/api/shiprocket/auth`);
            const shiprocketToken = shiprocketAuth.data.token;
            const shiprocketOrderData = { token: shiprocketToken, orderData };
            const shiprocketResponse = await axios.post(
              `${apiUrl}/api/shiprocket/create-order`,
              shiprocketOrderData
            );

            if (shiprocketResponse.data.success) {
              navigate("/order-confirmation", {
                state: { orderResponse: shiprocketResponse.data.orderResponse },
              });
            } else {
              console.error("Shiprocket Order Failed:", shiprocketResponse.data);
              toast.error("Payment successful but order creation failed.");
            }
          } catch (err) {
            console.error("Error during Shiprocket order creation:", err);
            toast.error("Error creating order. Please contact support.");
          }
        },
        prefill: {
          name: shippingDetails.name,
          email: shippingDetails.email,
          contact: shippingDetails.phone,
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: () => toast.error("Payment cancelled by user."),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    setError(null);
    handlePayment();
  };

  useEffect(() => {
    if (sameAddress) {
      setShippingDetails((prev) => ({
        ...prev,
        billingAddress: prev.shippingAddress,
      }));
    }
  }, [sameAddress, shippingDetails.shippingAddress]);

  const renderOrderSummaryItems = () => {
    return cartItems.map((item, index) => (
      <div key={index} className="order-item">
        <div className="order-item-info">
          <h5>{item.productName || "Custom Artwork"}</h5>
          <p>Quantity: {item.quantity}</p>
          {item.frameType && item.subFrameType && item.size && (
            <p>
              Options: Frame - {item.frameType.name}, Type - {item.subFrameType.name}, Size - {item.size.name}
            </p>
          )}
          {item.itemTotal && (
            <p className="order-item-price">₹ {item.itemTotal}</p>
          )}
        </div>
      </div>
    ));
  };

  // In this design, totalPrice already includes shipping & tax.
  const finalTotal = totalPrice;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="checkout-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="checkout-container container mt-5">
        <h2 className="mb-4">Checkout</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Shipping Details Form */}
        <div className="checkout-card card p-4 mb-4">
          <h4>Shipping Details</h4>
          <input
            type="text"
            placeholder="Full Name"
            className="form-control"
            value={shippingDetails.name}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, name: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="form-control"
            value={shippingDetails.email}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, email: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Phone"
            className="form-control"
            value={shippingDetails.phone}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, phone: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Shipping Address"
            className="form-control"
            value={shippingDetails.shippingAddress}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, shippingAddress: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="City"
            className="form-control"
            value={shippingDetails.city}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, city: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="State"
            className="form-control"
            value={shippingDetails.state}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, state: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Pincode"
            className="form-control"
            value={shippingDetails.pincode}
            onChange={(e) =>
              setShippingDetails({ ...shippingDetails, pincode: e.target.value })
            }
            required
          />
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="sameAddress"
              checked={sameAddress}
              onChange={() => setSameAddress(!sameAddress)}
            />
            <label className="form-check-label" htmlFor="sameAddress">
              Billing Address same as Shipping Address
            </label>
          </div>
          {!sameAddress && (
            <input
              type="text"
              placeholder="Billing Address"
              className="form-control"
              value={shippingDetails.billingAddress}
              onChange={(e) =>
                setShippingDetails({ ...shippingDetails, billingAddress: e.target.value })
              }
              required
            />
          )}
        </div>

        {/* Order Summary */}
        <div className="checkout-card card p-4 mb-4">
          <h4>Order Summary</h4>
          <div className="order-summary-items">{renderOrderSummaryItems()}</div>
          <hr />
          <h4 className="total">
            <strong>Total:</strong> {finalTotal.toFixed(2)} Rs.
          </h4>
          <p className="inclusive-note">(Price is inclusive of shipping & tax)</p>
        </div>

        {/* Payment Method – Only Online Payment */}
        <div className="checkout-card card p-4 mb-4">
          <h4>Payment Method</h4>
          <div className="payment-method">
            <p>Online Payment (via Razorpay)</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-success w-100 checkout-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
