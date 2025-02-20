import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from "react"; // ✅ ADD THIS
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/js/bootstrap.min.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
