import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./UserProfile.css";

const UserProfile = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "https://wallandtone.com";
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    shippingAddress: "",
    billingAddress: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        const response = await axios.get(`${apiUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched user profile:", response.data);
        setProfile(response.data);
        if (response.data.shippingAddress === response.data.billingAddress) {
          setSameAddress(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      await axios.put(`${apiUrl}/api/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  useEffect(() => {
    const fetchGeneratedImages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        const response = await axios.get(`${apiUrl}/api/generated-images`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setImages(response.data.images);
      } catch (error) {
        console.error("Error fetching generated images:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGeneratedImages();
  }, []);

  const handleImageClick = (imageId) => {
    navigate(`/customize/${imageId}`);
  };

  if (loading) {
    return <div className="container mt-5 text-center">Loading profile...</div>;
  }

  return (
    <div className="container mt-5">
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <a className="nav-link active">Profile</a>
        </li>
        <li className="nav-item">
          <a className="nav-link">Order History</a>
        </li>
        <li className="nav-item">
          <a className="nav-link">My Room</a>
        </li>
        <li className="nav-item">
          <a className="nav-link">Addresses</a>
        </li>
        <li className="nav-item">
          <a className="nav-link">Wish List</a>
        </li>
      </ul>
      <div className="profile-card p-4 bg-light border rounded">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold">My Profile</h4>
          <button className="btn btn-link text-primary fw-bold" onClick={() => setIsEditing(!isEditing)}>Edit</button>
        </div>
        <form onSubmit={handleSave}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Name</label>
              <input type="text" name="name" value={profile.firstName} onChange={handleChange} className="form-control" disabled={!isEditing} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input type="email" name="email" value={profile.email} onChange={handleChange} className="form-control" disabled={!isEditing} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Phone</label>
              <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="form-control" disabled={!isEditing} />
            </div>
          </div>
          <div className="mt-3">
            <label className="form-label">Shipping Address</label>
            <input type="text" name="shippingAddress" value={profile.shippingAddress} onChange={handleChange} className="form-control" disabled={!isEditing} />
          </div>
          <div className="mt-3">
            <label className="form-label">Billing Address</label>
            <input type="text" name="billingAddress" value={profile.billingAddress} onChange={handleChange} className="form-control" disabled={!isEditing || sameAddress} />
            <div className="form-check mt-2">
              <input type="checkbox" className="form-check-input" checked={sameAddress} onChange={() => setSameAddress(!sameAddress)} />
              <label className="form-check-label">Same as Shipping Address</label>
            </div>
          </div>
          {isEditing && (
            <div className="d-flex justify-content-end mt-4">
              <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setIsEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          )}
        </form>
      </div>

      <div className="container mt-5">
      <h4 className="fw-bold mb-4">My Generated Images</h4>
      <div className="row g-3">
        {images.length > 0 ? (
          images.map((image) => (
            <div key={image._id} className="col-md-4">
              <div className="card shadow-sm">
                <img
                  src={image.url}
                  alt="Generated artwork"
                  className="card-img-top img-fluid"
                  onClick={() => handleImageClick(image._id)}
                  style={{ cursor: "pointer" }}
                />
                <div className="card-body text-center">
                  <button className="btn btn-primary" onClick={() => handleImageClick(image._id)}>
                    View Product
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No generated images found.</p>
        )}
      </div>
    </div>

    </div>
  );
};

export default UserProfile;
