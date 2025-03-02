// ListingSEO.jsx
import React from 'react';
import { Helmet } from 'react-helmet';

const ListingSEO = ({ products = [] }) => {
  // Map over your products to create a ListItem array.
  // Each list item includes the position and the URL (and optionally, the product name)
  const itemList = products.map((product, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "url": `https://wallandtone.com/product/${product._id}`,
    "name": product.productName
  }));

  // Construct the JSON-LD for an ItemList
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": itemList
  };

  return (
    <Helmet>
      <title>Our Products | WallAndTone</title>
      <meta name="description" content="Browse our exclusive collection of wall art and decor." />
      <meta name="keywords" content="wall art, modern decor, abstract art, living room decor" />
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

export default ListingSEO;
