import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/';
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/forgot-password`, { email });
      if (response.status === 200) {
        setMessage(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <Helmet>
        <title>Forgot Password - Wall & Tone</title>
        <meta name="description" content="Reset your password for Wall & Tone." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="forgot-left">
      <h1>Forgot Password</h1>
      <div className="forgot-password-form-container">
        <p className='muted-text'>Please provide us with your email, and we’ll send you the link to recover your password or make changes.</p>
        <form onSubmit={handleSubmit} noValidate autoComplete="on">
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
                setError('');
              }}
            />
            <hr className="seperating-line"/>
          </div>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          <button type="submit" className="btn forgot-password-btn" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="redirect-link">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </div>
      </div>
      <div className="forgot-right">
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

export default ForgotPassword;
