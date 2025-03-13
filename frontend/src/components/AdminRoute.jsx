// AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

const AdminRoute = ({ children }) => {
  // Assuming your UserContext provides a "user" object with a "role" property
  const { user } = useContext(UserContext);

  // If there's no user or the user isn't an admin, redirect to login (or you can use a dedicated unauthorized page)
  if (!user || user.role !== 'superadmin') {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the children (admin route content)
  return children;
};

export default AdminRoute;
