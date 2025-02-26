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
  const [activeTab, setActiveTab] = useState("profile");
  const [userGeneratedImages, setUserGeneratedImages] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        const response = await axios.get(`${apiUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
        if (response.data.shippingAddress === response.data.billingAddress) {
          setSameAddress(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      await axios.put(`${apiUrl}/api/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
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
            <button className="btn btn-link" onClick={() => setIsEditing(!isEditing)}>Edit</button>
          </div>
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label>Name</label>
              <input type="text" name="name" value={profile.firstName} onChange={handleChange} className="form-control" disabled={!isEditing} />
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
              <input type="text" name="billingAddress" value={profile.billingAddress} onChange={handleChange} className="form-control" disabled={!isEditing || sameAddress} />
              <div className="form-check">
                <input type="checkbox" className="form-check-input" checked={sameAddress} onChange={() => setSameAddress(!sameAddress)} />
                <label className="form-check-label">Same as Shipping Address</label>
              </div>
            </div>
          </form>
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
