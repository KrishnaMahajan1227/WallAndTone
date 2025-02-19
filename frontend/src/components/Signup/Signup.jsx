import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Signup.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',  // Default role is 'user'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

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

    // Validate form
    if (!validateForm()) return;

    setIsLoading(true);
    setGeneralError('');
    setSuccessMessage('');

    try {
      const response = await axios.post('/api/signup', formData);

      if (response.status === 201) {
        setSuccessMessage(response.data.message);
        setIsLoading(false);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Signup Error:", error);
      if (error.response) {
        setGeneralError(error.response.data.message);
      } else {
        setGeneralError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <div className={`form-group ${errors.firstName ? 'error' : ''}`}>
            <input
              type="text"
              className="form-control"
              id="firstName"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
            {errors.firstName && <div className="alert alert-danger">{errors.firstName}</div>}
          </div>

          <div className={`form-group ${errors.email ? 'error' : ''}`}>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="alert alert-danger">{errors.email}</div>}
          </div>

          <div className={`form-group ${errors.phone ? 'error' : ''}`}>
            <input
              type="text"
              className="form-control"
              id="phone"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && <div className="alert alert-danger">{errors.phone}</div>}
          </div>

          <div className={`form-group ${errors.password ? 'error' : ''}`}>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="alert alert-danger">{errors.password}</div>}
          </div>

          {/* Role selection (Optional for admins or specific roles) */}
          <div className={`form-group ${errors.role ? 'error' : ''}`}>
            <select
              className="form-control"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
            {errors.role && <div className="alert alert-danger">{errors.role}</div>}
          </div>

          {/* Display error or success messages */}
          {generalError && <div className="alert alert-danger">{generalError}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="redirect-link">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
