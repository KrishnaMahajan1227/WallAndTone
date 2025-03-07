import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import SearchSuggestions from './SearchSuggestions';
import ImageContentComponent from '../ImageContentComponent/ImageContentComponent';
import './search.css';
import ForBusinessesBulkOrdersB2B from '../../assets/searchPage/For-Businesses-Bulk-Orders-B2B.png';
import ForHomePersonalSpacesB2C from '../../assets/searchPage/For-Home-Personal-Spaces-B2C.png';
import { useMediaQuery } from "react-responsive";

// Grouped Category Options
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
  "Thematic & Seasonal": ["Love & Romance", "Seasonal Art", "Nautical", "Marine Art"]
};

const Search = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://wallandtone.com');

  const [searchQuery, setSearchQuery] = useState('');
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Fetch suggestions whenever the search query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      axios.get(`${apiUrl}/api/search/suggestions?q=${searchQuery}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then(response => {
        // Randomize and slice suggestions to 10
        const shuffled = [...response.data].sort(() => Math.random() - 0.5);
        setProductSuggestions(shuffled.slice(0, 10));
        setShowSuggestions(true);
      })
      .catch(error => {
        console.error('Error fetching suggestions:', error);
      });

      // Filter category keys that include the search term (case-insensitive)
      const matchingCategories = Object.keys(groupedCategoryOptions).filter(group =>
        group.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setCategorySuggestions(matchingCategories.slice(0, 10));
    } else {
      setProductSuggestions([]);
      setCategorySuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, token, apiUrl]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to products page with search query as parameter
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleSuggestionSelect = (product) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${product._id}`);
  };

  // When a category suggestion is clicked, navigate to products with that category filter
  const handleCategorySelect = (group) => {
    const categories = groupedCategoryOptions[group];
    const queryParams = new URLSearchParams();
    queryParams.set('categories', categories.join(','));
    navigate(`/products?${queryParams.toString()}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  return (
    <div className="search-container">
      {/* SEO Meta Tags for Search Page */}
      <Helmet>
        <title>Search Products | Wall & Tone</title>
        <meta 
          name="description" 
          content="Find the perfect wall art for your space using Wall & Tone's advanced search. Discover curated collections of modern, abstract, and classic art pieces." 
        />
        <meta 
          name="keywords" 
          content="search wall art, find art, wall decor search, modern art, abstract art, art collections" 
        />
        <link rel="canonical" href="https://wallandtone.com/search" />
        {/* Open Graph Tags */}
        <meta property="og:title" content="Search Products | Wall & Tone" />
        <meta property="og:description" content="Find the perfect wall art for your space using Wall & Tone's advanced search. Discover curated collections of modern, abstract, and classic art pieces." />
        <meta property="og:image" content="https://wallandtone.com/assets/og-search.jpg" />
        <meta property="og:url" content="https://wallandtone.com/search" />
        <meta property="og:type" content="website" />
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Search Products | Wall & Tone" />
        <meta name="twitter:description" content="Find the perfect wall art for your space using Wall & Tone's advanced search." />
        <meta name="twitter:image" content="https://wallandtone.com/assets/og-search.jpg" />
      </Helmet>
      <div className="search-bar">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>
      {/* Display Grouped Category Options below the search bar */}
      <div className="grouped-category-container search-page">
        {Object.keys(groupedCategoryOptions).map((group) => (
          <button 
            key={group}
            onClick={() => {
              // Use existing handleCategoryClick logic
              const categories = groupedCategoryOptions[group];
              const queryParams = new URLSearchParams();
              queryParams.set('categories', categories.join(','));
              navigate(`/products?${queryParams.toString()}`);
            }}
            className="grouped-category-button search-page"
          >
            {group}
          </button>
        ))}
      </div>
      {showSuggestions && (productSuggestions.length > 0 || categorySuggestions.length > 0) && (
        <div className="search-suggestions">
          <SearchSuggestions 
            productSuggestions={productSuggestions}
            categorySuggestions={categorySuggestions}
            onSelectProduct={handleSuggestionSelect}
            onSelectCategory={handleCategorySelect}
          />
        </div>
      )}

      <section className="search-perfect-art-your-space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10 col-12">
              <div className="content">
                <h2>Find the Perfect Art for Your Space</h2>
                <p>
                  Picking the right artwork is like choosing the perfect playlist—it should match your vibe! 
                  Whether you're looking for bold statement pieces or subtle elegance, we've got a curated 
                  collection that fits every mood, style, and space.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="image-content">
        <ImageContentComponent
          image={ForHomePersonalSpacesB2C}
          heading="For Home & Personal Spaces (B2C)"
          description="Your walls deserve personality! Whether it’s your cozy living room, a sleek workspace, or a dreamy bedroom, we make finding the right art effortless. Browse, pick, and get it delivered—hassle-free. Need help? Our art experts are just a message away!"
          ctaText="Explore our Collection"
          ctaLink="#"
        />

        <ImageContentComponent
          image={ForBusinessesBulkOrdersB2B}
          heading="For Businesses & Bulk Orders (B2B)"
          description="Interior Designers, Architects, builders, hotels, offices, retail spaces and more—we help businesses create unforgettable atmospheres with curated art collections. 
          Need custom sizes, bulk orders, or exclusive designs? We’ve got you covered. We get you the best prices and make your space stand out!"
          ctaText="Discover More"
          ctaLink="#"
          reverse={!isMobile ? "yes" : "yes"}
        />
      </div>
    </div>
  );
};

export default Search;
