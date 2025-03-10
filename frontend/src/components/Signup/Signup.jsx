import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Signup.css';

const Signup = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost'
      ? 'http://localhost:8080'
      : 'https://wallandtone.com');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Validate individual field
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          error = 'First Name is required';
        } else if (value.trim().length < 2) {
          error = 'First Name must be at least 2 characters';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value.trim())) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^\d{10}$/.test(value.trim())) {
          error = 'Phone number must be exactly 10 digits';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Password must include at least one capital letter';
        } else if (!/(?=.*\d)/.test(value)) {
          error = 'Password must include at least one number';
        } else if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(value)) {
          error = 'Password must include at least one special character';
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Validate the whole form before submission
  const validateForm = () => {
    const errorObj = {};
    Object.keys(formData).forEach((field) => {
      if (field === 'role') return;
      const error = validateField(field, formData[field]);
      if (error) {
        errorObj[field] = error;
      }
    });
    setErrors(errorObj);
    return Object.keys(errorObj).length === 0;
  };

  // Handle field changes and clear error for that field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setGeneralError('');
  };

  // Validate on blur event for immediate feedback
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');
    if (!validateForm()) return; // Only proceed if no errors

    setIsLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/api/signup`, formData);
      if (response.status === 201) {
        setSuccessMessage(response.data.message);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      console.error("Signup Error:", error);
      setGeneralError(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Helmet>
        <title>Sign Up - Wall & Tone</title>
        <meta name="description" content="Create your account at Wall & Tone to explore unique wall art and custom frames that transform your space." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Sign Up - Wall & Tone" />
        <meta property="og:description" content="Join Wall & Tone and start discovering unique wall art and frames designed to elevate your decor." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wallandtone.com/signup" />
        <meta property="og:image" content="/assets/og-image.png" />
      </Helmet>
      <div className="signup-left">
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <input
              type="text"
              name="firstName"
              required
              className="form-control"
              placeholder="Enter your name"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.firstName && <small className="error-text">{errors.firstName}</small>}
          </div>
          <hr className="seperating-line" />

          <div className="form-group">
            <input
              type="email"
              name="email"
              required
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.email && <small className="error-text">{errors.email}</small>}
          </div>
          <hr className="seperating-line" />

          <div className="form-group">
            <input
              type="text"
              name="phone"
              required
              className="form-control"
              placeholder="Enter your phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.phone && <small className="error-text">{errors.phone}</small>}
          </div>
          <hr className="seperating-line" />

          <div className="form-group">
            <input
              type="password"
              name="password"
              required
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {errors.password && <small className="error-text">{errors.password}</small>}
          </div>
          <hr className="seperating-line" />

          {generalError && <div className="error-message">{generalError}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button type="submit" className="btn signup-btn" disabled={isLoading}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="redirect-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>

      <div className="signup-right">
        <h3>Find the Perfect Frame for Your Space</h3>
        <p>
          Transform any wall with art that speaks to your style. From homes to businesses, Wall & Tone offers frames designed to inspire and elevate every space.
        </p>
        <button className="btn explore-btn" onClick={() => navigate('/')}>
          Explore Now
        </button>
      </div>
    </div>
  );
};

export default Signup;
