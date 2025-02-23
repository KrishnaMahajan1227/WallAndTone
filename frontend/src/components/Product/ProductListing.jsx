import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Offcanvas, Accordion, Button, Alert } from 'react-bootstrap';
import heartIcon from '../../assets/icons/heart-icon.svg';
import heartIconFilled from '../../assets/icons/heart-icon-filled.svg';
import { WishlistContext } from '../Wishlist/WishlistContext';

import './ProductListing.css';
import Footer from '../Footer/Footer';

const ProductListing = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : 'https://wallandtone.com');

  const { wishlistCount, setWishlistCount } = useContext(WishlistContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistAlert, setWishlistAlert] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authAction, setAuthAction] = useState(null);
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);

  // States for filter selections (used when offcanvas is open)
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedOrientations, setSelectedOrientations] = useState([]);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  // Filter options
  const colorOptions = [
    'Black', 'White', 'Gold', 'Gray', 'Pink', 'Green', 'Orange', 'Red', 'Blue',
    'Beige', 'Brown', 'Yellow', 'Purple', 'Neon Green', 'Soft Pastels', 'Earth Tones',
    'Muted Tones', 'Cool Tones', 'Fiery Orange', 'Deep Blue', 'Silver', 'Peach',
    'Coral', 'Lavender', 'Dark Green', 'Light Brown', 'Terracotta', 'Navy',
    'Dusty Rose', 'Indigo', 'Sepia', 'Red Chalk'
  ];

  const categoryOptions = [
    'Abstract', 'Surrealism', 'Expressionism', 'Minimalist', 'Fluid Art',
    'Optical Art', 'Nature Art', 'Botanical', 'Seascape', 'Wildlife', 'Scenic',
    'Marine Art', 'Animal Portraits', 'Birds', 'Fantasy Creatures', 'Cityscape',
    'Urban Art', 'Landmark', 'Classical Architecture', 'Figurative', 'Portraits',
    'Classical Art', 'Realism', 'Ukiyo-e', 'Renaissance', 'Baroque',
    'Impressionism', 'Post-Impressionism', 'Space Art', 'Cyberpunk', 'Steampunk',
    'Futuristic', 'Retro-Futurism', 'Religious Art', 'Mandalas', 'Symbolism',
    'Calligraphy', 'Fine Art Photography', 'Black & White', 'Conceptual Photography',
    'Digital Illustration', 'Pop Art', 'Vintage', 'Whimsical', 'Caricature',
    'Cartoon', 'Modern Art', 'Geometric', 'Contemporary', 'Modernism',
    'Hand-Drawn', 'Calligraphy', 'Text Art', 'Line Art', 'Food Art', 'Gourmet',
    'Drinks', 'Classic Still Life', 'Asian Art', 'Ukiyo-e', 'Tribal', 'Cultural Paintings',
    'Love & Romance', 'Seasonal Art', 'Nautical'
  ];

  const orientationOptions = ['Portrait', 'Landscape', 'Square'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Use backend filtering via query parameters from the URL.
        let url = `${apiUrl}/api/products`;
        if (location.search) {
          url += location.search;
        }
        const response = await fetch(url, { method: 'GET' });
        const data = await response.json();
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid data received');
        }
        // Update wishlist status for each product.
        const updatedProducts = data.map(product => ({
          ...product,
          inWishlist: wishlist.some(item => item.productId && item.productId._id === product._id)
        }));
        setProducts(updatedProducts);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      if (token) {
        try {
          const wishlistResponse = await fetch(`${apiUrl}/api/wishlist`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
          const wishlistData = await wishlistResponse.json();
          if (!wishlistData || !Array.isArray(wishlistData.items)) {
            throw new Error('Invalid wishlist data received');
          }
          const wishlist = wishlistData.items || [];
          setWishlist(wishlist);
          setWishlistCount(wishlist.length);
        } catch (error) {
          console.error('Error fetching wishlist:', error.message);
          setWishlistCount(0);
        }
      } else {
        setWishlistCount(0);
      }
    };

    fetchProducts();
    fetchWishlist();
  }, [location.search, token]);

  useEffect(() => {
    setWishlistCount(wishlist.length);
  }, [wishlist]);

  const handleAuthRequired = (action) => {
    setAuthAction(() => action);
    setShowAuthPopup(true);
  };

  const handleAuthPopupClose = () => {
    setShowAuthPopup(false);
    setAuthAction(null);
  };

  const handleAuthLogin = () => {
    setShowAuthPopup(false);
    navigate('/login');
  };

  const handleAddToWishlist = async (product) => {
    if (!product || !product._id) return;
    if (!token) {
      handleAuthRequired(() => handleAddToWishlist(product));
      return;
    }
    const productInWishlist = wishlist.some(item => item.productId && item.productId._id === product._id);
    if (productInWishlist) {
      setWishlistAlert(true);
      setTimeout(() => setWishlistAlert(false), 3000);
      return;
    }
    const updatedWishlist = [...wishlist, { productId: product }];
    setWishlist(updatedWishlist);
    setWishlistCount(updatedWishlist.length);
    try {
      const response = await fetch(`${apiUrl}/api/wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });
      if (!response.ok) {
        throw new Error('Failed to add product to wishlist');
      }
      const updatedProducts = products.map(p =>
        p._id === product._id ? { ...p, inWishlist: true } : p
      );
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error adding product to wishlist:', error);
      setWishlist(wishlist);
      setWishlistCount(wishlist.length);
      setWishlistAlert('Failed to add product to wishlist. Please try again.');
    }
  };

  const handleRemoveFromWishlist = async (product) => {
    if (!product || !product._id) return;
    const updatedWishlist = wishlist.filter(item => item.productId && item.productId._id !== product._id);
    setWishlist(updatedWishlist);
    setWishlistCount(updatedWishlist.length);
    try {
      const response = await fetch(`${apiUrl}/api/wishlist/remove/${product._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to remove product from wishlist');
      }
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
      setWishlist(wishlist);
      setWishlistCount(wishlist.length);
      setWishlistAlert('Failed to remove product from wishlist. Please try again.');
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Offcanvas handlers for the filter panel
  const handleShowFilterOffcanvas = () => setShowFilterOffcanvas(true);
  const handleCloseFilterOffcanvas = () => setShowFilterOffcanvas(false);

  // Generic checkbox change handler for the offcanvas filters
  const handleCheckboxChange = (setter, selected, value) => {
    if (selected.includes(value)) {
      setter(selected.filter(item => item !== value));
    } else {
      setter([...selected, value]);
    }
  };

  // When "View Result" is clicked, build query string and update URL
  const handleViewResult = () => {
    const queryParams = new URLSearchParams();
    if (selectedColors.length > 0) queryParams.set('colors', selectedColors.join(','));
    if (selectedCategories.length > 0) queryParams.set('categories', selectedCategories.join(','));
    if (selectedOrientations.length > 0) queryParams.set('orientation', selectedOrientations.join(','));
    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
    setShowFilterOffcanvas(false);
  };

  const handleClearSelection = () => {
    setSelectedColors([]);
    setSelectedCategories([]);
    setSelectedOrientations([]);
  };

  // Render the active filter summary from the URL's query string.
  const renderFilterSummary = () => {
    const queryParams = new URLSearchParams(location.search);
    const activeColors = queryParams.get('colors') ? queryParams.get('colors').split(',') : [];
    const activeCategories = queryParams.get('categories') ? queryParams.get('categories').split(',') : [];
    const activeOrientations = queryParams.get('orientation') ? queryParams.get('orientation').split(',') : [];
    const filters = [];
    activeColors.forEach(color => filters.push({ type: 'color', value: color }));
    activeCategories.forEach(cat => filters.push({ type: 'category', value: cat }));
    activeOrientations.forEach(ori => filters.push({ type: 'orientation', value: ori }));
    if (filters.length === 0) return null;
    return (
      <div className="filter-summary d-flex flex-wrap align-items-center my-3 container">
        {filters.map((filter, index) => (
          <div key={index} className="filter-chip d-flex align-items-center">
            <span className="filter-chip-label">{filter.value}</span>
            <button className="filter-chip-remove btn btn-link p-0 ms-1" onClick={() => removeFilterValue(filter.type, filter.value)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Remove a single filter value and update the URL accordingly.
  const removeFilterValue = (filterType, value) => {
    // Map filterType to the corresponding query parameter key.
    let key = filterType;
    if (filterType === 'color') key = 'colors';
    if (filterType === 'category') key = 'categories';
    // For orientation, the key remains 'orientation'.
    const queryParams = new URLSearchParams(location.search);
    let currentValues = queryParams.get(key) ? queryParams.get(key).split(',') : [];
    currentValues = currentValues.filter(item => item !== value);
    if (currentValues.length > 0) {
      queryParams.set(key, currentValues.join(','));
    } else {
      queryParams.delete(key);
    }
    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  };

  if (loading)
    return (
      <div className="text-center d-flex justify-content-center my-5">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="#2F231F" d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z">
            <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" />
          </path>
        </svg>
      </div>
    );
  if (error) return <div className="alert alert-danger">{error}</div>;

  const renderProductCard = (product, isLarge = false) => (
    <div className={`card product-card h-100 ${isLarge ? 'large-card' : ''}`}>
      <div className="product-image-wrapper position-relative">
        <img
          src={product.mainImage}
          className="card-img-top product-image"
          alt={product.productName}
          onClick={() => handleProductClick(product._id)}
        />
        <div
          className="wishlist-icon position-absolute"
          onClick={(e) => {
            e.stopPropagation();
            if (
              wishlist &&
              wishlist.some(item => item.productId && item.productId._id === product._id)
            ) {
              handleRemoveFromWishlist(product);
            } else {
              handleAddToWishlist(product);
            }
          }}
        >
          <img
            src={
              wishlist &&
              wishlist.some(item => item.productId && item.productId._id === product._id)
                ? heartIconFilled
                : heartIcon
            }
            alt="Heart Icon"
          />
        </div>
      </div>
      <div className="card-body text-center d-flex flex-column">
        <h5 className="card-title product-title">{product.productName}</h5>
        <p className="card-text text-muted">{product.description.slice(0, isLarge ? 150 : 100)}...</p>
        <p className="card-text text-muted">Starting From Rs {product.startFromPrice}/-</p>
      </div>
    </div>
  );

  const renderProductRows = () => {
    const rows = [];
    let remainingProducts = [...products];
    while (remainingProducts.length >= 7) {
      const regularProducts = remainingProducts.slice(0, 6);
      const featuredProduct = remainingProducts[6];
      const isEvenRow = rows.length % 2 === 0;
      rows.push(
        <div key={rows.length} className={`products-container mb-4 ${isEvenRow ? 'featured-right' : 'featured-left'}`}>
          {isEvenRow ? (
            <>
              <div className="regular-products">
                {regularProducts.map(product =>
                  product && product._id ? (
                    <div key={product._id} className="regular-product-item">
                      {renderProductCard(product)}
                    </div>
                  ) : null
                )}
              </div>
              <div className="featured-product">
                {renderProductCard(featuredProduct, true)}
              </div>
            </>
          ) : (
            <>
              <div className="featured-product">
                {renderProductCard(featuredProduct, true)}
              </div>
              <div className="regular-products">
                {regularProducts.map(product =>
                  product && product._id ? (
                    <div key={product._id} className="regular-product-item">
                      {renderProductCard(product)}
                    </div>
                  ) : null
                )}
              </div>
            </>
          )}
        </div>
      );
      remainingProducts = remainingProducts.slice(7);
    }
    if (remainingProducts.length > 0) {
      rows.push(
        <div key="remaining" className="remaining-products-container mb-4">
          {remainingProducts.map(product =>
            product && product._id ? (
              <div key={product._id} className="remaining-product-item">
                {renderProductCard(product)}
              </div>
            ) : null
          )}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="product-listing container">
      {/* Authentication Popup remains unchanged */}

      {/* Filter Offcanvas */}
      <Offcanvas
        show={showFilterOffcanvas}
        onHide={handleCloseFilterOffcanvas}
        placement="start"
        className="custom-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filter Options</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Colors</Accordion.Header>
              <Accordion.Body>
                <div className="filter-options-list">
                  {colorOptions.map(color => (
                    <div key={color} className="filter-option-item">
                      <input
                        type="checkbox"
                        id={`color-${color}`}
                        value={color}
                        checked={selectedColors.includes(color)}
                        onChange={() => handleCheckboxChange(setSelectedColors, selectedColors, color)}
                      />
                      <label htmlFor={`color-${color}`}>{color}</label>
                    </div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Categories</Accordion.Header>
              <Accordion.Body>
                <div className="filter-options-list">
                  {categoryOptions.map(cat => (
                    <div key={cat} className="filter-option-item">
                      <input
                        type="checkbox"
                        id={`category-${cat}`}
                        value={cat}
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCheckboxChange(setSelectedCategories, selectedCategories, cat)}
                      />
                      <label htmlFor={`category-${cat}`}>{cat}</label>
                    </div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Orientation</Accordion.Header>
              <Accordion.Body>
                <div className="filter-options-list">
                  {orientationOptions.map(ori => (
                    <div key={ori} className="filter-option-item">
                      <input
                        type="checkbox"
                        id={`orientation-${ori}`}
                        value={ori}
                        checked={selectedOrientations.includes(ori)}
                        onChange={() => handleCheckboxChange(setSelectedOrientations, selectedOrientations, ori)}
                      />
                      <label htmlFor={`orientation-${ori}`}>{ori}</label>
                    </div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Offcanvas.Body>
        <div className="offcanvas-footer px-3 py-2">
          <Button variant="secondary" onClick={handleClearSelection}>
            Clear Selection
          </Button>
          <Button variant="primary" onClick={handleViewResult} className="ms-2">
            View Result
          </Button>
        </div>
      </Offcanvas>

      {/* Top Navigation Section */}
      <div className="shop-navigation">
        <div className="nav-buttons">
          <button className="shop-by-room">Shop by Room</button>
          <span className="nav-link btn">Wall Colour</span>
          <span className="nav-link btn">Categories</span>
          <span className="nav-link btn">Number of Posters</span>
        </div>
        <hr className="divider" />
        <div className="category-buttons">
          <button className="category-button active" onClick={handleShowFilterOffcanvas}>
            Filters By
          </button>
          <button className="category-button active">Living Room</button>
          <button className="category-button">Bedroom</button>
          <button className="category-button">Kitchen</button>
          <button className="category-button">Balcony</button>
        </div>
      </div>

{/* Active Filter Summary */}
{renderFilterSummary()}

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="all-products-container">{renderProductRows()}</div>
      ) : (
        <div className="text-center my-5">No products found.</div>
      )}

      <Footer />
    </div>
  );
};

export default ProductListing;
