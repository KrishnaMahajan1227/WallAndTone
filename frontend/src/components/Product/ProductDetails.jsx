import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Heart, X } from 'lucide-react';
import { Modal, Button } from 'react-bootstrap';
import heartIcon from '../../assets/icons/heart-icon.svg';
import heartIconFilled from '../../assets/icons/heart-icon-filled.svg';
import ProductSEO from './ProductSEO'; // adjust the path as needed
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProductDetails.css';
import RecentlyAddedProducts from '../RecentlyAddedProducts/RecentlyAddedProducts';
import loaderGif from '../../assets/icons/loader.gif';

const ProductDetails = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : 'https://wallandtone.com');

  const { productId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Responsive handling
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [inputQuantity, setInputQuantity] = useState("1");
  const [activeImage, setActiveImage] = useState('');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [subCartOpen, setSubCartOpen] = useState(false);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [loadingSubFrame, setLoadingSubFrame] = useState(false);
  const [subFrameThumbnails, setSubFrameThumbnails] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [selectedFrameType, setSelectedFrameType] = useState(null);
  const [selectedSubFrameType, setSelectedSubFrameType] = useState(null);

  // SIZE SELECTION: available sizes and selected size
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);

  // Grouping-related state (for non-poster frames)
  const [selectedSizeCategory, setSelectedSizeCategory] = useState("");

  // Guest mode storage
  const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || [];
  const guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];

  // Computed wishlist count (use this in your header or nav component)
  const wishlistCount = wishlist.length;

  // Helper: Determine size category from size name.
  const getSizeCategory = (size) => {
    if (size.name && size.name.includes("x")) {
      const parts = size.name.split("x").map((part) => parseFloat(part.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const maxDim = Math.max(parts[0], parts[1]);
        if (maxDim <= 10) return "Small";
        if (maxDim <= 18) return "Medium";
        if (maxDim <= 30) return "Large";
        return "Extra Large";
      }
    }
    return "Poster";
  };

  // Group sizes by category.
  const groupSizesByCategory = (sizesArray) => {
    return sizesArray.reduce((acc, size) => {
      const category = getSizeCategory(size);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(size);
      return acc;
    }, {});
  };

  const groupedSizes = groupSizesByCategory(sizes);
  const categoryOrder = ["Small", "Medium", "Large", "Extra Large", "Poster"];
  const availableCategories = Object.keys(groupedSizes).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  // Default category selection for non-poster frames.
  const isPosterFrame =
    selectedFrameType && selectedFrameType.name.toLowerCase() === "poster";

  useEffect(() => {
    if (!isPosterFrame && availableCategories.length > 0 && !selectedSizeCategory) {
      setSelectedSizeCategory(availableCategories[0]);
    }
  }, [availableCategories, selectedSizeCategory, isPosterFrame]);

  // Ensure a valid size is selected when the size category changes.
  useEffect(() => {
    if (!isPosterFrame && selectedSizeCategory && groupedSizes[selectedSizeCategory]?.length > 0) {
      const validSize = groupedSizes[selectedSizeCategory].find(
        (s) => s._id === selectedSize?._id
      );
      if (!validSize) {
        setSelectedSize(groupedSizes[selectedSizeCategory][0]);
      }
    }
  }, [selectedSizeCategory, sizes, isPosterFrame, groupedSizes, selectedSize]);

  // For poster frames, auto-select the first available size.
  useEffect(() => {
    if (isPosterFrame && sizes.length > 0 && !selectedSize) {
      setSelectedSize(sizes[0]);
    }
  }, [sizes, isPosterFrame, selectedSize]);

  // Update history
  useEffect(() => {
    const updateHistory = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/products/${productId}`);
        const productData = response.data;
        await axios.post(
          `${apiUrl}/api/history/add`,
          {
            productId: productData._id,
            productName: productData.productName,
            productImage: productData.mainImage,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error updating history:', error);
      }
    };
    if (token) {
      updateHistory();
    }
  }, [productId, token]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/products/${productId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        setProduct(data);
        setActiveImage(data.mainImage);
        setAverageRating(calculateAverageRating(data.reviews || []));
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, token]);

  // Auto select default frame type when product loads
  useEffect(() => {
    if (product && product.frameTypes && product.frameTypes.length > 0 && !selectedFrameType) {
      handleFrameTypeSelect(product.frameTypes[0]);
    }
  }, [product, selectedFrameType]);

  // Reset image loaded state when activeImage changes
  useEffect(() => {
    setImgLoaded(false);
  }, [activeImage]);

  // Fetch wishlist and cart
  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const [wishlistRes, cartRes] = await Promise.all([
            fetch(`${apiUrl}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${apiUrl}/api/cart`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          if (!wishlistRes.ok || !cartRes.ok) throw new Error('Failed to fetch user data');
          const wishlistData = await wishlistRes.json();
          const cartData = await cartRes.json();
          setWishlist(Array.isArray(wishlistData) ? wishlistData : []);
          setCart(Array.isArray(cartData) ? cartData : []);
        } catch (err) {
          console.error('Error fetching user data:', err);
          setWishlist([]);
          setCart([]);
        }
      } else {
        setWishlist(guestWishlist);
        setCart(guestCart);
      }
    };
    fetchUserData();
  }, [token]);

  // Save selections to localStorage
  useEffect(() => {
    if (selectedFrameType && selectedSubFrameType && selectedSize) {
      localStorage.setItem('selectedFrameType', JSON.stringify(selectedFrameType));
      localStorage.setItem('selectedSubFrameType', JSON.stringify(selectedSubFrameType));
      localStorage.setItem('selectedSize', JSON.stringify(selectedSize));
    }
  }, [selectedFrameType, selectedSubFrameType, selectedSize]);

  // When a frame type is selected, fetch its sub-frame types and update available sizes
// Updated handleFrameTypeSelect function
const handleFrameTypeSelect = async (frameType) => {
  try {
    const response = await fetch(`${apiUrl}/api/frame-types/${frameType._id}`);
    if (!response.ok) throw new Error('Failed to fetch frame type details');
    const data = await response.json();
    setSelectedFrameType(data);
    // Reset related selections on frame type change
    setSelectedSubFrameType(null);
    setSelectedSize(null);
    setSelectedSizeCategory(null);
    setSubFrameThumbnails([]);
    
    if (data.frameSizes && Array.isArray(data.frameSizes) && data.frameSizes.length > 0) {
      setSizes(data.frameSizes);
      // For poster frames, select first size directly
      if (data.name.toLowerCase() === "poster") {
        setSelectedSize(data.frameSizes[0]);
      } else {
        // For non-poster frames, group sizes and select first category & size
        const grouped = groupSizesByCategory(data.frameSizes);
        const categories = Object.keys(grouped).sort(
          (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
        );
        if (categories.length > 0) {
          setSelectedSizeCategory(categories[0]);
          setSelectedSize(grouped[categories[0]][0]);
        }
      }
    } else {
      setSizes([]);
      setSelectedSize(null);
    }
  } catch (err) {
    console.error('Error selecting frame type:', err);
    toast.error('Failed to select frame type');
  }
};

// Updated useEffect for fetching sub-frame types and auto-selecting default
useEffect(() => {
  if (selectedFrameType?._id) {
    fetch(`${apiUrl}/api/sub-frame-types/${selectedFrameType._id}`)
      .then(res => res.json())
      .then(data => {
        const subFrameData = Array.isArray(data) ? data : [];
        setSubFrameTypes(subFrameData);
        if (subFrameData.length > 0) {
          // Auto select the first sub-frame type
          handleSubFrameTypeSelect(subFrameData[0]);
        } else {
          // Agar koi sub-frame type na ho to subFrameThumbnails ko clear kar dein
          setSubFrameThumbnails([]);
        }
      })
      .catch(err => {
        console.error('Error fetching sub-frame types:', err);
        toast.error('Failed to load sub-frame types');
      });
  } else {
    setSubFrameTypes([]);
  }
}, [selectedFrameType, apiUrl]);


  // Fetch sub-frame types when selectedFrameType changes
  useEffect(() => {
    if (selectedFrameType?._id) {
      fetch(`${apiUrl}/api/sub-frame-types/${selectedFrameType._id}`)
        .then(res => res.json())
        .then(data => setSubFrameTypes(Array.isArray(data) ? data : []))
        .catch(err => {
          console.error('Error fetching sub-frame types:', err);
          toast.error('Failed to load sub-frame types');
        });
      // Update available sizes from the selected frame type
      if (selectedFrameType.frameSizes && Array.isArray(selectedFrameType.frameSizes)) {
        setSizes(selectedFrameType.frameSizes);
      } else {
        setSizes([]);
        setSelectedSize(null);
      }
    } else {
      setSubFrameTypes([]);
      setSizes([]);
      setSelectedSize(null);
    }
  }, [selectedFrameType, apiUrl]);

  // Auto select default sub-frame type when subFrameTypes are loaded
  useEffect(() => {
    if (selectedFrameType && subFrameTypes && subFrameTypes.length > 0 && !selectedSubFrameType) {
      handleSubFrameTypeSelect(subFrameTypes[0]);
    }
  }, [subFrameTypes, selectedFrameType, selectedSubFrameType]);

  // Reset selections and thumbnails when productId changes (i.e., when a new product is selected from Recommendations)
  useEffect(() => {
    setSelectedFrameType(null);
    setSelectedSubFrameType(null);
    setSelectedSize(null);
    setSizes([]);
    setSubFrameThumbnails([]);
    setActiveImage(''); // Will be updated in fetchProduct
    setInputQuantity("1");
    setQuantity(1);
  }, [productId]);

  // Utility functions
  const calculateAverageRating = (reviews) => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const calculateItemPrice = (item) => {
    if (!item || !item.productId || !item.quantity) return 0;
    const basePrice = parseFloat(item.productId.price) || 0;
    const frameTypePrice = parseFloat(item.frameType?.price) || 0;
    const subFrameTypePrice = parseFloat(item.subFrameType?.price) || 0;
    const sizePrice = parseFloat(item.size?.price) || 0;
    return ((basePrice + frameTypePrice + subFrameTypePrice + sizePrice) * item.quantity).toFixed(2);
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    let total = parseFloat(product.price) || 0;
    if (selectedFrameType?.price) total += parseFloat(selectedFrameType.price);
    if (selectedSubFrameType?.price) total += parseFloat(selectedSubFrameType.price);
    if (selectedSize?.price) total += parseFloat(selectedSize.price);
    return (total * quantity).toFixed(2);
  };

  const handleSubFrameTypeSelect = async (subFrameType) => {
    setSelectedSubFrameType(subFrameType);
    setLoadingSubFrame(true);
    try {
      if (selectedFrameType && selectedFrameType.name.toLowerCase() === "poster") {
        const posterThumbnails = [product.mainImage, ...(subFrameType.images || [])];
        setActiveImage(product.mainImage);
        setSubFrameThumbnails(posterThumbnails);
        return;
      }
  
      let imagesArr = [];
      if (product?.subFrameImages && product.subFrameImages.length > 0) {
        const matchingGroups = product.subFrameImages.filter(
          (group) =>
            group.subFrameType &&
            group.subFrameType.toString() === subFrameType._id.toString()
        );
        matchingGroups.forEach((group) => {
          if (Array.isArray(group.imageUrls) && group.imageUrls.length > 0) {
            imagesArr = imagesArr.concat(group.imageUrls);
          } else if (group.imageUrl) {
            imagesArr.push(group.imageUrl);
          }
        });
      }
  
      // Agar imagesArray abhi bhi khali hai, API se try karein
      if (imagesArr.length === 0) {
        const response = await fetch(
          `${apiUrl}/api/products/${product._id}/subframe-image/${subFrameType._id}`
        );
        // Agar response status 404 hai, toh samajh lo koi subframe image nahi mil rahi, isko error na maano
        if (!response.ok) {
          if (response.status === 404) {
            // Koi subframe image available nahin, imagesArr rehne dein empty
          } else {
            throw new Error(`Error fetching subframe image: ${response.status} ${response.statusText}`);
          }
        } else {
          const data = await response.json();
          if (data.images && Array.isArray(data.images)) {
            imagesArr = data.images;
          }
          if (data.imageUrl) {
            imagesArr.push(data.imageUrl);
          }
        }
      }
  
      imagesArr = [...new Set(imagesArr)];
      const constantSubFrameImages = subFrameType.images || [];
      const updatedThumbnails = [...imagesArr, ...constantSubFrameImages];
  
      if (updatedThumbnails.length > 0) {
        setActiveImage(updatedThumbnails[0]);
      } else {
        setActiveImage(product.mainImage);
      }
      setSubFrameThumbnails(updatedThumbnails);
    } catch (err) {
      // Yahan hum error ko log to karenge par toast error show nahin karenge,
      // kyunki agar API se koi subframe image na aaye, toh hum default images use kar rahe hain.
      setActiveImage(product.mainImage);
      setSubFrameThumbnails(subFrameType.images || []);
      // Optionally, aap niche comment hata kar toast error show kar sakte hain agar chahen:
      // toast.error('Failed to load subframe images');
    } finally {
      setLoadingSubFrame(false);
    }
  };
  

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // Event Handlers
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setInputQuantity("");
    } else {
      const numericValue = Math.max(1, parseInt(value, 10));
      setInputQuantity(numericValue.toString());
      setQuantity(numericValue);
    }
  };

  const handleQuantityBlur = () => {
    if (inputQuantity === "" || isNaN(parseInt(inputQuantity, 10))) {
      setInputQuantity("1");
      setQuantity(1);
    }
  };

  const handleThumbnailClick = (thumbnail) => {
    setActiveImage(thumbnail);
  };

  const handleRatingChange = (rating) => {
    setNewRating(rating);
  };

  const handleImageChange = (e) => {
    setReviewImages(Array.from(e.target.files));
  };

  // Cart and wishlist handlers – require frame type, subframe type, and size
  const handleAddToCart = async () => {
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) {
      toast.error('Please select all required options before adding to cart');
      return;
    }
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    const cartItem = {
      productId: product,
      quantity,
      frameType: selectedFrameType,
      subFrameType: selectedSubFrameType,
      size: selectedSize,
      frameTypeName: selectedFrameType.name,
      subFrameTypeName: selectedSubFrameType.name,
      sizeName: selectedSize.name
    };
    try {
      const response = await fetch(`${apiUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cartItem)
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      setCart(prevCart => [...prevCart, cartItem]);
      toast.success('Product added to cart!');
      setSubCartOpen(true);
    } catch (err) {
      toast.error('Failed to add product to cart');
    }
  };

  const handleAddToWishlist = async (prod = product) => {
    if (!prod || !prod._id) return;
    if (!selectedFrameType || !selectedSubFrameType || !selectedSize) {
      toast.error('Please select all required options before adding to wishlist');
      return;
    }
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    const inWishlist = wishlist.some(
      item => item.productId && item.productId._id === prod._id &&
              item.frameType._id === selectedFrameType?._id &&
              item.subFrameType._id === selectedSubFrameType?._id &&
              item.size._id === selectedSize?._id
    );
    if (inWishlist) {
      handleRemoveFromWishlist(product);
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/api/wishlist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: prod._id,
          frameType: selectedFrameType._id,
          subFrameType: selectedSubFrameType._id,
          size: selectedSize._id
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product to wishlist');
      }
      setWishlist(prev => [
        ...prev,
        {
          productId: prod,
          frameType: selectedFrameType,
          subFrameType: selectedSubFrameType,
          size: selectedSize
        }
      ]);
      toast.success('Added to wishlist!');
    } catch (err) {
      console.error('Error adding product to wishlist:', err);
      toast.error(err.message || 'Failed to update wishlist');
    }
  };
  
  const handleRemoveFromWishlist = async (prod = product) => {
    if (!prod || !prod._id) return;
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/api/wishlist/remove/${prod._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to remove product from wishlist');
      setWishlist(prev =>
        prev.filter(item => item.productId && item.productId._id !== prod._id)
      );
      toast.success('Removed from wishlist!');
    } catch (err) {
      console.error('Error removing product from wishlist:', err);
      toast.error(err.message || 'Failed to remove from wishlist');
    }
  };
  
  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    if (token) {
      try {
        const response = await fetch(
          `${apiUrl}/api/cart/update/${item.productId._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              quantity: newQuantity,
              frameType: item.frameType._id,
              subFrameType: item.subFrameType._id,
              size: item.size._id
            })
          }
        );
        if (!response.ok) throw new Error('Failed to update quantity');
        setCart(prevCart =>
          prevCart.map(cartItem =>
            cartItem.productId._id === item.productId._id
              ? { ...cartItem, quantity: newQuantity }
              : cartItem
          )
        );
        toast.success('Quantity updated successfully!');
      } catch (err) {
        toast.error('Failed to update quantity');
      }
    } else {
      const updatedCart = cart.map(cartItem =>
        cartItem.productId._id === item.productId._id
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
      setCart(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      toast.success('Quantity updated successfully!');
    }
  };

  const handleRemoveFromCart = async (item) => {
    if (token) {
      try {
        const response = await fetch(
          `${apiUrl}/api/cart/remove/${item.productId._id}/${item.frameType._id}/${item.subFrameType._id}/${item.size._id}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!response.ok) throw new Error('Failed to remove item from cart');
        setCart(prevCart =>
          prevCart.filter(
            cartItem =>
              cartItem.productId._id !== item.productId._id ||
              cartItem.frameType._id !== item.frameType._id ||
              cartItem.subFrameType._id !== item.subFrameType._id ||
              cartItem.size._id !== item.size._id
          )
        );
        toast.success('Item removed from cart!');
      } catch (err) {
        toast.error('Failed to remove item from cart');
      }
    } else {
      const updatedCart = cart.filter(
        cartItem =>
          cartItem.productId._id !== item.productId._id ||
          cartItem.frameType._id !== item.frameType._id ||
          cartItem.subFrameType._id !== item.subFrameType._id ||
          cartItem.size._id !== item.size._id
      );
      setCart(updatedCart);
      localStorage.setItem('guestCart', JSON.stringify(updatedCart));
      toast.success('Item removed from cart!');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newRating || !newReview.trim()) {
      toast.error("Rating and comment are required.");
      return;
    }
    const formDataObj = new FormData();
    formDataObj.append("rating", newRating);
    formDataObj.append("comment", newReview);
    if (reviewImages.length > 0) {
      reviewImages.forEach(image => {
        formDataObj.append("reviewImages", image);
      });
    }
    try {
      const response = await fetch(`${apiUrl}/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataObj
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to submit review");
      setProduct((prev) => ({
        ...prev,
        reviews: [...prev.reviews, data],
      }));
      toast.success("Review submitted successfully!");
      setNewRating(0);
      setNewReview("");
      setReviewImages([]);
    } catch (err) {
      console.error("Review Submission Error:", err);
      toast.error(err.message || "Failed to submit review");
    }
  };

  if (loading)
    return (
      <div className="loader text-center d-flex justify-content-center my-5 ">
        <img src={loaderGif} alt="Loading..." className="img-fluid" />
      </div>
    );
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-details-container">
      <ProductSEO product={product} />
      <button className="back-button" onClick={() => navigate('/products')}>
        <ArrowLeft size={21} /> Back
      </button>
      <div className="product-details">
        <div className="image-section">
          <div className="main-image-container">
            {!imgLoaded && (
              <div className="image-loader">
                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
                  <path
                    fill="#2F231F"
                    d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z"
                  >
                    <animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12" />
                  </path>
                </svg>
              </div>
            )}
            {activeImage ? (
              <div className="image-wrapper">
                <img
                  src={activeImage}
                  alt={product?.productName || "Product Image"}
                  className={`product-details-image ${isLandscape ? 'landscape' : ''}`}
                  onLoad={(e) => {
                    setImgLoaded(true);
                    const { naturalWidth, naturalHeight } = e.target;
                    setIsLandscape(naturalWidth > naturalHeight);
                  }}
                  onError={() => setImgLoaded(true)}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                />
              </div>
            ) : (
              <div className="image-placeholder">No image available</div>
            )}
          </div>
          {subFrameThumbnails && subFrameThumbnails.length > 0 && (
            <div className="thumbnails">
              {subFrameThumbnails.map((thumbnail, index) => (
                <img
                  key={index}
                  src={thumbnail}
                  alt={`Thumbnail ${index + 1}`}
                  className={`thumbnail ${activeImage === thumbnail ? 'active' : ''}`}
                  onClick={() => setActiveImage(thumbnail)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="info-section">
          <h1 className="product-title">{product.productName}</h1>
          <div className="product-price-section">
            <div className="total-price">
              <span className="current-price">
                ₹{(selectedFrameType && selectedSubFrameType && selectedSize)
                  ? calculateTotalPrice()
                  : "899/-"}
              </span>
              {product.discount > 0 && (
                <span className="original-price">₹{product.discount}</span>
              )}
            </div>
          </div>
          <div className="options-section">
            {/* Frame Type rendered as buttons for both mobile and desktop */}
            <div className="frame-type-section">
              <div className="frame-type-buttons d-flex">
                {product.frameTypes?.map((frameType) => (
                  <button
                    key={frameType._id}
                    className={`option-button ${selectedFrameType?._id === frameType._id ? 'active' : ''}`}
                    onClick={() => handleFrameTypeSelect(frameType)}
                  >
                    {frameType.name}
                  </button>
                ))}
              </div>
            </div>
            {isMobile ? (
              <>
                {selectedFrameType && subFrameTypes.length > 0 && (
                  <div className="sub-frame-type-dropdown">
                    <select
                      value={selectedSubFrameType?._id || ''}
                      onChange={(e) => {
                        const st = subFrameTypes.find((st) => st._id === e.target.value);
                        handleSubFrameTypeSelect(st);
                      }}
                    >
                      <option value="" disabled>
                        Material
                      </option>
                      {subFrameTypes.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {selectedFrameType && sizes.length > 0 && (
                  <>
                    {isPosterFrame ? (
                      <div className="size-dropdown">
                        <select
                          value={selectedSize?._id || ''}
                          onChange={(e) => {
                            const sz = sizes.find((sz) => sz._id === e.target.value);
                            handleSizeSelect(sz);
                          }}
                        >
                          <option value="" disabled>
                            Select Size
                          </option>
                          {sizes.map((sz) => (
                            <option key={sz._id} value={sz._id}>
                              {sz.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div className="dropdown-group">
                          <select
                            className="dropdown-select"
                            value={selectedSizeCategory}
                            onChange={(e) => setSelectedSizeCategory(e.target.value)}
                          >
                            {availableCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="dropdown-group">
                          <select
                            className="dropdown-select"
                            value={selectedSize?._id || ''}
                            onChange={(e) => {
                              const sz = groupedSizes[selectedSizeCategory].find((s) => s._id === e.target.value);
                              handleSizeSelect(sz);
                            }}
                          >
                            <option value="" disabled>
                              Select Size
                            </option>
                            {groupedSizes[selectedSizeCategory]?.map((sz) => (
                              <option key={sz._id} value={sz._id}>
                                {sz.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {selectedFrameType && subFrameTypes.length > 0 && (
                  <div className="sub-frame-type-section">
                    <div className="sub-frame-type-buttons d-flex gap-2">
                      {subFrameTypes.map((subFrameType) => (
                        <div
                          key={subFrameType._id}
                          className={`subframe-thumbnail ${selectedSubFrameType?._id === subFrameType._id ? 'active' : ''}`}
                          onClick={() => handleSubFrameTypeSelect(subFrameType)}
                          title={subFrameType.name}
                        >
                          <button
                            className={`option-button ${selectedSubFrameType?._id === subFrameType._id ? 'active' : ''}`}
                            onClick={() => handleSubFrameTypeSelect(subFrameType)}
                            disabled={loadingSubFrame}
                          >
                            {loadingSubFrame && selectedSubFrameType?._id === subFrameType._id
                              ? 'Loading...'
                              : subFrameType.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedFrameType && sizes.length > 0 && (
                  <div className="size-section">
                    {isPosterFrame ? (
                      <div className="size-buttons">
                        {sizes.map((sz) => (
                          <button
                            key={sz._id}
                            className={`option-button ${selectedSize?._id === sz._id ? 'active' : ''}`}
                            onClick={() => handleSizeSelect(sz)}
                          >
                            {sz.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="size-category-buttons">
                          {availableCategories.map((cat) => (
                            <button
                              key={cat}
                              className={`option-button ${selectedSizeCategory === cat ? "active" : ""}`}
                              onClick={() => setSelectedSizeCategory(cat)}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                        <div className="size-buttons">
                          {groupedSizes[selectedSizeCategory]?.map((sz) => (
                            <button
                              key={sz._id}
                              className={`option-button ${selectedSize?._id === sz._id ? "active" : ""}`}
                              onClick={() => handleSizeSelect(sz)}
                            >
                              {sz.name}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="product-description">
            <h5>Description</h5>
            <p>{product.description}</p>
          </div>
          <div className="quantity-section">
            <label htmlFor="quantity">Quantity:</label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={inputQuantity}
              onChange={handleQuantityChange}
              onBlur={handleQuantityBlur}
              className="quantity-input"
            />
          </div>
          <div className="action-buttons">
            <button className="add-to-cart" onClick={handleAddToCart} disabled={!selectedFrameType || !selectedSubFrameType || !selectedSize}>
              <ShoppingCart size={20} />
              Add to Cart
            </button>
            <button
              className="add-to-wishlist"
              onClick={() => {
                const inWishlist =
                  Array.isArray(wishlist) &&
                  wishlist.some(
                    (item) =>
                      item.productId._id === product._id &&
                      item.frameType._id === selectedFrameType?._id &&
                      item.subFrameType._id === selectedSubFrameType?._id &&
                      item.size._id === selectedSize?._id
                  );
                if (inWishlist) {
                  handleRemoveFromWishlist(product);
                } else {
                  handleAddToWishlist(product);
                }
              }}
              disabled={!selectedFrameType || !selectedSubFrameType || !selectedSize}
            >
              <Heart size={20} />
              {Array.isArray(wishlist) &&
              wishlist.some(
                (item) =>
                  item.productId._id === product._id &&
                  item.frameType._id === selectedFrameType?._id &&
                  item.subFrameType._id === selectedSubFrameType?._id &&
                  item.size._id === selectedSize?._id
              )
                ? 'Remove from Wishlist'
                : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>
      <hr className='productDetails-spacing my-5'/>
      <div className="recommendations mb-5">
        <h2>Recommendations</h2>
        <RecentlyAddedProducts/>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

      <Modal 
        show={showLoginModal} 
        onHide={() => setShowLoginModal(false)} 
        centered 
        dialogClassName="custom-login-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please login to perform this action.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => { setShowLoginModal(false); navigate('/login'); }}>
            Login
          </Button>
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductDetails;
