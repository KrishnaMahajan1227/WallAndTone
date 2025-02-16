import React, { createContext, useState } from 'react';

const WishlistContext = createContext();

const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  return (
    <WishlistContext.Provider value={{ wishlist, setWishlist, wishlistCount, setWishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};

export { WishlistProvider, WishlistContext };