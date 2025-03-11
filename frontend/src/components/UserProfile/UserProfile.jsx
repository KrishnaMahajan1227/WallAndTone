import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // using react-toastify
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserProfile.css"; // Your existing styles
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserProfile = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "https://wallandtone.com";
  const [profile, setProfile] = useState({
    firstName: "",
    email: "",
    phone: "",
    shippingAddress: "",
    billingAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [sameAddress, setSameAddress] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
  const [activeTab, setActiveTab] = useState("profile");
  const [userGeneratedImages, setUserGeneratedImages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get(`${apiUrl}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data;
      setProfile({
        firstName: userData.firstName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        shippingAddress: userData.shippingDetails?.[0]?.shippingAddress || "",
        billingAddress: userData.shippingDetails?.[0]?.billingAddress || "",
        city: userData.shippingDetails?.[0]?.city || "",
        state: userData.shippingDetails?.[0]?.state || "",
        pincode: userData.shippingDetails?.[0]?.pincode || "",
        country: userData.shippingDetails?.[0]?.country || "India",
      });
      
      if (
        userData.shippingDetails?.[0]?.shippingAddress ===
        userData.shippingDetails?.[0]?.billingAddress
      ) {
        setSameAddress(true);
      } else {
        setSameAddress(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile.");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [apiUrl, token]);

  // Fetch Generated Images if "myRoom" tab is active
  useEffect(() => {
    if (activeTab === "myRoom") {
      const fetchGeneratedImages = async () => {
        try {
          if (!token) throw new Error("User not authenticated");

          const response = await axios.get(`${apiUrl}/api/users/generated-images`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setUserGeneratedImages(
            response.data.images ? response.data.images.reverse() : []
          );
        } catch (error) {
          console.error("Error fetching generated images:", error);
          setUserGeneratedImages([]);
        }
      };
      fetchGeneratedImages();
    }
  }, [activeTab, apiUrl, token]);

  // Fetch Order History if "orderHistory" tab is active
  useEffect(() => {
    if (activeTab === "orderHistory") {
      const fetchOrders = async () => {
        try {
          if (!token) throw new Error("User not authenticated");
          const response = await axios.get(`${apiUrl}/api/orders/myorders`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Adjust response structure if needed
          setOrders(response.data.orders || []);
        } catch (error) {
          console.error("Error fetching orders:", error);
          toast.error("Failed to fetch orders.");
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab, apiUrl, token]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Handle Save Profile and re-fetch user data on success.
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedData = {
        firstName: profile.firstName,
        phone: profile.phone,
        shippingDetails: {
          shippingAddress: profile.shippingAddress || "",
          billingAddress: profile.billingAddress || "",
          city: profile.city || "",
          state: profile.state || "",
          pincode: profile.pincode || "",
          country: profile.country || "India",
        },
      };

      if (showPasswordFields && passwords.oldPassword && passwords.newPassword) {
        updatedData.oldPassword = passwords.oldPassword;
        updatedData.newPassword = passwords.newPassword;
      }

      const response = await axios.put(
        `${apiUrl}/api/profile/update`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(response.data.message);
      setIsEditing(false);
      setShowPasswordFields(false);
      await fetchUserProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel edits and revert to DB data by re-fetching the profile.
  const handleCancel = async () => {
    setIsEditing(false);
    setShowPasswordFields(false);
    await fetchUserProfile();
  };

  const deleteGeneratedImage = async (imageId) => {
    try {
      if (!token) throw new Error("User not authenticated");

      await axios.delete(`${apiUrl}/api/users/generated-images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserGeneratedImages(userGeneratedImages.filter((img) => img._id !== imageId));
      toast.success("Image deleted successfully.");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image.");
    }
  };

  const deleteAllGeneratedImages = async () => {
    try {
      if (!token) throw new Error("User not authenticated");

      await axios.delete(`${apiUrl}/api/users/generated-images`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserGeneratedImages([]);
      toast.success("All images deleted successfully.");
    } catch (error) {
      console.error("Error deleting all images:", error);
      toast.error("Failed to delete images.");
    }
  };

  return (
    <div className="my-profile-page container">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* TOP TABS */}
      <ul className="nav nav-tabs my-profile-page__tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
        </li>
        {/* <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "orderHistory" ? "active" : ""}`}
            onClick={() => setActiveTab("orderHistory")}
          >
            Order History
          </button>
        </li> */}
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "myRoom" ? "active" : ""}`}
            onClick={() => setActiveTab("myRoom")}
          >
            My Room
          </button>
        </li>
      </ul>

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div className="my-profile-page__card card">
          <div className="my-profile-page__card-body card-body">
            <div className="my-profile-page__header d-flex justify-content-between align-items-center mb-4">
              <h4 className="my-profile-page__title">My Profile</h4>
              {!isEditing ? (
                <button
                  className="btn my-profile-page__edit-btn"
                  onClick={() => setIsEditing(true)}
                >
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	<g fill="none" stroke="#5b2eff" stroke-linecap="round" stroke-linejoin ="round" stroke-width="2">
		<path d="m16.475 5.408l2.117 2.117m-.756-3.982L12.109 9.27a2.1 2.1 0 0 0-.58 1.082L11 13l2.648-.53c.41-.082.786-.283 1.082-.579l5.727-5.727a1.853 1.853 0 1 0-2.621-2.621" />
		<path d="M19 15v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3" />
	</g>
</svg>
</button>
              ) : (
                <div>
                  <button className="btn btn-success me-2" onClick={handleSave}>
                    Save
                  </button>
                  <button className="btn btn-outline-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSave}>
              <div className="row mb-3">
                <div className="col-md-4 col-sm-12">
                  <label>Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-md-4 col-sm-12">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    className="form-control"
                    disabled
                  />
                </div>
                <div className="col-md-4 col-sm-12">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4 col-sm-12">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-md-4 col-sm-12">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={profile.state}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-md-4 col-sm-12">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={profile.pincode}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-12">
                  <label>Shipping Address</label>
                  <input
                    type="text"
                    name="shippingAddress"
                    value={profile.shippingAddress}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing}
                  />
                </div>
                <div className="col-md-12">
                  <label>Billing Address</label>
                  <input
                    type="text"
                    name="billingAddress"
                    value={sameAddress ? profile.shippingAddress : profile.billingAddress}
                    onChange={handleChange}
                    className="form-control"
                    disabled={!isEditing || sameAddress}
                  />
                  <div className="form-check mt-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={sameAddress}
                      onChange={() => setSameAddress(!sameAddress)}
                      disabled={!isEditing}
                    />
                    <label className="form-check-label">Same as Shipping</label>
                  </div>
                </div>
              </div>

              {/* CHANGE PASSWORD */}
              {isEditing && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-secondary mb-3"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                  >
                    {showPasswordFields ? "Cancel Password Change" : "Change Password"}
                  </button>
                  {showPasswordFields && (
                    <div className="my-profile-page__password-fields mb-3">
                      <input
                        type="password"
                        className="form-control mb-2"
                        placeholder="Old Password"
                        onChange={(e) =>
                          setPasswords({ ...passwords, oldPassword: e.target.value })
                        }
                      />
                      <input
                        type="password"
                        className="form-control"
                        placeholder="New Password"
                        onChange={(e) =>
                          setPasswords({ ...passwords, newPassword: e.target.value })
                        }
                      />
                    </div>
                  )}
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ORDER HISTORY TAB */}
      {activeTab === "orderHistory" && (
        <div className="my-profile-page__card card mt-4">
          <div className="card-body">
            <h4 className="my-profile-page__title mb-3">Order History</h4>
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orders.map((order) => (
                <div key={order.order_id || order._id} className="order-card card p-3 mb-3">
                  <div className="d-flex flex-wrap justify-content-between align-items-center">
                    <div>
                      <h5 className="order-card__id">Order ID: {order.channel_order_id || order.order_id}</h5>
                      <p className="order-card__date text-muted">{order.order_date || new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="order-card__status badge bg-primary">
                        {order.status || order.orderStatus}
                      </span>
                    </div>
                  </div>
                  <div className="order-card__details mt-2">
                    <p>
                      <strong>Amount Paid:</strong> ₹ {(order.sub_total + 300 + 50).toFixed(2)}
                    </p>
                    <p>
                      <strong>Payment Method:</strong> {order.payment_method}
                    </p>
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="order-card__items mt-2">
                        <h6>Items Ordered:</h6>
                        {order.order_items.map((item, idx) => (
                          <p key={idx} className="mb-1">
                            <strong>{item.name}</strong> (x{item.units}) – ₹ {item.selling_price} each
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-end mt-3">
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        navigate("/order-confirmation", { state: { orderResponse: order } })
                      }
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MY ROOM TAB */}
      {activeTab === "myRoom" && (
        <div className="my-profile-page__card card mt-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="my-profile-page__title">Generated Images</h4>
              {userGeneratedImages.length > 0 && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={deleteAllGeneratedImages}
                >
                  Delete All
                </button>
              )}
            </div>
            <div className="row row-cols-1 row-cols-md-4 g-4">
              {userGeneratedImages.length > 0 ? (
                userGeneratedImages.map((img) => (
                  <div key={img._id} className="col">
                    <div className="card h-100 my-profile-page__image-card">
                      <img
                        src={img.imageUrl}
                        alt={img.prompt}
                        className="card-img-top my-profile-page__image"
                        onClick={() =>
                          navigate("/customize", {
                            state: {
                              image: img.imageUrl,
                              prompt: img.prompt,
                              isCustom: true,
                            },
                          })
                        }
                      />
                      <div className="card-body text-center">
                        <p className="card-text">{img.prompt}</p>
                        <span className="text-muted">
                          {new Date(img.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          className="btn btn-outline-danger btn-sm mt-2"
                          onClick={() => deleteGeneratedImage(img._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No generated images found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
