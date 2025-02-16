// userContext.jsx
import React, { createContext, useState, useEffect } from 'react';

// Create the Context for user
export const UserContext = createContext();

// UserProvider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check localStorage for user data on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Restore the user from localStorage
    }
  }, []);

  // Logout function
  const logout = () => {
    localStorage.removeItem('user'); // Remove the user from localStorage
    localStorage.removeItem('token'); // Remove the token from localStorage
    setUser(null); // Reset the user state
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
