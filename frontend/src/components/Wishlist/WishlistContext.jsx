import React, { createContext, useState } from 'react';

const WishlistContext = createContext();

const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Derive the wishlist count directly from the wishlist array length.
  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, setWishlist, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};

export { WishlistProvider, WishlistContext };
