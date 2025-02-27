import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Signup.css';

const Signup = () => {
  const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://wallandtone.com');
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

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Form validation
  const validateForm = () => {
    const errorObj = {};
    if (!formData.firstName) errorObj.firstName = 'First Name is required';
    if (!formData.email) errorObj.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errorObj.email = 'Please enter a valid email address';
    if (!formData.phone) errorObj.phone = 'Phone number is required';
    if (!formData.password) errorObj.password = 'Password is required';
    setErrors(errorObj);
    return Object.keys(errorObj).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setGeneralError('');
    setSuccessMessage('');

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
      <div className="signup-left">
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" name="firstName" className="form-control" placeholder="Enter your name" value={formData.firstName} onChange={handleChange} />
            {errors.firstName && <small className="error-text">{errors.firstName}</small>}
          </div>
          <hr className="seperating-line"/>

          <div className="form-group">
            <input type="email" name="email" className="form-control" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
            {errors.email && <small className="error-text">{errors.email}</small>}
          </div>
          <hr className="seperating-line"/>

          <div className="form-group">
            <input type="text" name="phone" className="form-control" placeholder="Enter your phone" value={formData.phone} onChange={handleChange} />
            {errors.phone && <small className="error-text">{errors.phone}</small>}
          </div>
          <hr className="seperating-line"/>

          <div className="form-group">
            <input type="password" name="password" className="form-control" placeholder="Enter your password" value={formData.password} onChange={handleChange} />
            {errors.password && <small className="error-text">{errors.password}</small>}
          </div>
          <hr className="seperating-line"/>

          {generalError && <div className="error-message">{generalError}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button type="submit" className="btn signup-btn" disabled={isLoading}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="redirect-link">Already have an account ? <Link to="/login">Login</Link></p>
      </div>

      <div className="signup-right">
        <h3>Find the Perfect Frame for Your Space</h3>
        <p>Transform any wall with art that speaks to your style. From homes to businesses, Wall & Tone offers frames designed to inspire and elevate every space.</p>
        <button className="btn explore-btn" onClick={() => navigate('/')}>Explore Now</button>
      </div>
    </div>
  );
};

export default Signup;
