import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FreepikImageGenerator.css';

const FreepikImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userGeneratedImages, setUserGeneratedImages] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [styling, setStyling] = useState({
    size: 'square_1_1',
    color: '',
    framing: '',
    lightning: '',
    style: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageDetails, setShowImageDetails] = useState(false);

  useEffect(() => {
    if (token) {
      fetchUserGeneratedImages();
    }
  }, [token]);

  const fetchUserGeneratedImages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/generated-images', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserGeneratedImages(response.data.images);
    } catch (err) {
      console.error('Error fetching user images:', err);
    }
  };

  const handleGenerateImage = async () => {
    if (!token) {
      setError('Authorization token is missing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/freepik/generate-image',
        { prompt, styling },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.images && response.data.images.length > 0) {
        setGeneratedImages(response.data.images);
        setShowModal(true);
        document.body.classList.add('no-scroll');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate images');
    } finally {
      setLoading(false);
    }
  };

  const handleStylingChange = (event) => {
    setStyling({ ...styling, [event.target.name]: event.target.value });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
    setShowImageDetails(false);
    document.body.classList.remove('no-scroll');
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setShowImageDetails(true);
  };

  const handleEditVision = () => {
    setShowImageDetails(false);
    setSelectedImage(null);
  };

  const handleCustomize = async (image) => {
    try {
      // Check if image is already saved
      const existingImage = userGeneratedImages.find(img => img.imageUrl === image);
      
      if (!existingImage) {
        // Split base64 image into chunks
        const base64Data = image.split(',')[1]; // Remove data:image/png;base64,
        const chunkSize = 5000000000; // 500KB chunks
        const chunks = [];
        
        for (let i = 0; i < base64Data.length; i += chunkSize) {
          chunks.push(base64Data.slice(i, i + chunkSize));
        }

        // Upload chunks sequentially
        for (let i = 0; i < chunks.length; i++) {
          const response = await axios.post(
            'http://localhost:5000/api/users/generated-images/chunk',
            {
              image: chunks[i],
              prompt,
              chunkIndex: i,
              totalChunks: chunks.length,
              isLastChunk: i === chunks.length - 1
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (response.data.image && i === chunks.length - 1) {
            await fetchUserGeneratedImages();
            navigate('/customize', { 
              state: { 
                image: response.data.image.imageUrl,
                prompt,
                isCustom: true
              }
            });
          }
        }
      } else {
        // Use existing image
        navigate('/customize', { 
          state: { 
            image: existingImage.imageUrl,
            prompt: existingImage.prompt,
            isCustom: true
          }
        });
      }
    } catch (error) {
      console.error('Error handling customization:', error);
      setError('Failed to process image for customization');
    }
  };

  return (
    <div className="freepik-generator-container">
      <h2 className="text-center mb-4">🎨 Generate AI Art with Freepik</h2>
      
      {userGeneratedImages.length > 0 && (
        <div className="previous-generations mb-4">
          <h3>Previous Generations</h3>
          <div className="generated-images-grid">
            {userGeneratedImages.map((img, index) => (
              <div key={index} className="generated-image-item" onClick={() => {
                navigate('/customize', {
                  state: {
                    image: img.imageUrl,
                    prompt: img.prompt,
                    isCustom: true
                  }
                });
              }}>
                <img src={img.imageUrl} alt={img.prompt} />
                <p>{img.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center mb-4">
        <input
          type="text"
          className="form-control"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt"
          disabled={loading}
        />
        <div className="row">
          <div className="col-md-3">
            <select
              name="size"
              value={styling.size}
              onChange={handleStylingChange}
              className="form-control"
            >
              <option value="square_1_1">Square 1:1</option>
              <option value="classic_4_3">Classic 4:3</option>
              <option value="traditional_3_4">Traditional 3:4</option>
              <option value="widescreen_16_9">Widescreen 16:9</option>
              <option value="social_story_9_16">Social Story 9:16</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              name="color"
              value={styling.color}
              onChange={handleStylingChange}
              className="form-control"
            >
              <option value="">None</option>
              <option value="b&w">B&W</option>
              <option value="pastel">Pastel</option>
              <option value="sepia">Sepia</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              name="framing"
              value={styling.framing}
              onChange={handleStylingChange}
              className="form-control"
            >
              <option value="">None</option>
              <option value="portrait">Portrait</option>
              <option value="macro">Macro</option>
              <option value="panoramic">Panoramic</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              name="lightning"
              value={styling.lightning}
              onChange={handleStylingChange}
              className="form-control"
            >
              <option value="">None</option>
              <option value="studio">Studio</option>
              <option value="warm">Warm</option>
            </select>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-3">
            <select
              name="style"
              value={styling.style}
              onChange={handleStylingChange}
              className="form-control"
            >
              <option value="">None</option>
              <option value="photo">Photo</option>
              <option value="digital-art">Digital Art</option>
              <option value="illustration">Illustration</option>
              <option value="vector">Vector</option>
            </select>
          </div>
        </div>
        <button
          className="btn btn-primary mt-3"
          onClick={handleGenerateImage}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {showModal && (
        <div className="freepik-generator-modal">
          <div className="freepik-generator-modal-content">
            <div className="freepik-generator-modal-header">
              <h5>Vision</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
              />
            </div>
            {showImageDetails ? (
              <div className="freepik-generator-modal-body">
                <div className="row">
                  <div className="col-md-4">
                    {selectedImage && (
                      <img src={selectedImage} alt="Selected Image" className="img-fluid" />
                    )}
                  </div>
                  <div className="col-md-8">
                    <p>{prompt}</p>
                    <div className="row">
                      <div className="col-md-12">
                        <button
                          type="button"
                          className="btn btn-warning me-2"
                          onClick={handleEditVision}
                        >
                          Edit Vision
                        </button>
                        <button
                          type="button"
                          className="btn btn-info"
                          onClick={() => handleCustomize(selectedImage)}
                        >
                          Customize
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="freepik-generator-modal-body">
                <div className="row">
                  {generatedImages.map((image, index) => (
                    <div className="col-3 mb-4" key={index}>
                      <div className="card" onClick={() => handleImageSelect(image)}>
                        <img src={image} alt={`Generated art ${index}`} className="card-img-top" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default FreepikImageGenerator;