import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ResetPassword.css';

const ResetPassword = () => {
  // Extract the token from the URL (e.g., /reset-password/:token)
  const { token } = useParams();
  const apiUrl =  import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://wallandtone.com');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Basic form validation
  const validateForm = () => {
    if (!newPassword) {
      setError('New password is required');
      return false;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${apiUrl}/api/reset-password`, { token, newPassword });
      if (response.status === 200) {
        setMessage('Password has been reset successfully. You can now log in.');
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <Helmet>
        <title>Reset Password - Wall & Tone</title>
        <meta name="description" content="Reset your password for Wall & Tone." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <h1>Reset Password</h1>
      <div className="reset-password-form-container">
        
        <form onSubmit={handleSubmit} noValidate autoComplete="on">
          <div className="form-group">
            <input
              type="password"
              required
              className="form-control"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              required
              className="form-control"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          <button type="submit" className="btn reset-password-btn" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p className="redirect-link">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
