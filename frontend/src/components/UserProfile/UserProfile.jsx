import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserProfile.css";

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
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

// ✅ Fetch User Profile
useEffect(() => {
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
        shippingAddress: userData.shippingDetails?.shippingAddress || "",
        billingAddress: userData.shippingDetails?.billingAddress || "",
        city: userData.shippingDetails?.city || "",
        state: userData.shippingDetails?.state || "",
        pincode: userData.shippingDetails?.pincode || "",
        country: userData.shippingDetails?.country || "India",
      });

      if (userData.shippingDetails?.shippingAddress === userData.shippingDetails?.billingAddress) {
        setSameAddress(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setAlertMessage("Failed to load profile.");
    }
  };

  fetchUserProfile();
}, []);

  useEffect(() => {
    if (activeTab === "myRoom") {
      const fetchGeneratedImages = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("User not authenticated");
    
          const response = await axios.get(`${apiUrl}/api/users/generated-images`, {
            headers: { Authorization: `Bearer ${token}` },
          });
    
          setUserGeneratedImages(response.data.images ? response.data.images.reverse() : []);
        } catch (error) {
          console.error("Error fetching generated images:", error);
          setUserGeneratedImages([]);
        }
      };
      fetchGeneratedImages();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

 // ✅ Handle Save Profile
 const handleSave = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const updatedData = {
      firstName: profile.firstName,
      phone: profile.phone,
      shippingDetails: {
        shippingAddress: profile.shippingAddress || "", // Save empty string if not provided
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

    const response = await axios.put(`${apiUrl}/api/profile/update`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setAlertMessage(response.data.message);
    setIsEditing(false);
    setShowPasswordFields(false);
  } catch (error) {
    console.error("Error updating profile:", error);
    setAlertMessage(error.response?.data?.message || "Failed to update profile.");
  } finally {
    setLoading(false);
  }
};


  const deleteGeneratedImage = async (imageId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      await axios.delete(`${apiUrl}/api/users/generated-images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserGeneratedImages(userGeneratedImages.filter(img => img._id !== imageId));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const deleteAllGeneratedImages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      await axios.delete(`${apiUrl}/api/users/generated-images`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserGeneratedImages([]);
    } catch (error) {
      console.error("Error deleting all images:", error);
    }
  };

  return (
    <div className="container mt-5">
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <a className={`nav-link ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>Profile</a>
        </li>
        <li className="nav-item">
          <a className="nav-link">Order History</a>
        </li>
        <li className="nav-item">
          <a className={`nav-link ${activeTab === "myRoom" ? "active" : ""}`} onClick={() => setActiveTab("myRoom")}>My Room</a>
        </li>
        <li className="nav-item">
          <a className="nav-link">Addresses</a>
        </li>
        <li className="nav-item">
          <a className="nav-link">Wish List</a>
        </li>
      </ul>
      {activeTab === "profile" && (
        <div className="card p-4">
          <div className="d-flex justify-content-between mb-3">
            <h4>My Profile</h4>
            {!isEditing ? (
            <button className="btn btn-warning" onClick={() => setIsEditing(true)}>Edit</button>
          ) : (
            <button className="btn btn-success" onClick={handleSave}>
              {"Save Changes"}
            </button>
          )}
            
          </div>

          {alertMessage && <div className="alert alert-info">{alertMessage}</div>}

          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label>Name</label>
              <input type="text" name="firstName" value={profile.firstName} onChange={handleChange} className="form-control" disabled={!isEditing} />
            </div>
            <div className="mb-3">
              <label>Email</label>
              <input type="email" name="email" value={profile.email} className="form-control" disabled />
            </div>
            <div className="mb-3">
              <label>Phone</label>
              <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="form-control" disabled={!isEditing} />
            </div>

            <div className="mb-3">
              <label>Shipping Address</label>
              <input type="text" name="shippingAddress" value={profile.shippingAddress} onChange={handleChange} className="form-control" disabled={!isEditing} />
            </div>

            <div className="mb-3">
              <label>Billing Address</label>
              <input type="text" name="billingAddress" value={sameAddress ? profile.shippingAddress : profile.billingAddress} onChange={handleChange} className="form-control" disabled={!isEditing || sameAddress} />
              <div className="form-check">
                <input type="checkbox" className="form-check-input" checked={sameAddress} onChange={() => setSameAddress(!sameAddress)} disabled={!isEditing} />
                <label className="form-check-label">Same as Shipping Address</label>
              </div>
            </div>
      {/* City, State, Pincode */}
      <div className="mb-3">
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
      <div className="mb-3">
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
      <div className="mb-3">
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
            <button type="button" className="btn btn-outline-secondary mb-3" onClick={() => setShowPasswordFields(!showPasswordFields)}>
              {showPasswordFields ? "Cancel Password Change" : "Change Password"}
            </button>

            {showPasswordFields && (
              <>
                <input type="password" className="form-control mb-3" placeholder="Old Password" onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} />
                <input type="password" className="form-control mb-3" placeholder="New Password" onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
              </>
            )}

<button className="btn btn-primary w-100 mt-3" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>          </form>
        </div>
      )}


{activeTab === "myRoom" && (
        <div className="mt-4 user-profile__generated-images">
          <h4 className="mb-4 d-flex justify-content-between">
            Generated Images
            {userGeneratedImages.length > 0 && (
              <button className="btn btn-danger btn-sm" onClick={deleteAllGeneratedImages}>Delete All</button>
            )}
          </h4>

          <div className="row row-cols-1 row-cols-md-4 g-4">
            {userGeneratedImages.length > 0 ? (
              userGeneratedImages.map((img) => (
                <div key={img._id} className="col">
                  <div className="card shadow-sm h-100">
                    <img 
                      src={img.imageUrl} 
                      alt={img.prompt} 
                      className="card-img-top user-profile__image" 
                      onClick={() => navigate("/customize", { state: { image: img.imageUrl, prompt: img.prompt, isCustom: true } })} 
                      style={{ cursor: "pointer" }}
                    />
                    <div className="card-body text-center">
                      <p className="card-text user-profile__image-text">{img.prompt}</p>
                      <span className="text-muted user-profile__image-date">{new Date(img.createdAt).toLocaleDateString()}</span>
                      <button className="btn btn-outline-danger btn-sm mt-2" onClick={() => deleteGeneratedImage(img._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="user-profile__no-images">No generated images found.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;
