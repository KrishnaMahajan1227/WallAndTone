import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import HomePage from './components/Home/HomePage';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import Dashboard from './components/Dashboard/dashboard';
import { UserProvider } from './contexts/UserContext';
import { WishlistProvider } from './components/Wishlist/WishlistContext';
import ProductManager from './components/Product/ProductManager';
import ProductListing from './components/Product/ProductListing';
import CartComponent from './components/Cart/CartComponent';
import WishlistComponent from './components/Wishlist/WishlistComponent';
import ProductDetails from './components/Product/ProductDetails';
import UserProfile from './components/UserProfile/UserProfile';
import FreepikGenerator from './components/FreepikGenerator/FreepikImageGenerator';
import FrameTypeManagement from './components/FrameTypeManagement/FrameTypeManagement';
import CouponAdmin from './components/Coupon/CouponAdmin';
import SizesAdmin from './components/SizesAdmin/SizesAdmin';
import SecondaryNavbar from './components/Navbar/SecondaryNavbar';
import Search from './components/Search/Search';
import CameraComponent from './components/CameraComponent/CameraComponent';
import FreepikCustomization from './components/FreepikCustomization/FreepikCustomization';
import AboutUs from './components/AboutUs/AboutUs';
import BusinessSection from './components/BusinessSection/BusinessSection';
import Footer from './components/Footer/Footer';
import PersonalizeUpload from './components/PersonalizeUpload/PersonalizeUpload';
import PersonalizeCustomization from './components/PersonalizeUpload/PersonalizeCustomization';
import FAQ from './components/Faq/Faq';
import CheckoutPage from './components/CheckoutPage/CheckoutPage';
import PrivacyPolicy from './components/Documentation/PrivacyPolicy';
import TermsConditions from './components/Documentation/TermsConditions';
import ShippingDelivery from './components/Documentation/ShippingDelivery';
import ReturnExchange from './components/Documentation/ReturnExchange';
import CustomPaymentPage from './components/CheckoutPage/CustomPaymentPage';
import OrderConfirmation from './components/OrderConfirmation/OrderConfirmation';
import TrackOrder from './components/TrackOrder/TrackOrder';
import AdminOrders from './components/AdminOrders/AdminOrders';
import OrderDetails from './components/AdminOrders/OrderDetails';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import AdminRoute from './components/AdminRoute';
import { io } from 'socket.io-client';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import ForgotPassword from './components/Login/ForgotPassword';
import ResetPassword from './components/Login/ResetPassword';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);

  useEffect(() => {
    setIsLivePreview(location.pathname === "/livePreview");
  }, [location.pathname]);

  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem("token") || !!sessionStorage.getItem("token");
    const path = decodeURIComponent(location.pathname);
    if (!isLoggedIn) {
      if (path === "/Ai-Creation") {
        setShowAiModal(true);
        setShowPersonalizeModal(false);
      } else if (path === "/Personalize") {
        setShowPersonalizeModal(true);
        setShowAiModal(false);
      } else {
        setShowAiModal(false);
        setShowPersonalizeModal(false);
      }
    } else {
      setShowAiModal(false);
      setShowPersonalizeModal(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const socket = io(window.location.origin, {
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected, reason:", reason);
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.reload();
    });

    socket.on("forceLogout", () => {
      console.log("forceLogout event received");
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.reload();
    });

    return () => socket.disconnect();
  }, []);

  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "1rem"
  };

  const modalContentStyle = {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "2rem",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    position: "relative"
  };

  // For both AI Creation and Personalize modals,
  // the login button now passes the current location state
  // so users can be redirected back after logging in.
  const renderModal = (type) => (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          {type === 'ai' ? (
            <Sparkles size={32} style={{ color: "#5B2EFF" }} />
          ) : (
            <Heart size={32} style={{ color: "#E63946" }} />
          )}
          <h2>
            {type === 'ai' ? "Unlock AI Creation Magic" : "Personalize Your Wall Art"}
            <br />FOR FREE!
          </h2>
        </div>
        <p style={{ textAlign: "center", marginBottom: "1rem" }}>
          {type === 'ai'
            ? "Transform your ideas into stunning wall art with our AI-powered tools."
            : "Bring your memories and let us create something unique for you."}
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => {
              navigate("/login", { state: { from: location.pathname } });
            }}
            style={{
              backgroundColor: type === 'ai' ? "#5B2EFF" : "#E63946",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            <span>Login Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ScrollToTop />
      <UserProvider>
        <WishlistProvider>
          <div className="Main-app">
            {location.pathname !== '/livePreview' && <Navbar />}
            <div className={`Main-content container-fluid ${isLivePreview ? "livePreview-active" : ""}`}>
              <div className="container">
                {location.pathname !== '/livePreview' && <SecondaryNavbar className="secondary-navbar-container" />}
                {showAiModal && renderModal('ai')}
                {showPersonalizeModal && renderModal('personalize')}
                <Routes>
                  <Route path="/search" element={<Search />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/products" element={<ProductListing />} />
                  <Route path="/Cart" element={<CartComponent />} />
                  <Route path="/Wishlist" element={<WishlistComponent />} />
                  <Route path="/product/:productId" element={<ProductDetails />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/Ai-Creation" element={<FreepikGenerator />} />
                  <Route path="/livePreview" element={<CameraComponent />} />
                  <Route path="/customize" element={<FreepikCustomization />} />
                  <Route path="/about us/*" element={<AboutUs />} />
                  <Route path="/for business" element={<BusinessSection />} />
                  <Route path="/Personalize" element={<PersonalizeUpload />} />
                  <Route path="/PersonalizeCustomization" element={<PersonalizeCustomization />} />
                  <Route path="/FAQ" element={<FAQ />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/Privacy&Policy" element={<PrivacyPolicy />} />
                  <Route path="/Terms&Conditions" element={<TermsConditions />} />
                  <Route path="/Shipping&Delivery" element={<ShippingDelivery />} />
                  <Route path="/Return&Exchange" element={<ReturnExchange />} />
                  <Route path="/custom-payment" element={<CustomPaymentPage />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/track-order" element={<TrackOrder />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                  <Route path="/dashboard/manageProducts" element={<AdminRoute><ProductManager /></AdminRoute>} />
                  <Route path="/dashboard/FrameTypeManagement" element={<AdminRoute><FrameTypeManagement /></AdminRoute>} />
                  <Route path="/dashboard/CouponAdmin" element={<AdminRoute><CouponAdmin /></AdminRoute>} />
                  <Route path="/dashboard/SizesAdmin" element={<AdminRoute><SizesAdmin /></AdminRoute>} />
                  <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                  <Route path="/admin/orders/:orderId" element={<AdminRoute><OrderDetails /></AdminRoute>} />
                </Routes>
              </div>
              <Footer />
            </div>
          </div>
        </WishlistProvider>
      </UserProvider>
    </>
  );
}

export default App;
