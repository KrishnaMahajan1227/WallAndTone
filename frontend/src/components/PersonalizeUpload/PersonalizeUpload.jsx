import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cropper from "react-easy-crop";
import { Upload, X } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./PersonalizeUpload.css";

const apiUrl =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://wallandtone.com");

const PersonalizeUpload = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageQuality, setImageQuality] = useState(null);
  const [supportedSizes, setSupportedSizes] = useState([]);
  const [orientation, setOrientation] = useState(null); // Selected Orientation
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const token = localStorage.getItem("token");

  // **🔹 Check Image Quality & Set Sizes**
  const checkImageQuality = (file) => {
    const img = new Image();
    img.onload = () => {
      let qualityLevel = "Low";
      if (img.width >= 1500 && img.height >= 1500) {
        qualityLevel = "Good";
      } else if (img.width >= 800 && img.height >= 800) {
        qualityLevel = "Medium";
      }

      setImageQuality(qualityLevel);
      setSupportedSizes(qualitySizes[qualityLevel]);
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

  // **🔹 When Crop is Done**
  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // **🔹 Convert Cropped Image to File**
  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        canvas.toBlob((blob) => {
          resolve(new File([blob], "cropped-image.jpg", { type: "image/jpeg" }));
        }, "image/jpeg");
      };
    });
  };

  // **🔹 Upload Cropped Image**
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

    try {
      const croppedFile = await getCroppedImg(previewUrl, croppedAreaPixels);
      const formData = new FormData();
      formData.append("image", croppedFile);

      const response = await axios.post(`${apiUrl}/api/users/personalized-images`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = response.data.image.imageUrl;

      navigate("/PersonalizeCustomization", {
        state: { image: imageUrl, isCustom: true, orientation },
      });
    } catch (err) {
      console.error("Upload Error:", err.response?.data || err.message);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="personalize-upload-container">
      <div className="personalize-upload-card">
        <h2 className="text-center personalize-title">Personalized by You</h2>
        <p className="text-center personalize-subtitle">
          Transform your favorite photos into a <strong>WORK OF ART!</strong>
        </p>

        <div className="personalize-upload-box">
          <label className="personalize-upload-label">
            <input type="file" accept="image/*" className="d-none" onChange={handleFileChange} />
            <div className="personalize-upload-content">
              {previewUrl ? (
                <div className="personalize-preview-container">
                  <Cropper
                    image={previewUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={orientation === "portrait" ? 3 / 4 : 16 / 9}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
              ) : (
                <div className="personalize-upload-placeholder">
                  <Upload size={50} className="upload-icon" />
                  <p className="upload-text">Upload Photo</p>
                  <span className="upload-support">Supported: PNG, JPG</span>
                </div>
              )}
            </div>
          </label>
        </div>

        {previewUrl && (
          <div className="orientation-selection">
            <label
              className={`orientation-option ${orientation === "portrait" ? "active" : ""}`}
              onClick={() => setOrientation("portrait")}
            >
              Portrait (3:4)
            </label>
            <label
              className={`orientation-option ${orientation === "landscape" ? "active" : ""}`}
              onClick={() => setOrientation("landscape")}
            >
              Landscape (16:9)
            </label>
          </div>
        )}

        {error && <p className="personalize-error-text">{error}</p>}

        <button className="btn btn-primary personalize-upload-btn" onClick={uploadToCloudinary} disabled={!selectedImage || uploading || imageQuality === "Low"}>
          {uploading ? "Uploading..." : "Confirm & Customize"}
        </button>
      </div>
    </div>
  );
};

export default PersonalizeUpload;
