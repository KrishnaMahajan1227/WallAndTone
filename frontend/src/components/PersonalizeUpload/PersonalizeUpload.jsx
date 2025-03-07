import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cropper from "react-easy-crop";
import { Upload } from "lucide-react";
import { Helmet } from "react-helmet";
import "bootstrap/dist/css/bootstrap.min.css";
import "./PersonalizeUpload.css";

const apiUrl =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://wallandtone.com");

// Define qualitySizes mapping for determining quality.
const qualitySizes = {
  Good: [{ width: 1500, height: 1500 }, { width: 2000, height: 2000 }],
  Medium: [{ width: 800, height: 800 }, { width: 1200, height: 1200 }],
  Low: [] // No supported sizes for low quality
};

const getQualityPercentage = (quality) => {
  if (quality === "Good") return 100;
  if (quality === "Medium") return 70;
  if (quality === "Low") return 40;
  return 0;
};

const PersonalizeUpload = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageQuality, setImageQuality] = useState(null);
  const [orientation, setOrientation] = useState(null); // Selected Orientation
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // **🔹 Check Image Quality & Set Percentage**
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

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError("File size exceeds 50MB. Please upload a smaller image.");
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
      setError("Image quality is too low for printing. Please upload a higher quality image.");
      return;
    }
    setUploading(true);
    try {
      const croppedFile = await getCroppedImg(previewUrl, croppedAreaPixels);
      const formData = new FormData();
      formData.append("image", croppedFile);
      // Proceed regardless of login status.
      const headers = { "Content-Type": "multipart/form-data" };
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await axios.post(`${apiUrl}/api/users/personalized-images`, formData, {
        headers,
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

  // Determine overlay color based on quality
  const qualityColor =
    imageQuality === "Good"
      ? "rgba(0, 128, 0, 0.8)"
      : imageQuality === "Medium"
      ? "rgba(255, 165, 0, 0.8)"
      : "rgba(255, 0, 0, 0.8)";

  // Determine overlay message
  const overlayMessage =
    imageQuality === "Low"
      ? `Low Quality (${getQualityPercentage(imageQuality)}%) - Please upload a higher quality image`
      : `Image Quality: ${imageQuality} (${getQualityPercentage(imageQuality)}%)`;

  return (
    <div className="personalize-upload-container">
      <Helmet>
        <title>Personalize Your Wall Art | Wall & Tone</title>
        <meta
          name="description"
          content="Upload and customize your favorite photo to transform it into a unique work of art. Personalize your wall art with quality and style."
        />
        <meta
          name="keywords"
          content="Personalize, Upload, Wall Art, Custom Art, Photo Customization, Wall & Tone, Art Print"
        />
        <link rel="canonical" href="https://wallandtone.com/personalize-upload" />
        <meta property="og:title" content="Personalize Your Wall Art | Wall & Tone" />
        <meta
          property="og:description"
          content="Upload and customize your favorite photo to transform it into a unique work of art. Let your creativity shine with Wall & Tone."
        />
        <meta property="og:image" content="https://wallandtone.com/path-to-your-default-og-image.jpg" />
        <meta property="og:url" content="https://wallandtone.com/personalize-upload" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <div className="personalize-upload-card">
        <h2 className="text-center personalize-title">Personalized by You</h2>
        <p className="text-center personalize-subtitle">
          Transform your favorite photos into a <strong>WORK OF ART!</strong>
        </p>

        <div className="personalize-upload-box">
          {!previewUrl ? (
            // If no image is selected, show the normal upload placeholder
            <label className="personalize-upload-label">
              <input type="file" accept="image/*" className="d-none" onChange={handleFileChange} />
              <div className="personalize-upload-placeholder">
                <Upload size={50} className="upload-icon" />
                <p className="upload-text">Upload Photo</p>
                <span className="upload-support">Supported: PNG, JPG</span>
              </div>
            </label>
          ) : (
            // When an image is selected, show the Cropper component
            <div className="personalize-preview-container">
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={orientation === "portrait" ? 3 / 4 : 4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
              <div className="quality-overlay" style={{ backgroundColor: qualityColor }}>
                <p>{overlayMessage}</p>
              </div>

            </div>
          )}
        </div>

        {previewUrl && (
          <div className="orientation-selection">
            <label
              className={`orientation-option ${orientation === "portrait" ? "active" : ""}`}
              onClick={() => setOrientation("portrait")}
            >
              Portrait
            </label>
            <label
              className={`orientation-option ${orientation === "landscape" ? "active" : ""}`}
              onClick={() => setOrientation("landscape")}
            >
              Landscape
            </label>
          </div>
        )}

        {error && <p className="personalize-error-text">{error}</p>}

{/* Re-Upload button */}
<div className="reupload-btn-container">
                <button
                  className="btn btn-secondary reupload-btn"
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewUrl(null);
                    setImageQuality(null);
                    setError(null);
                  }}
                >
                  Re-Upload Image
                </button>
              </div>

        <button
          className="btn btn-primary personalize-upload-btn"
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
