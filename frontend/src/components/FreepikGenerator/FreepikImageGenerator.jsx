import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight } from 'lucide-react';
import './FreepikImageGenerator.css';

const FreepikImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customizing, setCustomizing] = useState(false);
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
      const response = await axios.get('http://backend.wallandtone.com/api/users/generated-images', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sortedImages = response.data.images.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setUserGeneratedImages(sortedImages);
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
        'http://backend.wallandtone.com/api/freepik/generate-image',
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
      setCustomizing(true);
      const existingImage = userGeneratedImages.find(img => img.imageUrl === image);
      
      if (!existingImage) {
        const base64Data = image.split(',')[1];
        const chunkSize = 5000000000;
        const chunks = [];
        
        for (let i = 0; i < base64Data.length; i += chunkSize) {
          chunks.push(base64Data.slice(i, i + chunkSize));
        }

        for (let i = 0; i < chunks.length; i++) {
          const response = await axios.post(
            'http://backend.wallandtone.com/api/users/generated-images/chunk',
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
    } finally {
      setCustomizing(false);
    }
  };

  return (
    <div className="freepik-generator">
      <div className="freepik-generator__header">
        <h2>🎨 Generate AI Art with Freepik</h2>
      </div>

      <div className="freepik-generator__form">
        <div className="freepik-generator__prompt">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt"
            disabled={loading}
          />
        </div>

        <div className="freepik-generator__styling">
          <div className="freepik-generator__styling-row">
            <select
              name="size"
              value={styling.size}
              onChange={handleStylingChange}
              disabled={loading}
            >
              <option value="square_1_1">Square 1:1</option>
              <option value="classic_4_3">Classic 4:3</option>
              <option value="traditional_3_4">Traditional 3:4</option>
              <option value="widescreen_16_9">Widescreen 16:9</option>
              <option value="social_story_9_16">Social Story 9:16</option>
            </select>

            <select
              name="color"
              value={styling.color}
              onChange={handleStylingChange}
              disabled={loading}
            >
              <option value="">Color: None</option>
              <option value="b&w">B&W</option>
              <option value="pastel">Pastel</option>
              <option value="sepia">Sepia</option>
            </select>

            <select
              name="framing"
              value={styling.framing}
              onChange={handleStylingChange}
              disabled={loading}
            >
              <option value="">Framing: None</option>
              <option value="portrait">Portrait</option>
              <option value="macro">Macro</option>
              <option value="panoramic">Panoramic</option>
            </select>

            <select
              name="lightning"
              value={styling.lightning}
              onChange={handleStylingChange}
              disabled={loading}
            >
              <option value="">Lightning: None</option>
              <option value="studio">Studio</option>
              <option value="warm">Warm</option>
            </select>
          </div>

          <div className="freepik-generator__styling-row">
            <select
              name="style"
              value={styling.style}
              onChange={handleStylingChange}
              disabled={loading}
            >
              <option value="">Style: None</option>
              <option value="photo">Photo</option>
              <option value="digital-art">Digital Art</option>
              <option value="illustration">Illustration</option>
              <option value="vector">Vector</option>
            </select>
          </div>
        </div>

        <button
          className="freepik-generator__generate"
          onClick={handleGenerateImage}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {userGeneratedImages.length > 0 && (
        <div className="freepik-generator__previous">
          <div className="freepik-generator__previous-header">
            <h3>Recent Generations</h3>
            <button 
              className="freepik-generator__view-more"
              onClick={() => navigate('/creations')}
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="freepik-generator__previous-grid">
            {userGeneratedImages.slice(0, 4).map((img, index) => (
              <div 
                key={index} 
                className="freepik-generator__previous-item"
                onClick={() => {
                  navigate('/customize', {
                    state: {
                      image: img.imageUrl,
                      prompt: img.prompt,
                      isCustom: true
                    }
                  });
                }}
              >
                <div className="freepik-generator__previous-image">
                  <img src={img.imageUrl} alt={img.prompt} />
                </div>
                <p className="freepik-generator__previous-prompt">{img.prompt}</p>
                <span className="freepik-generator__previous-date">
                  {new Date(img.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="freepik-generator-modal">
          <div className="freepik-generator-modal-content">
            <div className="freepik-generator-modal-header">
              <h5>Vision</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                ×
              </button>
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
                          disabled={customizing}
                        >
                          Edit Vision
                        </button>
                        <button
                          type="button"
                          className="btn btn-info"
                          onClick={() => handleCustomize(selectedImage)}
                          disabled={customizing}
                        >
                          {customizing ? (
                            <div className="freepik-generator__customizing">
                              <img 
                                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMiwyM2E5LjYzLDkuNjMsMCwwLDEtOC05LjUsOS41MSw5LjUxLDAsMCwxLDYuNzktOS4xQTEuNjYsMS42NiwwLDAsMCwxMiwyLjgxaDBhMS42NywxLjY3LDAsMCwwLTEuOTQtMS42NEExMSwxMSwwLDAsMCwxMiwyM1oiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgZHVyPSIwLjc1cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHR5cGU9InJvdGF0ZSIgdmFsdWVzPSIwIDEyIDEyOzM2MCAxMiAxMiIvPjwvcGF0aD48L3N2Zz4=" 
                                alt="Loading"
                                className="freepik-generator__spinner"
                              />
                              <span>Generating Image...</span>
                            </div>
                          ) : 'Customize'}
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
        <div className="freepik-generator__error">
          {error}
        </div>
      )}
    </div>
  );
};

export default FreepikImageGenerator;