import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GuidlyLogo from './GuidlyLogo1.png';
import '../styles/register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  // Password strength calculation
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    // Length check
    if (formData.password.length >= 8) strength += 25;
    // Uppercase check
    if (/[A-Z]/.test(formData.password)) strength += 25;
    // Number check
    if (/[0-9]/.test(formData.password)) strength += 25;
    // Special character check
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength <= 25) return '#d93025';
    if (passwordStrength <= 50) return '#f4b400';
    if (passwordStrength <= 75) return '#0f9d58';
    return '#1a73e8';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when field is edited
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 50) {
      newErrors.password = 'Password is too weak';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        // Success state - redirect to home
        navigate('/');
      }, 1500);
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="photo"></div>
        <div className="logo-container">
          <Link to="/">
            <img src={GuidlyLogo} alt="Guidely Logo" className="logo" />
          </Link>
        </div>
        <div className="welcome-text">
          <h1>Welcome to Guidely</h1>
          <p>Discover amazing destinations with AI assistance</p>
        </div>
      </div>

      <div className="register-right">
        <div className="form-header">
          <h2>Create Account</h2>
          <p>Fill in the details below to start your adventure</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your name"
              className={`form-input ${errors.fullName ? 'error-input' : ''}`}
            />
            {errors.fullName && <span className="error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`form-input ${errors.email ? 'error-input' : ''}`}
            />
            {errors.email && <span className="error">{errors.email}</span>}
            <small>We'll never share your email with anyone else</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className={`form-input ${errors.password ? 'error-input' : ''}`}
            />
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar-container">
                  <div 
                    className="strength-bar" 
                    style={{
                      width: `${passwordStrength}%`,
                      backgroundColor: getStrengthColor()
                    }}
                  ></div>
                </div>
                <small style={{ color: getStrengthColor() }}>
                  Password strength: {passwordStrength <= 25 ? 'Weak' : 
                    passwordStrength <= 50 ? 'Fair' : 
                    passwordStrength <= 75 ? 'Good' : 'Strong'}
                </small>
              </div>
            )}
            {errors.password && <span className="error">{errors.password}</span>}
            <small>At least 8 characters with uppercase, numbers and symbols</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={`form-input ${errors.confirmPassword ? 'error-input' : ''}`}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>

          <div className="form-footer">
            <Link to="/login" className="login-link">Already have an account? Login</Link>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;