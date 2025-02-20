// Search.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchSuggestions from './SearchSuggestions';
import ImageContentComponent from '../ImageContentComponent/ImageContentComponent';
import './search.css';
import searchImage from '../../assets/searchPage/searchPagebusinesec.png';

const Search = () => {
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
          const response = await axios.get(`http://localhost:8080/api/search/suggestions?q=${query}`, {
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

<div className="image-content">
<ImageContentComponent
  image={searchImage}
  heading="Why its important to have the perfect fit for your business"
        description="Every business tells a story, and the right wall art can help you narrate it perfectly. Whether its a cozy cafe, a sleek office, or a vibrant retail space, we provide frames and designs that align with your unique style. Our Curated collections ensure you get art that resonates with your brand and captivates your audience."
        ctaText="Discover More"
        ctaLink="#"
        />

      <ImageContentComponent
  image={searchImage}
  heading="Wall Art for Offices: Boost Productivity & Style."
        description="Office spaces deserve more than blank walls. Discover how the right wall art can enhance creativity, productivity, and employee morale. From motivational quotes to modern abstract pieces, we offer frames tailored to your office’s aesthetic and culture."
        ctaText="Discover More"
        ctaLink="#"
        reverse={true}
        />
            <ImageContentComponent
  image={searchImage}
  heading="Wall art buying guide for Interior Designers and Architects"
        description="Interior Designers and Architects  know the power of details. The right wall art can be the finishing touch that transforms a space. Discover how we help professionals like you find custom frames and prints that fit perfectly into any design project."
        ctaText="Discover More"
        ctaLink="#"
      />
</div>

    </div>
  );
};

export default Search;