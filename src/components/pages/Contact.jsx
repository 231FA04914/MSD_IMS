import React, { useState } from "react";
import LandingNavbar from "../LandingNavbar.jsx";
import "../styles/global.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setFormData({ name: '', email: '', message: '' });
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  return (
    <div className="contact-page">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p className="contact-hero-subtitle">
            Have questions about our inventory management system? We'd love to hear from you. 
            Our team is here to help you streamline your business operations and boost productivity.
          </p>
        </div>
      </section>

      {/* Main Contact Content */}
      <div className="contact-container">
        {/* Contact Information */}
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <div className="contact-item">
            <span className="contact-icon">📧</span>
            <div className="contact-item-content">
              <h3>Email Support</h3>
              <p>support@inventoryms.com<br />sales@inventoryms.com</p>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <div className="contact-item-content">
              <h3>Phone Support</h3>
              <p>+1 (555) 123-4567<br />Mon-Fri, 9AM-6PM EST</p>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">🏢</span>
            <div className="contact-item-content">
              <h3>Office Address</h3>
              <p>123 Business Avenue<br />Suite 100<br />Tech City, TC 12345</p>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">💬</span>
            <div className="contact-item-content">
              <h3>Live Chat</h3>
              <p>Available 24/7 for<br />immediate assistance</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <h2>Send us a Message</h2>
          
          {showSuccess && (
            <div className="success-message">
              ✅ Thank you for your message! We'll get back to you within 24 hours.
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input 
              type="text" 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name" 
              required 
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
              placeholder="Enter your email address" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea 
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us how we can help you..." 
              rows="6" 
              required
            ></textarea>
          </div>
          
          <button type="submit" className="submit-btn">
            Send Message
          </button>
        </form>
      </div>

      {/* Support Hours Section */}
      <section className="contact-cta">
        <div className="contact-cta-content">
          <h2>We're Here to Help</h2>
          <p>
            Our dedicated support team is available to assist you with any questions 
            about our inventory management system.
          </p>
          
          <div className="contact-support-hours">
            <div className="support-hour-card">
              <h3>📞 Phone Support</h3>
              <p>Monday - Friday<br />9:00 AM - 6:00 PM EST</p>
            </div>
            <div className="support-hour-card">
              <h3>📧 Email Support</h3>
              <p>24/7 Response<br />Within 4 hours</p>
            </div>
            <div className="support-hour-card">
              <h3>💬 Live Chat</h3>
              <p>Available 24/7<br />Instant responses</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
