import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Offcanvas, Accordion, Button, Dropdown, Modal, Pagination } from 'react-bootstrap';
import HistoryDropdown from '../History/HistoryDropdown';
import { WishlistContext } from '../Wishlist/WishlistContext';
import heartIcon from '../../assets/icons/heart-icon.svg';
import heartIconFilled from '../../assets/icons/heart-icon-filled.svg';
import filtericon from '../../assets/icons/filter-icon.png';
import sorticon from '../../assets/icons/sort-icon.svg';
import ListingSEO from './ListingSEO';
import './ProductListing.css';
import { X, Sparkles, Lock, ArrowRight, Heart } from "lucide-react";

// Grouped Options
const groupedColorOptions = {
  "Black & White": ["Black", "White", "Gray / Grey", "Silver"],
  "Blue Tones": ["Blue", "Navy Blue", "Dark Blue", "Teal", "Aqua"],
  "Green Tones": ["Green", "Dark Green", "Light Green", "Neon Green"],
  "Red & Warm Tones": ["Red", "Fiery Orange", "Soft Red", "Warm Browns", "Terracotta"],
  "Earthy & Neutral Tones": ["Earth Tones", "Beige / Warm Beige", "Brown / Light Brown / Dark Brown", "Cream"],
  "Pastel & Soft Tones": ["Pastel Pink", "Soft Pink", "Soft Orange", "Soft Gold", "Soft Yellow"],
  "Yellow & Gold Tones": ["Yellow", "Mustard", "Golden Yellow", "Gold / Soft Gold"],
  "Pink & Purple Tones": ["Pink", "Lavender", "Mauve", "Purple"],
  "Orange & Coral Tones": ["Orange", "Peach", "Coral", "Soft Orange"],
  "Mixed & Multi-Color Tones": ["Multi-color", "Neon Colors (Neon Blue, Neon Green, Neon Pink)", "Cool Tones", "Warm Tones"]
};

const groupedCategoryOptions = {
  "Abstract & Conceptual": ["Abstract Art", "Surrealism", "Expressionism", "Minimalist", "Fluid Art", "Optical Art"],
  "Nature & Landscape": ["Nature Art", "Botanical", "Seascape", "Wildlife", "Scenic", "Marine Art"],
  "Animals & Creatures": ["Animal Portraits", "Birds", "Wildlife", "Fantasy Creatures"],
  "City & Architecture": ["Cityscape", "Urban Art", "Landmark", "Classical Architecture"],
  "People & Portraits": ["Figurative", "Portraits", "Classical Art", "Realism", "Ukiyo-e"],
  "Classic & Fine Art": ["Renaissance", "Baroque", "Impressionism", "Post-Impressionism", "Realism"],
  "Fantasy & Sci-Fi": ["Space Art", "Cyberpunk", "Steampunk", "Futuristic", "Retro-Futurism"],
  "Spiritual & Symbolic": ["Religious Art", "Mandalas", "Symbolism", "Calligraphy"],
  "Photography & Digital Art": ["Fine Art Photography", "Black & White", "Conceptual Photography", "Digital Illustration"],
  "Pop & Retro Culture": ["Pop Art", "Vintage", "Whimsical", "Caricature", "Cartoon"],
  "Modern & Contemporary": ["Modern Art", "Geometric", "Contemporary", "Modernism"],
  "Illustration & Typography": ["Hand-Drawn", "Calligraphy", "Text Art", "Line Art"],
  "Still Life & Food": ["Food Art", "Gourmet", "Drinks", "Classic Still Life"],
  "Traditional & Cultural Art": ["Asian Art", "Ukiyo-e", "Tribal", "Cultural Paintings"],
  "Thematic & Seasonal": ["Love & Romance", "Seasonal Art", "Nautical"]
};

const groupedMediumOptions = {
  "Paintings": [
    "Acrylic Painting",
    "Oil Painting",
    "Watercolor Painting",
    "Cubist Painting",
    "Fresco"
  ],
  "Drawings & Illustrations": [
    "Ink Drawing / Illustration / Sketch",
    "Charcoal Drawing",
    "Chalk Drawing",
    "Pencil Drawing / Sketch",
    "Hand-Drawn Illustration"
  ],
  "Digital & Mixed Media": [
    "Digital Painting",
    "Digital Illustration / Drawing",
    "Digital Mixed Media",
    "3D Digital Art / Illustration",
    "Digital Photography",
    "Digital Print"
  ],
  "Prints & Photography": [
    "Canvas Print",
    "Photography / Photography Print",
    "Woodblock Print / Woodcut Print",
    "Printmaking",
    "Printed Art"
  ],
  "Mixed & Experimental Media": [
    "Mixed Media",
    "Ink & Watercolor",
    "Painting (Oil or Acrylic)",
    "Sketch & Mixed Media"
  ]
};

const groupedRoomOptions = {
  "Living Spaces": [
    "Living Room",
    "Cozy Living Room",
    "Luxury Living Room",
    "Lounge"
  ],
  "Bedrooms & Personal Spaces": [
    "Bedroom",
    "Contemporary Bedroom",
    "Cozy Bedroom",
    "Tranquil Bedroom",
    "Nursery"
  ],
  "Work & Creative Spaces": [
    "Office / Workspace",
    "Art Studio",
    "Creative Studio",
    "Library & Study Room",
    "Music Room"
  ],
  "Dining & Hospitality Spaces": [
    "Dining Room",
    "Kitchen",
    "Café & Coffee Shop",
    "Bar & Lounge",
    "Hotel & Lobby"
  ],
  "Wellness & Leisure Spaces": [
    "Yoga & Meditation Room",
    "Spa & Relaxation Space",
    "Gym",
    "Zen Garden",
    "Outdoor & Nature-Inspired Spaces"
  ]
};

const orientationOptions = ['Portrait', 'Landscape', 'Square'];

// ---------- ProductCard Component ----------
const ProductCard = React.memo(({
  product,
  isLarge = false,
  wishlist,
  handleAddToWishlist,
  handleRemoveFromWishlist
}) => {
  const [hovered, setHovered] = useState(false);
  const transitionDuration = 500;

  const randomMockup = React.useMemo(() => {
    if (!product.subFrameImages || product.subFrameImages.length === 0) return null;
    const mockupImages = product.subFrameImages.filter(imgObj =>
      imgObj.imageUrl &&
      typeof imgObj.imageUrl === 'string' &&
      imgObj.imageUrl.toLowerCase().includes('mockup')
    );
    if (mockupImages.length === 0) return null;
    return mockupImages[Math.floor(Math.random() * mockupImages.length)].imageUrl;
  }, [product.subFrameImages]);

  return (
    <Link to={`/product/${product._id}`} className="product-card-link">
      <div className={`card product-card h-100 ${isLarge ? 'large-card' : ''}`}>
        <div
          className="product-image-wrapper position-relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            overflow: 'hidden',
            willChange: 'opacity, transform'
          }}
        >
          <img
            src={product.mainImage}
            loading="lazy"
            className="card-img-top product-image"
            alt={product.productName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: `opacity ${transitionDuration}ms ease`,
              opacity: hovered && randomMockup ? 0 : 1,
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
          {randomMockup && (
            <img
              src={randomMockup}
              loading="lazy"
              alt={`${product.productName} Mockup`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: `opacity ${transitionDuration}ms ease`,
                opacity: hovered ? 1 : 0
              }}
            />
          )}
          <div
            className="wishlist-icon position-absolute"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const isInWishlist = wishlist && wishlist.some(
                item => item.productId && item.productId._id === product._id
              );
              if (isInWishlist) {
                handleRemoveFromWishlist(product);
              } else {
                handleAddToWishlist(product);
              }
            }}
          >
            <img
              src={
                wishlist && wishlist.some(
                  item => item.productId && item.productId._id === product._id
                )
                  ? heartIconFilled
                  : heartIcon
              }
              alt="Heart Icon"
            />
          </div>
        </div>
        <div className="card-body text-center d-flex flex-column">
          <h5 className="card-title product-title">{product.productName}</h5>
          <p className="card-text text-muted">
            Starting From Rs {product.startFromPrice}/-
          </p>
        </div>
      </div>
    </Link>
  );
});

// ---------- ProductListing Component ----------
const ProductListing = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : 'https://wallandtone.com');

  const { wishlist, setWishlist } = useContext(WishlistContext);
  const [products, setProducts] = useState([]);
  const [randomizedProducts, setRandomizedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistAlert, setWishlistAlert] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authAction, setAuthAction] = useState(null);
  const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);
  const [sortOption, setSortOption] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 50;

  // Filter states
  const [selectedColorGroups, setSelectedColorGroups] = useState([]);
  const [selectedCategoryGroups, setSelectedCategoryGroups] = useState([]);
  const [selectedOrientations, setSelectedOrientations] = useState([]);
  const [selectedMediumGroups, setSelectedMediumGroups] = useState([]);
  const [selectedRoomGroups, setSelectedRoomGroups] = useState([]);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  // On mount: initialize filter state from URL (only once)
  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    if (qp.get('orientation')) {
      setSelectedOrientations(qp.get('orientation').split(',').map(s => s.trim()));
    }
    if (qp.get('medium')) {
      const medArr = qp.get('medium').split(',').map(s => s.trim());
      const mediumGroups = [];
      Object.keys(groupedMediumOptions).forEach(group => {
        const groupValues = groupedMediumOptions[group];
        if (groupValues.some(val => medArr.includes(val))) {
          mediumGroups.push(group);
        }
      });
      setSelectedMediumGroups(mediumGroups);
    }
    if (qp.get('rooms')) {
      const roomArr = qp.get('rooms').split(',').map(s => s.trim());
      const roomGroups = [];
      Object.keys(groupedRoomOptions).forEach(group => {
        const groupValues = groupedRoomOptions[group];
        if (groupValues.some(val => roomArr.includes(val))) {
          roomGroups.push(group);
        }
      });
      setSelectedRoomGroups(roomGroups);
    }
    if (qp.get('colors')) {
      const colorArr = qp.get('colors').split(',').map(s => s.trim());
      const colorGroups = [];
      Object.keys(groupedColorOptions).forEach(group => {
        const groupValues = groupedColorOptions[group];
        if (groupValues.some(val => colorArr.includes(val))) {
          colorGroups.push(group);
        }
      });
      setSelectedColorGroups(colorGroups);
    }
    if (qp.get('categories')) {
      const catArr = qp.get('categories').split(',').map(s => s.trim());
      const categoryGroups = [];
      Object.keys(groupedCategoryOptions).forEach(group => {
        const groupValues = groupedCategoryOptions[group];
        if (groupValues.some(val => catArr.includes(val))) {
          categoryGroups.push(group);
        }
      });
      setSelectedCategoryGroups(categoryGroups);
    }
  }, [location.search]);

  // Compute the filter query string from filter state
  const filterQuery = (() => {
    const colors = selectedColorGroups.reduce((acc, group) => acc.concat(groupedColorOptions[group]), []);
    const categories = selectedCategoryGroups.reduce((acc, group) => acc.concat(groupedCategoryOptions[group]), []);
    const qp = new URLSearchParams();
    if (colors.length > 0) qp.set('colors', colors.join(','));
    if (selectedOrientations.length > 0) qp.set('orientation', selectedOrientations.join(','));
    if (categories.length > 0) qp.set('categories', categories.join(','));
    if (selectedMediumGroups.length > 0) qp.set('medium', selectedMediumGroups.join(','));
    if (selectedRoomGroups.length > 0) qp.set('rooms', selectedRoomGroups.join(','));
    return qp.toString();
  })();

  // When filter state changes, update the URL and immediately fetch products
  useEffect(() => {
    setCurrentPage(1); // Reset to first page on filter change
    navigate({ pathname: location.pathname, search: filterQuery }, { replace: true });
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `${apiUrl}/api/products`;
        if (filterQuery) url += '?' + filterQuery;
        const response = await fetch(url);
        const data = await response.json();
        if (!data || !Array.isArray(data)) throw new Error('Invalid data received');
        setProducts(data);
        // Shuffle only once per fetch to retain the same random order thereafter
        setRandomizedProducts(shuffleArray(sortProducts(data)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filterQuery, apiUrl, location.pathname, navigate]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (token) {
        try {
          const wishlistResponse = await fetch(`${apiUrl}/api/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const wishlistData = await wishlistResponse.json();
          if (!wishlistData || !Array.isArray(wishlistData.items))
            throw new Error('Invalid wishlist data received');
          setWishlist(wishlistData.items || []);
        } catch (err) {
          console.error('Error fetching wishlist:', err.message);
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    };
    fetchWishlist();
  }, [location.search, token, apiUrl, setWishlist]);

  // Update inWishlist flag for products when wishlist changes
  useEffect(() => {
    if (products.length > 0) {
      const updatedProducts = products.map(product => ({
        ...product,
        inWishlist: wishlist.some(item => item.productId && item.productId._id === product._id)
      }));
      setProducts(updatedProducts);
    }
  }, [wishlist, products]);

  const sortProducts = (productsArray) => {
    let sorted = [...productsArray];
    if (sortOption === 'alphabetical') {
      sorted.sort((a, b) => a.productName.localeCompare(b.productName));
    } else if (sortOption === 'priceLowHigh') {
      sorted.sort((a, b) => a.startFromPrice - b.startFromPrice);
    } else if (sortOption === 'priceHighLow') {
      sorted.sort((a, b) => b.startFromPrice - a.startFromPrice);
    } else if (sortOption === 'newArrivals') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  };

  // Shuffle function using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Authentication popup functions
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

  // Wishlist actions
  const handleAddToWishlist = async (product) => {
    if (!product || !product._id) return;
    if (!token) {
      handleAuthRequired(() => handleAddToWishlist(product));
      return;
    }
    if (wishlist.some(item => item.productId && item.productId._id === product._id)) {
      setWishlistAlert(true);
      setTimeout(() => setWishlistAlert(false), 3000);
      return;
    }
    const updatedWishlist = [...wishlist, { productId: product }];
    setWishlist(updatedWishlist);
    try {
      const response = await fetch(`${apiUrl}/api/wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });
      if (!response.ok) throw new Error('Failed to add product to wishlist');
      const updatedProducts = products.map(p =>
        p._id === product._id ? { ...p, inWishlist: true } : p
      );
      setProducts(updatedProducts);
    } catch (err) {
      console.error('Error adding product to wishlist:', err);
      setWishlist(wishlist);
    }
  };

  const handleRemoveFromWishlist = async (product) => {
    if (!product || !product._id) return;
    const updatedWishlist = wishlist.filter(
      item => item.productId && item.productId._id !== product._id
    );
    setWishlist(updatedWishlist);
    try {
      const response = await fetch(`${apiUrl}/api/wishlist/remove/${product._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to remove product from wishlist');
    } catch (err) {
      console.error('Error removing product from wishlist:', err);
      setWishlist(wishlist);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Offcanvas handlers
  const handleShowFilterOffcanvas = () => setShowFilterOffcanvas(true);
  const handleCloseFilterOffcanvas = () => setShowFilterOffcanvas(false);

  // Generic checkbox change helper
  const handleCheckboxChange = (setter, selected, value) => {
    if (selected.includes(value)) {
      setter(selected.filter(item => item !== value));
    } else {
      setter([...selected, value]);
    }
  };

  // When a filter chip is removed
  const removeFilterValue = (filterType, value) => {
    if (filterType === 'Color') {
      setSelectedColorGroups(prev => prev.filter(item => item !== value));
    } else if (filterType === 'Orientation') {
      setSelectedOrientations(prev => prev.filter(item => item !== value));
    } else if (filterType === 'Category') {
      setSelectedCategoryGroups(prev => prev.filter(item => item !== value));
    } else if (filterType === 'Medium') {
      setSelectedMediumGroups(prev => prev.filter(item => item !== value));
    } else if (filterType === 'Room') {
      setSelectedRoomGroups(prev => prev.filter(item => item !== value));
    }
  };

  const handleClearSelection = () => {
    setSelectedColorGroups([]);
    setSelectedCategoryGroups([]);
    setSelectedOrientations([]);
    setSelectedMediumGroups([]);
    setSelectedRoomGroups([]);
    navigate({ pathname: location.pathname, search: '' }, { replace: true });
  };

  // Render filter summary as chips
  const renderFilterSummary = () => {
    const chips = [];
    selectedColorGroups.forEach(group => chips.push({ type: 'Color', value: group }));
    selectedOrientations.forEach(ori => chips.push({ type: 'Orientation', value: ori }));
    selectedCategoryGroups.forEach(group => chips.push({ type: 'Category', value: group }));
    selectedMediumGroups.forEach(group => chips.push({ type: 'Medium', value: group }));
    selectedRoomGroups.forEach(group => chips.push({ type: 'Room', value: group }));

    if (chips.length === 0) return null;
    return (
      <div className="filter-summary d-flex flex-wrap align-items-center my-3">
        {chips.map((chip, index) => (
          <div key={index} className="filter-chip d-flex align-items-center me-2">
            <span className="filter-chip-label">{chip.value}</span>
            <button
              className="filter-chip-remove btn btn-link p-0 ms-1"
              onClick={() => removeFilterValue(chip.type, chip.value)}
            >
              &times;
            </button>
          </div>
        ))}
        <button className="btn btn-outline-secondary btn-sm ms-2" onClick={handleClearSelection}>
          Clear All
        </button>
      </div>
    );
  };

  // New renderProductRows now accepts a productList parameter (assumed sorted and paginated)
  const renderProductRows = (productList) => {
    const rows = [];
    let remainingProducts = [...productList];
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
                      <ProductCard
                        product={product}
                        handleProductClick={handleProductClick}
                        wishlist={wishlist}
                        handleAddToWishlist={handleAddToWishlist}
                        handleRemoveFromWishlist={handleRemoveFromWishlist}
                      />
                    </div>
                  ) : null
                )}
              </div>
              <div className="featured-product">
                <ProductCard
                  product={featuredProduct}
                  isLarge={true}
                  handleProductClick={handleProductClick}
                  wishlist={wishlist}
                  handleAddToWishlist={handleAddToWishlist}
                  handleRemoveFromWishlist={handleRemoveFromWishlist}
                />
              </div>
            </>
          ) : (
            <>
              <div className="featured-product">
                <ProductCard
                  product={featuredProduct}
                  isLarge={true}
                  handleProductClick={handleProductClick}
                  wishlist={wishlist}
                  handleAddToWishlist={handleAddToWishlist}
                  handleRemoveFromWishlist={handleRemoveFromWishlist}
                />
              </div>
              <div className="regular-products">
                {regularProducts.map(product =>
                  product && product._id ? (
                    <div key={product._id} className="regular-product-item">
                      <ProductCard
                        product={product}
                        handleProductClick={handleProductClick}
                        wishlist={wishlist}
                        handleAddToWishlist={handleAddToWishlist}
                        handleRemoveFromWishlist={handleRemoveFromWishlist}
                      />
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
                <ProductCard
                  product={product}
                  handleProductClick={handleProductClick}
                  wishlist={wishlist}
                  handleAddToWishlist={handleAddToWishlist}
                  handleRemoveFromWishlist={handleRemoveFromWishlist}
                />
              </div>
            ) : null
          )}
        </div>
      );
    }
    return rows;
  };

  if (loading)
    return (
      <div className="loader text-center d-flex justify-content-center my-5 h-100vh">
        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24">
          <path fill="#2F231F" d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z">
            <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" />
          </path>
        </svg>
      </div>
    );
  if (error) return <div className="alert alert-danger">{error}</div>;

  // applyFilters simply closes the offcanvas (filtering happens immediately)
  const applyFilters = () => {
    setShowFilterOffcanvas(false);
  };

  // Pagination logic with randomized products stored in state
  const totalProducts = randomizedProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const displayedProducts = randomizedProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  // Pagination controls
  const renderPagination = () => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
          {number}
        </Pagination.Item>
      );
    }
    return (
      <Pagination className="justify-content-center my-4">
        <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} />
        {items}
        <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} />
      </Pagination>
    );
  };

  return (
    <div className="product-listing container">
      <ListingSEO />
      <Offcanvas show={showFilterOffcanvas} onHide={handleCloseFilterOffcanvas} placement="start" className="custom-offcanvas">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filter Options</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Accordion defaultActiveKey="0" flush>
            {/* Colors */}
            <Accordion.Item eventKey="0">
              <Accordion.Header>Colors</Accordion.Header>
              <Accordion.Body>
                <div className="filter-options-list">
                  {Object.keys(groupedColorOptions).map(group => (
                    <div key={group} className="filter-option-item">
                      <input
                        type="checkbox"
                        id={`color-group-${group}`}
                        value={group}
                        checked={selectedColorGroups.includes(group)}
                        onChange={() => {
                          if (selectedColorGroups.includes(group)) {
                            setSelectedColorGroups(prev => prev.filter(g => g !== group));
                          } else {
                            setSelectedColorGroups(prev => [...prev, group]);
                          }
                        }}
                      />
                      <label htmlFor={`color-group-${group}`}>{group}</label>
                    </div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>
            {/* Categories */}
            <Accordion.Item eventKey="1">
              <Accordion.Header>Categories</Accordion.Header>
              <Accordion.Body>
                <div className="filter-options-list">
                  {Object.keys(groupedCategoryOptions).map(group => (
                    <div key={group} className="filter-option-item">
                      <input
                        type="checkbox"
                        id={`category-group-${group}`}
                        value={group}
                        checked={selectedCategoryGroups.includes(group)}
                        onChange={() => {
                          if (selectedCategoryGroups.includes(group)) {
                            setSelectedCategoryGroups(prev => prev.filter(g => g !== group));
                          } else {
                            setSelectedCategoryGroups(prev => [...prev, group]);
                          }
                        }}
                      />
                      <label htmlFor={`category-group-${group}`}>{group}</label>
                    </div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>
            {/* Orientation */}
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
                        onChange={() =>
                          handleCheckboxChange(setSelectedOrientations, selectedOrientations, ori)
                        }
                      />
                      <label htmlFor={`orientation-${ori}`}>{ori}</label>
                    </div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>
            {/* Medium */}
            <Accordion.Item eventKey="3">
              <Accordion.Header>Medium</Accordion.Header>
              <Accordion.Body>
                <div className="filter-options-list">
                  {Object.keys(groupedMediumOptions).map(group => (
                    <div key={group} className="filter-option-item">
                      <input
                        type="checkbox"
                        id={`medium-group-${group}`}
                        value={group}
                        checked={selectedMediumGroups.includes(group)}
                        onChange={() => {
                          if (selectedMediumGroups.includes(group)) {
                            setSelectedMediumGroups(prev => prev.filter(g => g !== group));
                          } else {
                            setSelectedMediumGroups(prev => [...prev, group]);
                          }
                        }}
                      />
                      <label htmlFor={`medium-group-${group}`}>{group}</label>
                    </div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>
            {/* Rooms */}
            <Accordion.Item eventKey="4">
              <Accordion.Header>Rooms</Accordion.Header>
              <Accordion.Body>
                <div className="filter-options-list">
                  {Object.keys(groupedRoomOptions).map(group => (
                    <div key={group} className="filter-option-item">
                      <input
                        type="checkbox"
                        id={`room-group-${group}`}
                        value={group}
                        checked={selectedRoomGroups.includes(group)}
                        onChange={() => {
                          if (selectedRoomGroups.includes(group)) {
                            setSelectedRoomGroups(prev => prev.filter(g => g !== group));
                          } else {
                            setSelectedRoomGroups(prev => [...prev, group]);
                          }
                        }}
                      />
                      <label htmlFor={`room-group-${group}`}>{group}</label>
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
          <Button variant="primary" onClick={applyFilters} className="ms-2">
            View Result
          </Button>
        </div>
      </Offcanvas>

      <div className="shop-navigation">
        <div className="category-buttons d-flex align-items-center gap-2">
          <button className="category-button active d-flex" onClick={handleShowFilterOffcanvas}>
            <img src={filtericon} alt="Filter-Icon" />
            <p>Filters By</p>
          </button>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="sort-dropdown" className="product-sorting d-flex align-items-center">
              <img src={sorticon} alt="sort-icon" />
              <p className="m-0"> Sort By: </p>
              {sortOption === ""
                ? "Select"
                : sortOption === "alphabetical"
                ? "Alphabetical A-Z"
                : sortOption === "priceLowHigh"
                ? "Price Low-high"
                : sortOption === "priceHighLow"
                ? "Price High-Low"
                : sortOption === "newArrivals"
                ? "New Arrivals"
                : ""}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSortOption("alphabetical")}>
                Alphabetical A-Z
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortOption("priceLowHigh")}>
                Price Low-high
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortOption("priceHighLow")}>
                Price High-Low
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortOption("newArrivals")}>
                New Arrivals
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {renderFilterSummary()}

      {products && products.length > 0 ? (
        <>
          <div className="all-products-container">{renderProductRows(displayedProducts)}</div>
          {totalPages > 1 && renderPagination()}
        </>
      ) : (
        <div className="text-center my-5">No products found.</div>
      )}

<Modal
  show={showAuthPopup}
  onHide={handleAuthPopupClose}
  centered
  style={{
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: "1rem",
  }}
>
  <Modal.Header
    closeButton
    style={{
      border: "none",
      backgroundColor: "transparent",
      justifyContent: "center",
      position: "relative",
    }}
  >
    <Modal.Title style={{ textAlign: "center", width: "100%" }}>
      Login Required
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p style={{ textAlign: "center" }}>
      Please login to continue.
    </p>
  </Modal.Body>
  <Modal.Footer
    style={{
      display: "flex",
      justifyContent: "center",
      gap: "1rem",
      border: "none",
      backgroundColor: "transparent",
    }}
  >
    <Button
      variant="primary"
      onClick={handleAuthLogin}
      style={{
        backgroundColor: "#5B2EFF",
        color: "#fff",
        border: "none",
        padding: "0.75rem 1.5rem",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Login
    </Button>
    <Button
      variant="secondary"
      onClick={handleAuthPopupClose}
      style={{
        backgroundColor: "#fff",
        color: "#5B2EFF",
        border: "2px solid #5B2EFF",
        padding: "0.75rem 1.5rem",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Cancel
    </Button>
  </Modal.Footer>
</Modal>


    </div>
  );
};

export default ProductListing;
