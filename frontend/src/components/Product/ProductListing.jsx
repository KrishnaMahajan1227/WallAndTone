import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Offcanvas, Accordion, Button, Dropdown, Modal } from 'react-bootstrap';
import heartIcon from '../../assets/icons/heart-icon.svg';
import heartIconFilled from '../../assets/icons/heart-icon-filled.svg';
import filtericon from '../../assets/icons/filter-icon.png';
import sorticon from '../../assets/icons/sort-icon.svg';
import { WishlistContext } from '../Wishlist/WishlistContext';
import ListingSEO from './ListingSEO'; // adjust the path as needed

import './ProductListing.css';

// Grouped options (colors, categories, medium, rooms)
const groupedColorOptions = { /* ... as defined ... */ };
const groupedCategoryOptions = { /* ... as defined ... */ };
const groupedMediumOptions = { /* ... as defined ... */ };
const groupedRoomOptions = { /* ... as defined ... */ };

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
  const [sortOption, setSortOption] = useState('');

  // Group selection states for filters.
  const [selectedColorGroups, setSelectedColorGroups] = useState([]);
  const [selectedCategoryGroups, setSelectedCategoryGroups] = useState([]);
  const [selectedOrientations, setSelectedOrientations] = useState([]);
  const [selectedMediumGroups, setSelectedMediumGroups] = useState([]);
  const [selectedRoomGroups, setSelectedRoomGroups] = useState([]);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  const orientationOptions = ['Portrait', 'Landscape', 'Square'];

  // Sync query parameters
  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    const orientationParam = qp.get('orientation')
      ? qp.get('orientation').split(',').map(s => s.trim())
      : [];
    setSelectedOrientations(orientationParam);

    const mediumParam = qp.get('medium')
      ? qp.get('medium').split(',').map(s => s.trim())
      : [];
    const mediumGroups = [];
    Object.keys(groupedMediumOptions).forEach(group => {
      const groupValues = groupedMediumOptions[group];
      if (groupValues.some(val => mediumParam.includes(val))) {
        mediumGroups.push(group);
      }
    });
    setSelectedMediumGroups(mediumGroups);

    const roomsParam = qp.get('rooms')
      ? qp.get('rooms').split(',').map(s => s.trim())
      : [];
    const roomGroups = [];
    Object.keys(groupedRoomOptions).forEach(group => {
      const groupValues = groupedRoomOptions[group];
      if (groupValues.some(val => roomsParam.includes(val))) {
        roomGroups.push(group);
      }
    });
    setSelectedRoomGroups(roomGroups);
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `${apiUrl}/api/products`;
        if (location.search) url += location.search;
        const response = await fetch(url, { method: 'GET' });
        const data = await response.json();
        if (!data || !Array.isArray(data)) throw new Error('Invalid data received');
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
          if (!wishlistData || !Array.isArray(wishlistData.items))
            throw new Error('Invalid wishlist data received');
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

  // Sorting function
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

  // Login popup functions for listing actions
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
      if (!response.ok) throw new Error('Failed to add product to wishlist');
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
      if (!response.ok) throw new Error('Failed to remove product from wishlist');
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

  // Offcanvas handlers
  const handleShowFilterOffcanvas = () => setShowFilterOffcanvas(true);
  const handleCloseFilterOffcanvas = () => setShowFilterOffcanvas(false);

  // Generic checkbox change for Orientation.
  const handleCheckboxChange = (setter, selected, value) => {
    if (selected.includes(value)) {
      setter(selected.filter(item => item !== value));
    } else {
      setter([...selected, value]);
    }
  };

  // Group toggles for Colors, Categories, Medium, and Rooms.
  const toggleColorGroup = (group) => {
    if (selectedColorGroups.includes(group)) {
      setSelectedColorGroups(selectedColorGroups.filter(g => g !== group));
    } else {
      setSelectedColorGroups([...selectedColorGroups, group]);
    }
  };
  const toggleCategoryGroup = (group) => {
    if (selectedCategoryGroups.includes(group)) {
      setSelectedCategoryGroups(selectedCategoryGroups.filter(g => g !== group));
    } else {
      setSelectedCategoryGroups([...selectedCategoryGroups, group]);
    }
  };
  const toggleMediumGroup = (group) => {
    if (selectedMediumGroups.includes(group)) {
      setSelectedMediumGroups(selectedMediumGroups.filter(g => g !== group));
    } else {
      setSelectedMediumGroups([...selectedMediumGroups, group]);
    }
  };
  const toggleRoomGroup = (group) => {
    if (selectedRoomGroups.includes(group)) {
      setSelectedRoomGroups(selectedRoomGroups.filter(g => g !== group));
    } else {
      setSelectedRoomGroups([...selectedRoomGroups, group]);
    }
  };

  // When "View Result" is clicked, build query string from group selections.
  const handleViewResult = () => {
    const queryParams = new URLSearchParams();
    if (selectedColorGroups.length > 0) {
      const allColors = selectedColorGroups.reduce((acc, group) => acc.concat(groupedColorOptions[group]), []);
      queryParams.set('colors', allColors.join(','));
    }
    if (selectedOrientations.length > 0) queryParams.set('orientation', selectedOrientations.join(','));
    if (selectedCategoryGroups.length > 0) {
      const allCats = selectedCategoryGroups.reduce((acc, group) => acc.concat(groupedCategoryOptions[group]), []);
      queryParams.set('categories', allCats.join(','));
    }
    if (selectedMediumGroups.length > 0) {
      const allMediums = selectedMediumGroups.reduce((acc, group) => acc.concat(groupedMediumOptions[group]), []);
      queryParams.set('medium', allMediums.join(','));
    }
    if (selectedRoomGroups.length > 0) {
      const allRooms = selectedRoomGroups.reduce((acc, group) => acc.concat(groupedRoomOptions[group]), []);
      queryParams.set('rooms', allRooms.join(','));
    }
    navigate({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
    setShowFilterOffcanvas(false);
  };

  const handleClearSelection = () => {
    setSelectedColorGroups([]);
    setSelectedCategoryGroups([]);
    setSelectedOrientations([]);
    setSelectedMediumGroups([]);
    setSelectedRoomGroups([]);
    navigate({ pathname: location.pathname, search: '' });
  };

  // Render active filter summary with a "Clear All" button.
  const renderFilterSummary = () => {
    const qp = new URLSearchParams(location.search);
    const activeOrientations = qp.get('orientation') ? qp.get('orientation').split(',') : [];
    const filters = [];
    selectedColorGroups.forEach(group => filters.push({ type: 'Color', value: group }));
    activeOrientations.forEach(ori => filters.push({ type: 'Orientation', value: ori }));
    selectedCategoryGroups.forEach(group => filters.push({ type: 'Category', value: group }));
    selectedMediumGroups.forEach(group => filters.push({ type: 'Medium', value: group }));
    selectedRoomGroups.forEach(group => filters.push({ type: 'Room', value: group }));
    if (filters.length === 0) return null;
    return (
      <div className="filter-summary d-flex flex-wrap align-items-center my-3">
        {filters.map((filter, index) => (
          <div key={index} className="filter-chip d-flex align-items-center me-2">
            <span className="filter-chip-label">{filter.value}</span>
            <button
              className="filter-chip-remove btn btn-link p-0 ms-1"
              onClick={() => removeFilterValue(filter.type, filter.value)}
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

  const removeFilterValue = (filterType, value) => {
    if (filterType === 'Color') {
      const newGroups = selectedColorGroups.filter(item => item !== value);
      setSelectedColorGroups(newGroups);
      const allColors = newGroups.reduce((acc, group) => acc.concat(groupedColorOptions[group]), []);
      const qp = new URLSearchParams(location.search);
      if (allColors.length > 0) qp.set('colors', allColors.join(','));
      else qp.delete('colors');
      navigate({ pathname: location.pathname, search: qp.toString() });
    } else if (filterType === 'Orientation') {
      const newOris = selectedOrientations.filter(item => item !== value);
      setSelectedOrientations(newOris);
      const qp = new URLSearchParams(location.search);
      if (newOris.length > 0) qp.set('orientation', newOris.join(','));
      else qp.delete('orientation');
      navigate({ pathname: location.pathname, search: qp.toString() });
    } else if (filterType === 'Category') {
      const newGroups = selectedCategoryGroups.filter(item => item !== value);
      setSelectedCategoryGroups(newGroups);
      const allCats = newGroups.reduce((acc, group) => acc.concat(groupedCategoryOptions[group]), []);
      const qp = new URLSearchParams(location.search);
      if (allCats.length > 0) qp.set('categories', allCats.join(','));
      else qp.delete('categories');
      navigate({ pathname: location.pathname, search: qp.toString() });
    } else if (filterType === 'Medium') {
      const newGroups = selectedMediumGroups.filter(item => item !== value);
      setSelectedMediumGroups(newGroups);
      const allMediums = newGroups.reduce((acc, group) => acc.concat(groupedMediumOptions[group]), []);
      const qp = new URLSearchParams(location.search);
      if (allMediums.length > 0) qp.set('medium', allMediums.join(','));
      else qp.delete('medium');
      navigate({ pathname: location.pathname, search: qp.toString() });
    } else if (filterType === 'Room') {
      const newGroups = selectedRoomGroups.filter(item => item !== value);
      setSelectedRoomGroups(newGroups);
      const allRooms = newGroups.reduce((acc, group) => acc.concat(groupedRoomOptions[group]), []);
      const qp = new URLSearchParams(location.search);
      if (allRooms.length > 0) qp.set('rooms', allRooms.join(','));
      else qp.delete('rooms');
      navigate({ pathname: location.pathname, search: qp.toString() });
    }
  };

  // renderProductCard for listing
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
            if (wishlist && wishlist.some(item => item.productId && item.productId._id === product._id)) {
              handleRemoveFromWishlist(product);
            } else {
              handleAddToWishlist(product);
            }
          }}
        >
          <img
            src={
              wishlist && wishlist.some(item => item.productId && item.productId._id === product._id)
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

  // renderProductRows definition
  const renderProductRows = () => {
    const sortedProducts = sortProducts(products);
    const rows = [];
    let remainingProducts = [...sortedProducts];
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

  if (loading)
    return (
      <div className="text-center d-flex justify-content-center my-5 ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path
            fill="#2F231F"
            d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z"
          >
            <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" />
          </path>
        </svg>
      </div>
    );
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="product-listing container">
      {/* SEO Meta Tags for the listing page */}
      <ListingSEO />
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
                  {Object.keys(groupedColorOptions).map(group => (
                    <div key={group} className="filter-option-item">
                      <input
                        type="checkbox"
                        id={`color-group-${group}`}
                        value={group}
                        checked={selectedColorGroups.includes(group)}
                        onChange={() => toggleColorGroup(group)}
                      />
                      <label htmlFor={`color-group-${group}`}>{group}</label>
                    </div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>

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
                        onChange={() => toggleCategoryGroup(group)}
                      />
                      <label htmlFor={`category-group-${group}`}>{group}</label>
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
                        onChange={() => toggleMediumGroup(group)}
                      />
                      <label htmlFor={`medium-group-${group}`}>{group}</label>
                    </div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>

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
                        onChange={() => toggleRoomGroup(group)}
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
          <Button variant="primary" onClick={handleViewResult} className="ms-2">
            View Result
          </Button>
        </div>
      </Offcanvas>

      {/* Top Navigation Section */}
      <div className="shop-navigation">
        <div className="category-buttons d-flex align-items-center gap-2">
          <button className="category-button active d-flex" onClick={handleShowFilterOffcanvas}>
            <img src={filtericon} alt="Filter-Icon" />
            <p>Filters By</p>
          </button>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="sort-dropdown" className="product-sorting d-flex align-items-center">
              <img src={sorticon} alt="sort-icon" /><p className="m-0"> Sort By: </p>
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

      {/* Active Filter Summary */}
      {renderFilterSummary()}

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="all-products-container">{renderProductRows()}</div>
      ) : (
        <div className="text-center my-5">No products found.</div>
      )}

      {/* Login Popup Modal */}
      <Modal show={showAuthPopup} onHide={handleAuthPopupClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please login to perform this action.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleAuthLogin}>
            Login
          </Button>
          <Button variant="secondary" onClick={handleAuthPopupClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductListing;
