// ListingSEO.jsx
import React from 'react';
import { Helmet } from 'react-helmet';

const ListingSEO = () => {
  return (
    <Helmet>
      <title>Our Products | WallAndTone</title>
      <meta name="description" content="Browse our exclusive collection of wall art and decor." />
      <meta name="keywords" content="wall art, modern decor, abstract art, living room decor" />
      {/* Open Graph and other meta tags can be added here */}
    </Helmet>
  );
};

export default ListingSEO;
