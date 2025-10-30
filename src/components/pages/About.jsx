import React from "react";
import { Link } from "react-router-dom";
import LandingNavbar from "../LandingNavbar.jsx";
import "../styles/global.css";

const About = () => {
  return (
    <div className="about-page">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Our Inventory Management System</h1>
          <p className="about-hero-subtitle">
            Empowering businesses with intelligent inventory solutions that streamline operations, 
            reduce costs, and drive growth through advanced technology and user-centric design.
          </p>
          <div className="about-stats">
            <div className="about-stat">
              <div className="about-stat-number">500+</div>
              <div className="about-stat-label">Happy Businesses</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-number">99.9%</div>
              <div className="about-stat-label">Uptime</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-number">24/7</div>
              <div className="about-stat-label">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="about-sections">
        <section className="about-section">
          <h2 data-emoji="🎯">Our Mission</h2>
          <p>
            Our Inventory Management System revolutionizes how businesses track stock, manage
            suppliers, handle transactions, and generate insightful reports. We believe in
            simplifying complex inventory processes through cutting-edge technology and
            intuitive design.
          </p>
          <p>
            We're committed to helping businesses of all sizes optimize their inventory
            operations, reduce waste, and maximize profitability through smart automation
            and real-time insights.
          </p>
        </section>
        
        <section className="about-section">
          <h2 data-emoji="🏢">For Your Business</h2>
          <p>
            Designed specifically for small to medium businesses, our system eliminates
            manual errors, saves valuable time, and dramatically improves operational
            efficiency. Whether you're managing a retail store, warehouse, or distribution
            center, we've got you covered.
          </p>
          <p>
            Our scalable solution grows with your business, adapting to your changing
            needs while maintaining the simplicity and reliability you depend on.
          </p>
        </section>

        <section className="about-section">
          <h2 data-emoji="⚡">Key Benefits</h2>
          <p>
            Experience the power of modern inventory management with features designed
            to transform your business operations:
          </p>
          <ul>
            <li>Real-time inventory tracking across multiple locations</li>
            <li>Automated low-stock alerts and reorder notifications</li>
            <li>Comprehensive reporting and analytics dashboard</li>
            <li>Advanced supplier management and integration</li>
            <li>Streamlined order processing and fulfillment</li>
            <li>Mobile-responsive design for on-the-go access</li>
            <li>Secure data encryption and backup systems</li>
            <li>Customizable workflows and user permissions</li>
          </ul>
        </section>
      </div>

      {/* Feature Highlights */}
      <section className="about-sections">
        <div className="about-features">
          <div className="about-feature">
            <div className="about-feature-icon">📊</div>
            <h3>Advanced Analytics</h3>
            <p>
              Get deep insights into your inventory performance with comprehensive
              analytics and customizable reports that help you make data-driven decisions.
            </p>
          </div>
          <div className="about-feature">
            <div className="about-feature-icon">🔒</div>
            <h3>Enterprise Security</h3>
            <p>
              Your data is protected with bank-level security, including encryption,
              secure backups, and role-based access controls.
            </p>
          </div>
          <div className="about-feature">
            <div className="about-feature-icon">🚀</div>
            <h3>Lightning Fast</h3>
            <p>
              Experience blazing-fast performance with our optimized system that
              handles thousands of transactions without slowing down.
            </p>
          </div>
          <div className="about-feature">
            <div className="about-feature-icon">🤝</div>
            <h3>Seamless Integration</h3>
            <p>
              Connect with your existing tools and systems through our robust API
              and pre-built integrations with popular business platforms.
            </p>
          </div>
          <div className="about-feature">
            <div className="about-feature-icon">📱</div>
            <h3>Mobile Ready</h3>
            <p>
              Manage your inventory from anywhere with our fully responsive design
              that works perfectly on all devices and screen sizes.
            </p>
          </div>
          <div className="about-feature">
            <div className="about-feature-icon">💡</div>
            <h3>Smart Automation</h3>
            <p>
              Reduce manual work with intelligent automation features that handle
              routine tasks and help prevent stockouts and overstock situations.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta">
        <div className="about-cta-content">
          <h2>Ready to Transform Your Business?</h2>
          <p>
            Join thousands of businesses already using our inventory management system
            to streamline operations and boost productivity.
          </p>
          <Link to="/login" className="about-cta-button">
            Get Started Today
            <span>→</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
