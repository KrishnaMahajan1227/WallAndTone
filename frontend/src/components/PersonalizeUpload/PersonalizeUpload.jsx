import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Upload } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./PersonalizeUpload.css"; // Custom CSS file

const apiUrl = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : 'https://wallandtone.com');

const PersonalizeUpload = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageQuality, setImageQuality] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // **🔹 Check Image Quality Before Upload**
  const checkImageQuality = (file) => {
    const img = new Image();
    img.onload = () => {
      const minResolution = 800; // Minimum 800px for printing
      if (img.width < minResolution || img.height < minResolution) {
        setImageQuality("Low");
      } else if (img.width < 1500 || img.height < 1500) {
        setImageQuality("Medium");
      } else {
        setImageQuality("Good");
      }
    };
    img.src = URL.createObjectURL(file);
  };

  // **🔹 Handle File Selection**
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (JPG or PNG).");
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    checkImageQuality(file);
  };

  // **🔹 Upload Image to Backend (which then uploads to Cloudinary)**
  const uploadToCloudinary = async () => {
    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }

    if (imageQuality === "Low") {
      setError("Image quality is too low for printing. Please upload a better image.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      // ✅ Upload image to Cloudinary via Backend API
      const response = await axios.post(
        `${apiUrl}/api/users/personalized-images`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl = response.data.image.imageUrl;

      // ✅ Redirect user to customization with the uploaded image
      navigate("/PersonalizeCustomization", { state: { image: imageUrl, isCustom: true } });

    } catch (err) {
      console.error("Upload Error:", err.response?.data || err.message);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="personalize-container">
      <div className="personalize-card">
        <h2 className="text-center">Personalized by You</h2>
        <p className="text-center">Transform your favorite photos into a WORK OF ART!</p>

        <div className="upload-box">
          <label className="upload-label">
            <input type="file" accept="image/*" className="d-none" onChange={handleFileChange} />
            <div className="upload-content">
              {previewUrl ? (
                <img src={previewUrl} alt="Selected" className="preview-image" />
              ) : (
                <div className="upload-placeholder">
                  <Upload size={40} />
                  <p>Upload Photo</p>
                  <span>Supported: PNG, JPG</span>
                </div>
              )}
            </div>
          </label>
        </div>

        {imageQuality && (
          <div className={`image-quality ${imageQuality.toLowerCase()}`}>
            Image Quality: {imageQuality}
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        <button
          className="btn btn-primary w-100 mt-3"
          onClick={uploadToCloudinary}
          disabled={!selectedImage || uploading || imageQuality === "Low"}
        >
          {uploading ? "Uploading..." : "Confirm & Customize"}
        </button>
      </div>
    </div>
  );
};

export default PersonalizeUpload;
