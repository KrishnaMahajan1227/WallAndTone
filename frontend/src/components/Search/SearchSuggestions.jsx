import React from 'react';
import { Link } from 'react-router-dom';
import './SearchSuggestions.css';

const SearchSuggestions = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="search-suggestions-container">
      {suggestions.map((product) => (
        <Link 
          key={product._id} 
          to={`/product/${product._id}`}
          className="suggestion-item"
          onClick={() => onSelect(product)}
        >
          <div className="suggestion-content">
            <img 
              src={product.mainImage} 
              alt={product.productName} 
              className="suggestion-image"
            />
            <div className="suggestion-details">
              <span className="suggestion-name">{product.productName}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SearchSuggestions;
