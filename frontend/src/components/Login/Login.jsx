import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role === 'superadmin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:8080/api/login', {
        email,
        password,
      });
  
      // Handle successful login
      if (response.status === 200) {
        // Log the response data for debugging
        console.log(response.data); 
  
        // Save the user and token to localStorage
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
  
        // Update the context (optional)
        setUser(user);
  
        // Redirect based on user role
        if (user.role === 'superadmin') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      if (error.response) {
        console.error('Login failed:', error.response.data.message || 'Unknown error');
        setGeneralError(error.response.data.message || 'Unknown error');
      } else {
        console.error('Login error:', error.message);
        setGeneralError('An error occurred. Please try again.');
      }
    }
  };
  
  

  return (
    <div className="login-background">
      <div className="login-overlay">
        <div className="card login-card shadow-lg p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {generalError && <div className="alert alert-danger">{generalError}</div>}
            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="text-center mt-2">
            <Link to="/signup">Don't have an account? Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
