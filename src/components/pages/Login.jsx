import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { ROLES } from "../../constants/auth";
import { getDefaultCredentials } from "../../utils/initializeDefaultUsers";
import "../styles/global.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "admin"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  
  const defaultCredentials = getDefaultCredentials();

  const loginTypes = [
    {
      value: 'admin',
      label: 'Administrator Login',
      description: 'System management and configuration',
      icon: '👨\u200d💼'
    },
    {
      value: 'staff',
      label: 'Staff Login',
      description: 'Inventory and order management',
      icon: '👨\u200d💼'
    },
    {
      value: 'customer',
      label: 'Customer Login',
      description: 'Browse and order products',
      icon: '👤'
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.email, formData.password, formData.role);
    
    if (result.success) {
      // Navigate based on role
      if (formData.role === 'customer') {
        navigate("/customer-products");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const fillDemoCredentials = (role) => {
    const credentials = defaultCredentials[role];
    setFormData({
      email: credentials.email,
      password: credentials.password,
      role: credentials.role
    });
    setShowCredentials(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form login-form">
        <h2>Sign In to Your Account</h2>
        <p className="auth-subtitle">Welcome back! Please select your account type and sign in.</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="role">Account Type *</label>
            <div className="dropdown-container">
              <select 
                id="role"
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                required
                className="styled-dropdown"
              >
                {loginTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              <div className="dropdown-display">
                <span className="dropdown-icon">
                  {loginTypes.find(t => t.value === formData.role)?.icon}
                </span>
                <span className="dropdown-text">
                  {loginTypes.find(t => t.value === formData.role)?.label}
                </span>
                <span className="dropdown-arrow">▼</span>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input 
              type="email" 
              id="email"
              name="email"
              placeholder="Enter your email address" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input 
              type="password" 
              id="password"
              name="password"
              placeholder="Enter your password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          
          <button type="submit" className="auth-button login-button" disabled={loading}>
            {loading ? "Signing In..." : `Sign In as ${loginTypes.find(t => t.value === formData.role)?.label.replace(' Login', '')}`}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>or</span>
        </div>
        
        <div className="demo-credentials">
          <button 
            type="button" 
            className="demo-button"
            onClick={() => setShowCredentials(!showCredentials)}
          >
            {showCredentials ? 'Hide' : 'Show'} Demo Credentials
          </button>
          
          {showCredentials && (
            <div className="credentials-list">
              <h4>Demo Login Credentials:</h4>
              <div className="credential-item">
                <strong>Admin:</strong> {defaultCredentials.admin.email} / {defaultCredentials.admin.password}
                <button onClick={() => fillDemoCredentials('admin')} className="fill-btn">Use</button>
              </div>
              <div className="credential-item">
                <strong>Staff:</strong> {defaultCredentials.staff.email} / {defaultCredentials.staff.password}
                <button onClick={() => fillDemoCredentials('staff')} className="fill-btn">Use</button>
              </div>
              <div className="credential-item">
                <strong>Customer:</strong> {defaultCredentials.customer.email} / {defaultCredentials.customer.password}
                <button onClick={() => fillDemoCredentials('customer')} className="fill-btn">Use</button>
              </div>
            </div>
          )}
        </div>
        
        <p className="auth-link">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")} className="link">
            Create Account
          </span>
        </p>
      </div>
    </div>
  );
}
