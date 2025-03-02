// ProductSEO.jsx
import React from 'react';
import { Helmet } from 'react-helmet';

const ProductSEO = ({ product }) => {
  if (!product) return null;
  // Construct title and description using product data
  const title = `${product.productName} | WallAndTone`;
  // Use a portion of the description for meta description (keep it under 160 characters)
  const description = product.description.slice(0, 160);
  // Combine SEO keywords; ensure that shortTailKeywords and longTailKeywords are arrays
  const keywords = [
    product.primaryKeyword,
    ...(Array.isArray(product.shortTailKeywords) ? product.shortTailKeywords : []),
    ...(Array.isArray(product.longTailKeywords) ? product.longTailKeywords : [])
  ].filter(Boolean).join(', ');

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {/* Open Graph / Social Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={product.mainImage} />
      <meta property="og:url" content={`https://wallandtone.com/product/${product._id}`} />
      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.productName,
          "image": [product.mainImage, ...(product.thumbnails || [])],
          "description": product.description,
          "sku": product._id,
          "offers": {
            "@type": "Offer",
            "url": `https://wallandtone.com/product/${product._id}`,
            "priceCurrency": "INR",
            "price": product.startFromPrice,
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating || 0,
            "reviewCount": product.reviews ? product.reviews.length : 0
          }
        })}
      </script>
    </Helmet>
  );
};

export default ProductSEO;
