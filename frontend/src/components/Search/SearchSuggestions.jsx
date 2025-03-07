import React from 'react';
import { Link } from 'react-router-dom';
import './SearchSuggestions.css';

const SearchSuggestions = ({ productSuggestions, categorySuggestions, onSelectProduct, onSelectCategory }) => {
  return (
    <div className="search-suggestions-container">
      {productSuggestions && productSuggestions.length > 0 ? (
        <div className="product-suggestions-grid">
          {productSuggestions.map((product) => (
            <Link 
              key={product._id} 
              to={`/product/${product._id}`}
              className="suggestion-item"
              onClick={() => onSelectProduct(product)}
            >
              <div className="suggestion-content">
                <img 
                  src={product.mainImage} 
                  alt={product.productName} 
                  className="suggestion-image"
                  loading="lazy"
                />
                <div className="suggestion-details">
                  <span className="suggestion-name">{product.productName}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="no-suggestions">
          No related products found.
        </div>
      )}
      {categorySuggestions && categorySuggestions.length > 0 && (
        <div className="category-suggestions">
          <h4 className="suggestion-heading">Categories</h4>
          <div className="category-buttons-grid">
            {categorySuggestions.map((group) => (
              <button 
                key={group}
                className="category-suggestion-button"
                onClick={() => onSelectCategory(group)}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
