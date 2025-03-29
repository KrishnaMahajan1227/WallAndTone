// components/ProtectedRoute.js
import { Navigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from 'react';
const ProtectedRoute = ({ children, allowed }) => {
  const location = useLocation();

  if (!allowed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
