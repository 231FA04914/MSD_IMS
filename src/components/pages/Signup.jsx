import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../styles/global.css";

export default function Signup() {
  console.log("Signup component rendering");
  const navigate = useNavigate();
  
  // Safe auth context usage
  const authContext = useAuth();
  if (!authContext) {
    console.error("AuthContext not available");
    return (
      <div className="auth-container">
        <div className="auth-form">
          <h2>Loading...</h2>
          <p>Please wait while we load the signup form.</p>
        </div>
      </div>
    );
  }
  
  const { register, emailExists } = authContext;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  // Role options for the dropdown
  const userRoles = [
    {
      value: 'admin',
      label: 'Administrator',
      description: 'Full system access with management capabilities',
      icon: '👨‍💼',
      adminOnly: true
    },
    {
      value: 'staff',
      label: 'Staff Member',
      description: 'Inventory management and order processing',
      icon: '👨‍💼',
      adminOnly: false
    },
    {
      value: 'customer',
      label: 'Customer',
      description: 'Browse products and place orders',
      icon: '👤',
      default: true,
      adminOnly: false
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelect = (roleValue) => {
    setFormData(prev => ({
      ...prev,
      role: roleValue
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check if email already exists
    const emailExistsResult = await emailExists(formData.email);
    if (emailExistsResult.exists) {
      setError('Email already in use');
      return;
    }

    setLoading(true);
    
    try {
      // Add default values for required fields
      const userData = {
        ...formData,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
        preferences: { theme: 'light', notifications: true },
        permissions: [], // Will be set based on role
        isEmailVerified: false,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language || 'en-US',
        currency: 'USD',
        company: 'N/A',
        position: formData.role === 'customer' ? 'Customer' : 'Staff',
        department: formData.role === 'customer' ? 'Customer' : 'Operations',
        notes: 'New user account',
        metadata: { source: 'web-signup' }
      };
      
      const result = await register(userData);
      
      if (result.success) {
        // Navigate based on role
        if (formData.role === 'customer') {
          navigate('/customer-products');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  console.log("Rendering Signup form with formData:", formData);
  
  return (
    <div className="auth-container">
      <div className="auth-form signup-form">
        <h2>Create an Account</h2>
        <p className="form-subtitle">Join our platform to get started</p>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role" className="role-selection-label">
              Select Your Role
            </label>
            <div className="dropdown-container">
              <select 
                id="role"
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                required
                className="styled-dropdown"
              >
                {userRoles.map(role => (
                  <option 
                    key={role.value} 
                    value={role.value}
                    disabled={role.adminOnly && !user?.role === 'admin'}
                  >
                    {role.label}
                  </option>
                ))}
              </select>
              <div className="dropdown-display">
                <span className="dropdown-icon">
                  {userRoles.find(r => r.value === formData.role)?.icon}
                </span>
                <span className="dropdown-text">
                  {userRoles.find(r => r.value === formData.role)?.label}
                </span>
                <span className="dropdown-arrow">▼</span>
              </div>
            </div>
            <div className="role-description-display">
              <p>{userRoles.find(r => r.value === formData.role)?.description}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input 
                type="text" 
                id="name"
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required 
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input 
                type="email" 
                id="email"
                name="email" 
                value={formData.email}
                onChange={handleChange}
                required 
                placeholder="Enter your email address"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone"
                name="phone" 
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          
          {/* Address Information */}
          <div className="form-section">
            <h3 className="section-title">Address Information</h3>
            
            <div className="form-group">
              <label htmlFor="address">Street Address</label>
              <input 
                type="text" 
                id="address"
                name="address" 
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your street address"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input 
                  type="text" 
                  id="city"
                  name="city" 
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input 
                  type="text" 
                  id="postalCode"
                  name="postalCode" 
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Enter your postal code"
                />
              </div>
            </div>
          </div>
          
          {/* Account Security */}
          <div className="form-section">
            <h3 className="section-title">Account Security</h3>
            
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input 
                type="password" 
                id="password"
                name="password" 
                value={formData.password}
                onChange={handleChange}
                required 
                minLength="8"
                placeholder="Create a strong password"
              />
              <small className="form-text">
                Must be at least 8 characters long and include a mix of letters, numbers, and symbols.
              </small>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input 
                type="password" 
                id="confirmPassword"
                name="confirmPassword" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
                placeholder="Confirm your password"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <p className="login-link">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
