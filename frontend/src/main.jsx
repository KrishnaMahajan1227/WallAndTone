import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from "react"; // ✅ ADD THIS
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/js/bootstrap.min.js';
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { WishlistProvider } from './components/Wishlist/WishlistContext.jsx';

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
<Router>
  <WishlistProvider>
    <App />
    </WishlistProvider>
    </Router>  </StrictMode>,
)


