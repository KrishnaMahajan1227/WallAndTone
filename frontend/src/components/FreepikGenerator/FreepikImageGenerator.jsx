// frontend/FreepikImageGenerator.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, X, Sparkles, Lock } from 'lucide-react';
import './FreepikImageGenerator.css';
import { Helmet } from 'react-helmet';

const FreepikImageGenerator = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : 'https://wallandtone.com');
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [userGeneratedImages, setUserGeneratedImages] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Refs for prompt input and slider container.
  const promptInputRef = useRef(null);
  const sliderRef = useRef(null);

  // Styling state.
  const [styling, setStyling] = useState({
    size: 'traditional_3_4',
    style: '', // Allowed: photo, digital-art, anime, painting, fantasy
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageDetails, setShowImageDetails] = useState(false);
  const [remainingPrompts, setRemainingPrompts] = useState(10);
  const [showPromptLimitModal, setShowPromptLimitModal] = useState(false);

  // First-visit welcome modal.
  const [showWelcomeModal, setShowWelcomeModal] = useState(
    !localStorage.getItem('visitedFreepik')
  );

  // Slider options for style selection (placeholder removed).
  const styleOptions = [
    { value: 'photo', label: 'Photo', image: '/assets/photo-style.png' },
    { value: 'digital-art', label: 'Digital Art', image: '/assets/digital-art-style.png' },
    { value: 'anime', label: 'Anime', image: '/assets/anime-style.png' },
    { value: 'painting', label: 'Painting', image: '/assets/painting-style.png' },
    { value: 'fantasy', label: 'Fantasy', image: '/assets/fantasy-style.png' },
  ];

  // Compute orientation based on selected size.
  const computeOrientation = (size) => {
    switch (size) {
      case 'traditional_3_4':
        return 'portrait';
      case 'classic_4_3':
        return 'landscape';
      default:
        return 'portrait';
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserGeneratedImages();
      fetchRemainingPrompts();
    }
  }, [token]);

  const fetchRemainingPrompts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/prompts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const prompts =
        response.data.remainingPrompts === undefined ||
        response.data.remainingPrompts === null
          ? 10
          : Number(response.data.remainingPrompts);
      setRemainingPrompts(prompts);
    } catch (err) {
      console.error('Error fetching remaining prompts:', err);
      setRemainingPrompts(10);
    }
  };

  const fetchUserGeneratedImages = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/users/generated-images`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedImages = response.data.images.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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
    if (remainingPrompts <= 0) {
      setShowPromptLimitModal(true);
      return;
    }
    try {
      await axios.post(
        `${apiUrl}/api/prompts/use-prompt`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRemainingPrompts((prev) => (typeof prev === 'number' ? prev - 1 : 0));
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg && msg.includes('Prompt limit exceeded')) {
        setShowPromptLimitModal(true);
      } else {
        setError(msg || 'Failed to decrement prompt count');
      }
      return;
    }

    setLoading(true);
    setError(null);
    const orientation = computeOrientation(styling.size);
    try {
      const response = await axios.post(
        `${apiUrl}/api/freepik/generate-image`,
        { prompt, styling, orientation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.images && response.data.images.length > 0) {
        setGeneratedImages(response.data.images);
        setShowModal(true);
        document.body.classList.add('no-scroll');
        for (const image of response.data.images) {
          await axios.post(
            `${apiUrl}/api/users/generated-images`,
            { image, prompt },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        fetchUserGeneratedImages();
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
    setShowModal(false);
    setShowImageDetails(false);
    setSelectedImage(null);
    document.body.classList.remove('no-scroll');
    setTimeout(() => {
      promptInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      promptInputRef.current?.querySelector('input')?.focus();
    }, 100);
  };

  const handleCustomize = async (image) => {
    try {
      setCustomizing(true);
      let existingImage = userGeneratedImages.find((img) => img.imageUrl === image);
      if (!existingImage) {
        const base64Data = image.split(',')[1];
        const chunkSize = 5 * 1024 * 1024;
        const chunks = [];
        for (let i = 0; i < base64Data.length; i += chunkSize) {
          chunks.push(base64Data.slice(i, i + chunkSize));
        }
        for (let i = 0; i < chunks.length; i++) {
          const response = await axios.post(
            `${apiUrl}/api/users/generated-images/chunk`,
            {
              image: chunks[i],
              prompt,
              chunkIndex: i,
              totalChunks: chunks.length,
              isLastChunk: i === chunks.length - 1,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.data.image && i === chunks.length - 1) {
            existingImage = response.data.image;
          }
        }
        await fetchUserGeneratedImages();
      }
      if (existingImage) {
        const orientation = computeOrientation(styling.size);
        navigate('/customize', {
          state: {
            image: existingImage.imageUrl,
            prompt: existingImage.prompt,
            isCustom: true,
            styling,
            orientation,
          },
        });
      } else {
        throw new Error('Image saving failed, unable to proceed with customization.');
      }
    } catch (error) {
      console.error('Error handling customization:', error);
      setError('Failed to process image for customization.');
    } finally {
      setCustomizing(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchasePrompts = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }
    try {
      const orderResponse = await axios.post(
        `${apiUrl}/api/prompt-payment/create-prompt-order`,
        { amount: 5000, currency: 'INR' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const order = orderResponse.data.order;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Wall & Tone',
        description: 'Purchase additional prompts',
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              `${apiUrl}/api/prompt-payment/verify-prompt-payment`,
              {
                razorpay_order_id: order.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setRemainingPrompts(verifyResponse.data.remainingPrompts);
            alert('Payment successful! Your prompts have been updated.');
          } catch (err) {
            console.error('Payment verification failed', err);
            alert('Payment verification failed. Please try again.');
          }
        },
        prefill: { email: '' },
        theme: { color: '#3399cc' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error initiating payment', err);
      alert('Failed to initiate payment. Please try again.');
    }
    setShowPromptLimitModal(false);
  };

  const closePromptLimitModal = () => {
    setShowPromptLimitModal(false);
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('visitedFreepik', 'true');
  };

  // Slider arrow handlers.
  const handlePrevSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };
  const handleNextSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  return (
    <div className="freepik-generator">
      <Helmet>
        <title>AI Image Generator | Wall & Tone</title>
        <meta
          name="description"
          content="Create unique AI-generated art with Wall & Tone's AI Image Generator. Transform your ideas into stunning art prints and customize your vision effortlessly."
        />
        <meta name="keywords" content="AI image generator, AI art, wall art, custom art, art generator, Wall & Tone" />
        <link rel="canonical" href="https://wallandtone.com/freepik-generator" />
        <meta property="og:title" content="AImage Generator | Wall & Tone" />
        <meta
          property="og:description"
          content="Create unique AI-generated art with Wall & Tone's AI Image Generator. Transform your ideas into stunning art prints and customize your vision effortlessly."
        />
        <meta property="og:image" content="https://wallandtone.com/assets/og-freepik.jpg" />
        <meta property="og:url" content="https://wallandtone.com/Ai Creation" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Image Generator | Wall & Tone" />
        <meta
          name="twitter:description"
          content="Create unique AI-generated art with Wall & Tone's AI Image Generator. Transform your ideas into stunning art prints and customize your vision effortlessly."
        />
        <meta name="twitter:image" content="https://wallandtone.com/assets/og-freepik.jpg" />
      </Helmet>

      {showWelcomeModal && (
        <div className="freepik-generator-welcome-modal">
          <div className="freepik-generator-welcome-modal-content">
            <button
              className="freepik-generator-welcome-modal-close"
              onClick={handleCloseWelcomeModal}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <div className="freepik-generator-welcome-modal-header">
              <div className="freepik-generator-welcome-modal-icon">
                <Sparkles size={32} />
              </div>
              <h2>Unlock AI Creation Magic!</h2>
              <div className="freepik-generator-welcome-modal-subheader">
                <Lock size={16} />
                <span>Exclusive Feature</span>
              </div>
            </div>
            <div className="freepik-generator-welcome-modal-body">
              <p>
                To get the appropriate results please elaborate the details of everything you want to see in your artwork.
              </p>
              <p>
                For example: A portrait of a middle-aged Nigerian woman with gold hoop earrings and a vibrant gele headwrap.
              </p>
              <p>You have 10 free prompts. You can buy more once the limit exceeds!</p>
            </div>
            <div className="freepik-generator-welcome-modal-buttons">
              <button className="freepik-btn-primary" onClick={handleCloseWelcomeModal}>
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="freepik-generator__header">
        <h1>AI Art generator by Wall & Tone</h1>
        <p>Use the power of limitless imagination to curate your own unique art prints!</p>
      </div>

      <div className="freepik-generator__form" ref={promptInputRef}>
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
          {/* Slider Section */}
          <div className="slider-container">
            <button className="slider-arrow prev" onClick={handlePrevSlide}>
              &#10094;
            </button>
            <div className="style-slider" ref={sliderRef}>
              {styleOptions.map((option) => (
                <div
                  key={option.value}
                  className={`style-slider-item ${styling.style === option.value ? 'selected' : ''}`}
                  onClick={() => setStyling({ ...styling, style: option.value })}
                >
                  <img src={option.image} alt={option.label} />
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
            <button className="slider-arrow next" onClick={handleNextSlide}>
              &#10095;
            </button>
          </div>

          {/* Orientation Dropdown & Generate Button */}
          <div className="action-container">
            <select name="size" value={styling.size} onChange={handleStylingChange} disabled={loading}>
              <option value="">Select Orientation</option>
              <option value="traditional_3_4">Portrait</option>
              <option value="classic_4_3">Landscape</option>
            </select>
            <button className="freepik-generator__generate" onClick={handleGenerateImage} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Image'}
            </button>
          </div>
        </div>
      </div>

      {userGeneratedImages.length > 0 && (
        <div className="freepik-generator__previous">
          <div className="freepik-generator__previous-header">
            <h3>Recent Generations</h3>
            <button className="freepik-generator__view-more" onClick={() => navigate('/profile', { state: { tab: 'myRoom' } })}>
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
                      isCustom: true,
                      styling,
                      orientation: computeOrientation(styling.size),
                    },
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
              <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close">
                ×
              </button>
            </div>
            {showImageDetails ? (
              <div className="freepik-generator-modal-body">
                <div className="row">
                  <div className="col-md-4">
                    {selectedImage && <img src={selectedImage} alt="Selected" className="img-fluid" />}
                  </div>
                  <div className="col-md-8">
                    <p>{prompt}</p>
                    <div className="row">
                      <div className="col-md-12 action-btns">
                        <button type="button" className="btn btn-warning me-2" onClick={handleEditVision} disabled={customizing}>
                          Edit Vision
                        </button>
                        <button type="button" className="btn btn-info" onClick={() => handleCustomize(selectedImage)} disabled={customizing}>
                          {customizing ? (
                            <div className="freepik-generator__customizing">
                              <img
                                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xMiwyM2E5LjYzLDkuNjMsMCwwLDEtOC05LjUsOS41MSw5LjUxLDAsMCwxLDYuNzktOS4xQTEuNjYsMS42NiwwLDAsMCwxMiwyM1oiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgZHVyPSIwLjc1cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHR5cGU9InJvdGF0ZSIgdmFsdWVzPSIwIDEyIDEyOzM2MCAxMiAxMiIvPjwvcGF0aD48L3N2Zz4="
                                alt="Loading"
                                className="freepik-generator__spinner"
                              />
                              <span>Generating...</span>
                            </div>
                          ) : (
                            'Customize'
                          )}
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
                    <div className="col-md-4 mb-4 col-sm12" key={index}>
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

      {showPromptLimitModal && (
        <div className="freepik-generator-modal">
          <div className="freepik-generator-modal-content">
            <div className="freepik-generator-modal-header">
              <h5>Prompt Limit Reached</h5>
              <button type="button" className="btn-close" onClick={closePromptLimitModal} aria-label="Close">
                ×
              </button>
            </div>
            <div className="freepik-generator-modal-body">
              <p>You have exceeded your free prompt limit. Please pay Rs.50 to purchase additional prompts.</p>
              <button type="button" className="btn btn-primary" onClick={handlePurchasePrompts}>
                Purchase Prompts for Rs.50
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="freepik-generator__error">{error}</div>}
    </div>
  );
};

export default FreepikImageGenerator;
