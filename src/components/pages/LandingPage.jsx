import { useNavigate } from "react-router-dom";
import LandingNavbar from "../LandingNavbar.jsx";
import "../styles/global.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <LandingNavbar />

      {/* Hero Section */}
      <div className="hero">
        <h1>Inventory Management</h1>
        <p>
          Track stock levels, manage suppliers, process orders, and generate detailed reports - all in one powerful platform designed for modern businesses.
        </p>
        
        <button 
          className="cta-button" 
          onClick={() => navigate("/signup")}
        >
          Create Account
        </button>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Inventory Tracking</h3>
            <p>Real-time stock monitoring with automated alerts</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Detailed Reports</h3>
            <p>Admin can generate sales, stock, and supplier reports</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Supplier Integration</h3>
            <p>Suppliers can register and manage their product listings</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h3>Customer Online Ordering</h3>
            <p>Customers can browse and order products online</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure Authentication</h3>
            <p>Separate login for Admin, Staff, and Customers</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Order Tracking System</h3>
            <p>Customers can track status (Pending → Shipped → Delivered)</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Notifications & Alerts</h3>
            <p>Alerts for expiry, billing reminders, and shipment updates</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Staff Management</h3>
            <p>Role-based access control and staff activity tracking</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Responsive</h3>
            <p>Access your inventory system from any device, anywhere</p>
          </div>
        </div>
      </div>

      {/* Suppliers Vacancies Section */}
      <div className="suppliers-section">
        <div className="suppliers-content">
          <div className="suppliers-text">
            <h2>Suppliers Vacancies Available</h2>
            <p>
              Join our growing network of trusted suppliers and expand your business reach. 
              We're actively seeking reliable partners to supply quality products across various categories.
            </p>
            <div className="vacancy-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">✅</span>
                <span>Direct access to our customer base</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✅</span>
                <span>Automated order processing</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✅</span>
                <span>Real-time inventory management</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✅</span>
                <span>Competitive commission rates</span>
              </div>
            </div>
            <button 
              className="supplier-apply-btn" 
              onClick={() => navigate("/supplier-application")}
            >
              Apply as Supplier
            </button>
          </div>
          <div className="suppliers-visual">
            <div className="supplier-card-demo">
              <div className="demo-card">
                <div className="demo-icon">🏢</div>
                <h4>Electronics Supplier</h4>
                <p>Looking for electronics and gadgets suppliers</p>
                <span className="status-open">Open</span>
              </div>
              <div className="demo-card">
                <div className="demo-icon">🏠</div>
                <h4>Home & Garden</h4>
                <p>Need suppliers for home improvement items</p>
                <span className="status-open">Open</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="footer-section">
        <div className="footer-content">
          <div className="copyright-info">
            <p>© {new Date().getFullYear()} Inventory Management System. All rights reserved.</p>
            <p>This platform and all its contents, including but not limited to text, graphics, logos, images, and software, are the property of Inventory Management System and are protected by copyright, trademark, and other intellectual property laws.</p>
          </div>
          
          <div className="legal-links">
            <a href="#privacy" className="legal-link">Privacy Policy</a>
            <span className="separator">•</span>
            <a href="#terms" className="legal-link">Terms of Service</a>
            <span className="separator">•</span>
            <a href="#cookies" className="legal-link">Cookie Policy</a>
            <span className="separator">•</span>
            <a href="#contact" className="legal-link">Contact Us</a>
          </div>
        </div>
      </div>
    </div>
  );
};
