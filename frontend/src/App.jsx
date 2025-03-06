import React from 'react';
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar/Navbar';
import HomePage from './components/Home/HomePage';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import Dashboard from './components/Dashboard/dashboard'; // Admin Dashboard
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
import { useLocation } from "react-router-dom";
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



function App() {
  const location = useLocation(); // ✅ Now it's inside a Router
  const [isLivePreview, setIsLivePreview] = useState(false);

  useEffect(() => {
    setIsLivePreview(location.pathname === "/livePreview");
  }, [location.pathname]);
  return (
    <UserProvider>
      <WishlistProvider>
        <div className="Main-app">
          {location.pathname !== '/livePreview' && <Navbar />}
          <div className={`Main-content container-fluid ${isLivePreview ? "livePreview-active" : ""}`}>
          <div className="container">
          {location.pathname !== '/livePreview' && <SecondaryNavbar className="secondary-navbar-container"/>}
            <Routes>
              {/* Public Routes */}
              <Route path="/search" element={<Search />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/Cart" element={<CartComponent />} />
              <Route path="/Wishlist" element={<WishlistComponent />} />
              <Route path="/product/:productId" element={<ProductDetails/>} />
              <Route path="/profile" element={<UserProfile/>} />
              <Route path="/AiCreation" element={<FreepikGenerator/>} />
              <Route path="/livePreview" element={<CameraComponent/>} />
              <Route path="/customize" element={<FreepikCustomization />} />
              <Route path="/aboutus/*" element={<AboutUs/>} />
              <Route path="/forbusiness" element={<BusinessSection/>} />
              <Route path="/Personalize" element={<PersonalizeUpload/>} />
              <Route path="/PersonalizeCustomization" element={<PersonalizeCustomization/>} />
              <Route path="/FAQ" element={<FAQ/>} />
              <Route path="/checkout" element={<CheckoutPage/>} />
              <Route path="/Privacy&Policy" element={<PrivacyPolicy/>} />
              <Route path="/Terms&Conditions" element={<TermsConditions/>} />
              <Route path="/Shipping&Delivery" element={<ShippingDelivery/>} />
              <Route path="/Return&Exchange" element={<ReturnExchange/>} />
              <Route path="/custom-payment" element={<CustomPaymentPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/track-order" element={<TrackOrder />} />
              
              {/* Admin Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/manageProducts" element={<ProductManager />} />
              <Route path="/dashboard/FrameTypeManagement" element={<FrameTypeManagement/>} />
              <Route path="/dashboard/CouponAdmin" element={<CouponAdmin/>} />
              <Route path="/dashboard/SizesAdmin" element={<SizesAdmin/>} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/orders/:orderId" element={<OrderDetails />} />

            </Routes>
          </div>
          <Footer/>
          </div>
        </div>
      </WishlistProvider>
    </UserProvider>
  );
}

export default App;