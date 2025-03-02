// Search.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchSuggestions from './SearchSuggestions';
import ImageContentComponent from '../ImageContentComponent/ImageContentComponent';
import './search.css';
import searchperfectartyourspace from '../../assets/searchPage/search-perfect-art-your-space.png';
import ForBusinessesBulkOrdersB2B from '../../assets/searchPage/For-Businesses-Bulk-Orders-B2B.png';
import ForHomePersonalSpacesB2C from '../../assets/searchPage/For-Home-Personal-Spaces-B2C.png';
import { useMediaQuery } from "react-responsive";

const Search = () => {
const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://wallandtone.com');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleSearchInput = async (e) => {
      const query = e.target.value;
      setSearchQuery(query);

      if (query.length >= 2) {
        try {
          const response = await axios.get(`${apiUrl}/api/search/suggestions?q=${query}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setSearchResults(response.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    };

    const inputElement = document.querySelector('.search-input');
    inputElement.addEventListener('input', handleSearchInput);

    return () => {
      inputElement.removeEventListener('input', handleSearchInput);
    };
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleSuggestionSelect = (product) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${product._id}`);
  };
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    
    <div className="search-container">
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
      {showSuggestions && searchResults.length > 0 && (
        <div className="search-suggestions">
          <SearchSuggestions
            suggestions={searchResults}
            onSelect={handleSuggestionSelect}
          />
        </div>
      )}

<section class="search-perfect-art-your-space">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-8 col-md-10 col-12">
                    <div class="content">
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
  reverse={!isMobile ? "yes" : 'yes'} // ✅ Remove reverse on mobile
/>

</div>


    </div>
  );
};

export default Search;