import React from 'react';
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



function App() {
  return (
    <UserProvider>
      <WishlistProvider>
      <Router>
        <div className="Main-app">
          {location.pathname !== '/livePreview' && <Navbar />}
          <div className="Main-content container">
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
              <Route path="/FreepikGenerator" element={<FreepikGenerator/>} />
              <Route path="/livePreview" element={<CameraComponent/>} />
              <Route path="/customize" element={<FreepikCustomization />} />
              <Route path="/aboutus/*" element={<AboutUs/>} />



              {/* Admin Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/manageProducts" element={<ProductManager />} />
              <Route path="/dashboard/FrameTypeManagement" element={<FrameTypeManagement/>} />
              <Route path="/dashboard/CouponAdmin" element={<CouponAdmin/>} />
              <Route path="/dashboard/SizesAdmin" element={<SizesAdmin/>} />
            </Routes>
          </div>
        </div>
      </Router>
      </WishlistProvider>
    </UserProvider>
  );
}

export default App;