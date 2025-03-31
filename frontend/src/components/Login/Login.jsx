import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { UserContext } from '../../contexts/UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/';
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect immediately.
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      navigate(parsedUser.role === 'superadmin' ? '/dashboard' : '/');
    }
  }, [navigate]);

  // Validate the login fields before submission.
  const validateForm = () => {
    if (!email.trim()) {
      setGeneralError('Email is required');
      return false;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
      setGeneralError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setGeneralError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/api/login`, { email, password });
      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        // Redirect to the previous page if provided; otherwise use default.
        const redirectTo = location.state?.from || (user.role === 'superadmin' ? '/dashboard' : '/');
        navigate(redirectTo);
      }
    } catch (error) {
      setGeneralError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Helmet>
        <title>Login - Wall & Tone</title>
        <meta
          name="description"
          content="Login to Wall & Tone to discover unique wall art, frames, and decor. Access your account now to enhance your space."
        />
        <meta name="robots" content="index, follow" />
        {/* Open Graph meta tags */}
        <meta property="og:title" content="Login - Wall & Tone" />
        <meta
          property="og:description"
          content="Login to access your account and explore exclusive wall art and frames at Wall & Tone."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wallandtone.com/login" />
        <meta property="og:image" content="/assets/og-image.png" />
      </Helmet>
      <div className="login-left">
        <form className="login-form" onSubmit={handleSubmit} noValidate autoComplete="on">
          <div className="form-group">
            <input
              type="email"
              required
              autoComplete="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setGeneralError('');
              }}
            />
          </div>
          <hr className="seperating-line" />
          <div className="form-group">
            <input
              type="password"
              required
              autoComplete="current-password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setGeneralError('');
              }}
            />
          </div>
          <hr className="seperating-line" />
          {generalError && <div className="error-message">{generalError}</div>}
          <button type="submit" className="btn login-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <p className="forgot-password-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </form>
        <p className="redirect-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
      <div className="login-right">
        <h3>Discover the Art of Framing</h3>
        <p>
          Enhance your walls with high-quality frames, tailored to your style. Wall & Tone offers a unique
          selection to transform your space.
        </p>
        <button className="btn explore-btn" onClick={() => navigate('/')}>
          Explore Now
        </button>
      </div>
    </div>
  );
};

export default Login;
