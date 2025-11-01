import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import "../styles/global.css";

const SupplierApplication = () => {
  const navigate = useNavigate();
  const { addAlert } = useAlert();
  
  const [formData, setFormData] = useState({
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    bankAccountNumber: "",
    bankName: "",
    drivingLicense: null,
    verificationDocuments: []
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'drivingLicense') {
      const file = files[0];
      if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          addAlert({ type: 'error', message: `File ${file.name} is too large. Maximum size is 5MB` });
          return;
        }
        
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prev => ({
            ...prev,
            drivingLicense: {
              name: file.name,
              type: file.type,
              size: file.size,
              data: event.target.result
            }
          }));
        };
        reader.readAsDataURL(file);
      }
    } else if (name === 'verificationDocuments') {
      const fileArray = Array.from(files);
      
      // Check if total files exceed limit
      if (fileArray.length > 5) {
        addAlert({ type: 'error', message: "Maximum 5 documents allowed" });
        return;
      }
      
      // Process each file
      const processedFiles = [];
      let filesProcessed = 0;
      
      fileArray.forEach((file, index) => {
        // Check file size (max 5MB per file)
        if (file.size > 5 * 1024 * 1024) {
          addAlert({ type: 'error', message: `File ${file.name} is too large. Maximum size is 5MB` });
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          processedFiles.push({
            id: Date.now() + index,
            name: file.name,
            type: file.type,
            size: file.size,
            data: event.target.result
          });
          
          filesProcessed++;
          if (filesProcessed === fileArray.length) {
            setFormData(prev => ({
              ...prev,
              verificationDocuments: [...prev.verificationDocuments, ...processedFiles]
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Clear error when user uploads file
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const removeDocument = (documentId) => {
    setFormData(prev => ({
      ...prev,
      verificationDocuments: prev.verificationDocuments.filter(doc => doc.id !== documentId)
    }));
  };

  const removeDrivingLicense = () => {
    setFormData(prev => ({
      ...prev,
      drivingLicense: null
    }));
  };

  const validateForm = () => {
    console.log('Validating form...');
    const newErrors = {};
    
    // Required fields validation
    const requiredFields = [
      'contactPerson', 'email', 'phone', 'address', 
      'city', 'state'
    ];
    
    let hasErrors = false;
    
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = `${field === 'contactPerson' ? 'Full name' : field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        hasErrors = true;
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      hasErrors = true;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone) {
      const phoneNumber = formData.phone.replace(/\D/g, '');
      if (!phoneRegex.test(phoneNumber)) {
        newErrors.phone = "Please enter a valid 10-digit phone number";
        hasErrors = true;
      }
    }

    // Driving license validation
    if (!formData.drivingLicense) {
      newErrors.drivingLicense = "Driving license is required";
      hasErrors = true;
    }

    console.log('Form validation errors:', newErrors);
    setErrors(newErrors);
    
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Form submitted');
    
    if (isSubmitting) {
      console.log('⏳ Already submitting, please wait...');
      return;
    }
    
    // First validate the form
    console.log('🔍 Validating form...');
    const isValid = validateForm();
    console.log('✅ Form validation result:', isValid);
    
    // Check for required files
    if (!formData.drivingLicense) {
      console.log('❌ Driving license missing');
      addAlert({ type: 'error', message: "Please upload your driving license" });
      return;
    }
    
    if (formData.verificationDocuments.length === 0) {
      console.log('❌ Verification documents missing');
      addAlert({ type: 'error', message: "Please upload at least one verification document" });
      return;
    }
    
    if (!isValid) {
      console.log('❌ Form validation failed');
      // Get fresh errors from state after validation
      const errorMessages = Object.values(errors).filter(Boolean);
      if (errorMessages.length > 0) {
        addAlert({ type: 'error', message: `Please fix the following: ${errorMessages.join(', ')}` });
      } else {
        addAlert({ type: 'error', message: "Please fill in all required fields correctly" });
      }
      return;
    }

    try {
      console.log('✨ Starting form submission...');
      setIsSubmitting(true);
      
      // Get existing applications from localStorage
      const existingApplications = JSON.parse(localStorage.getItem('supplierApplications') || '[]');
      console.log('📦 Existing applications:', existingApplications.length);
      
      // Create new application with timestamp and status
      const newApplication = {
        id: 'app_' + Date.now(),
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        bankAccountNumber: formData.bankAccountNumber || '',
        bankName: formData.bankName || '',
        drivingLicense: formData.drivingLicense,
        verificationDocuments: formData.verificationDocuments,
        status: 'pending',
        appliedDate: new Date().toISOString(),
        reviewedDate: null,
        reviewedBy: null,
        notes: ''
      };
      
      console.log('📝 New application created:', newApplication);

      // Add to applications list
      const updatedApplications = [...existingApplications, newApplication];
      localStorage.setItem('supplierApplications', JSON.stringify(updatedApplications));
      
      console.log('💾 Application saved to localStorage. Total applications:', updatedApplications.length);
      console.log('✅ Verify saved data:', JSON.parse(localStorage.getItem('supplierApplications')));

      // Show success modal and reset form
      console.log('🎉 Setting showSuccessModal to true');
      setShowSuccessModal(true);
      console.log('🎉 Modal state updated. showSuccessModal should be TRUE');
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('supplierApplicationSubmitted', {
        detail: { application: newApplication }
      }));
      console.log('📢 Event dispatched: supplierApplicationSubmitted');
      
      setFormData({
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        bankAccountNumber: "",
        bankName: "",
        drivingLicense: null,
        verificationDocuments: []
      });
      
      // Auto-close modal and redirect after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/");
      }, 5000);
      
      // Cleanup timer on component unmount
      return () => clearTimeout(timer);

    } catch (error) {
      console.error("Error submitting application:", error);
      addAlert({ type: 'error', message: `There was an error: ${error.message || 'Please try again.'}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  
  return (
    <div className="supplier-application-container">
      {/* Debug indicator */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'red',
          color: 'white',
          padding: '10px',
          zIndex: 99999,
          borderRadius: '5px',
          fontWeight: 'bold'
        }}>
          🔴 MODAL STATE: TRUE
        </div>
      )}
      
      <div className="application-header">
        <h1>🏢 Supplier Application Form</h1>
        <p>Join our network of trusted suppliers and grow your business with us</p>
      </div>

      <form className="supplier-application-form" onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="form-section">
          <h3>Personal Info</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="contactPerson">Full Name *</label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className={errors.contactPerson ? 'error' : ''}
                placeholder="Enter your full name"
              />
              {errors.contactPerson && <span className="error-text">{errors.contactPerson}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email address"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="Enter your phone number"
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
          </div>
        </div>

        {/* Document Verification */}
        <div className="form-section">
          <h3>Document Verification</h3>
          
          {/* Driving License Upload */}
          <div className="form-group">
            <label htmlFor="drivingLicense" className={errors.drivingLicense ? 'error' : ''}>
              Driving License *
            </label>
            <div className="file-upload-container">
              <input
                type="file"
                id="drivingLicense"
                name="drivingLicense"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className={`file-input ${errors.drivingLicense ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              <label 
                htmlFor="drivingLicense" 
                className={`file-upload-label ${errors.drivingLicense ? 'error' : ''} ${isSubmitting ? 'disabled' : ''}`}
              >
                {formData.drivingLicense ? '📄 Change File' : '📄 Choose Driving License File'}
              </label>
              <small className={`file-help-text ${errors.drivingLicense ? 'error-text' : ''}`}>
                {errors.drivingLicense || 'Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)'}
              </small>
            </div>
            
            {formData.drivingLicense && (
              <div className="uploaded-file">
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{formData.drivingLicense.name}</span>
                  <span className="file-size">({(formData.drivingLicense.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={removeDrivingLicense}
                  className="remove-file-btn"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Additional Verification Documents */}
          <div className="form-group">
            <label htmlFor="verificationDocuments">Additional Verification Documents</label>
            <div className="file-upload-container">
              <input
                type="file"
                id="verificationDocuments"
                name="verificationDocuments"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
                className="file-input"
              />
              <label htmlFor="verificationDocuments" className="file-upload-label">
                📁 Choose Additional Documents
              </label>
              <small className="file-help-text">
                Upload additional documents like ID card, passport, etc. (Max 5 files, 5MB each)
              </small>
            </div>
            
            {formData.verificationDocuments.length > 0 && (
              <div className="uploaded-files-list">
                {formData.verificationDocuments.map((doc) => (
                  <div key={doc.id} className="uploaded-file">
                    <div className="file-info">
                      <span className="file-icon">📄</span>
                      <span className="file-name">{doc.name}</span>
                      <span className="file-size">({(doc.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="remove-file-btn"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h3>Address Information</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="address">Street Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? 'error' : ''}
                placeholder="Enter your street address"
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? 'error' : ''}
              >
                <option value="">Select City</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Pune">Pune</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Surat">Surat</option>
                <option value="Lucknow">Lucknow</option>
                <option value="Kanpur">Kanpur</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Indore">Indore</option>
                <option value="Thane">Thane</option>
                <option value="Bhopal">Bhopal</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
                <option value="Pimpri-Chinchwad">Pimpri-Chinchwad</option>
                <option value="Patna">Patna</option>
                <option value="Vadodara">Vadodara</option>
                <option value="Ghaziabad">Ghaziabad</option>
                <option value="Ludhiana">Ludhiana</option>
                <option value="Agra">Agra</option>
                <option value="Nashik">Nashik</option>
                <option value="Faridabad">Faridabad</option>
                <option value="Meerut">Meerut</option>
                <option value="Rajkot">Rajkot</option>
                <option value="Kalyan-Dombivali">Kalyan-Dombivali</option>
                <option value="Vasai-Virar">Vasai-Virar</option>
                <option value="Varanasi">Varanasi</option>
                <option value="Others">Others</option>
              </select>
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="state">State *</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={errors.state ? 'error' : ''}
              >
                <option value="">Select State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                <option value="Delhi">Delhi</option>
                <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                <option value="Ladakh">Ladakh</option>
                <option value="Lakshadweep">Lakshadweep</option>
                <option value="Puducherry">Puducherry</option>
                <option value="Others">Others</option>
              </select>
              {errors.state && <span className="error-text">{errors.state}</span>}
            </div>
          </div>
        </div>

        {/* Banking Information */}
        <div className="form-section">
          <h3>Banking Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="bankName">Bank Name</label>
              <select
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
              >
                <option value="">Select Bank</option>
                <option value="State Bank of India">State Bank of India</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                <option value="IndusInd Bank">IndusInd Bank</option>
                <option value="Yes Bank">Yes Bank</option>
                <option value="IDFC First Bank">IDFC First Bank</option>
                <option value="Federal Bank">Federal Bank</option>
                <option value="South Indian Bank">South Indian Bank</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Canara Bank">Canara Bank</option>
                <option value="Union Bank of India">Union Bank of India</option>
                <option value="Bank of India">Bank of India</option>
                <option value="Central Bank of India">Central Bank of India</option>
                <option value="Indian Bank">Indian Bank</option>
                <option value="Indian Overseas Bank">Indian Overseas Bank</option>
                <option value="Punjab & Sind Bank">Punjab & Sind Bank</option>
                <option value="UCO Bank">UCO Bank</option>
                <option value="Bank of Maharashtra">Bank of Maharashtra</option>
                <option value="Bandhan Bank">Bandhan Bank</option>
                <option value="City Union Bank">City Union Bank</option>
                <option value="DCB Bank">DCB Bank</option>
                <option value="Dhanlaxmi Bank">Dhanlaxmi Bank</option>
                <option value="ESAF Small Finance Bank">ESAF Small Finance Bank</option>
                <option value="Equitas Small Finance Bank">Equitas Small Finance Bank</option>
                <option value="Jana Small Finance Bank">Jana Small Finance Bank</option>
                <option value="Karur Vysya Bank">Karur Vysya Bank</option>
                <option value="Lakshmi Vilas Bank">Lakshmi Vilas Bank</option>
                <option value="Nainital Bank">Nainital Bank</option>
                <option value="RBL Bank">RBL Bank</option>
                <option value="Tamilnad Mercantile Bank">Tamilnad Mercantile Bank</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bankAccountNumber">Account Number</label>
              <input
                type="text"
                id="bankAccountNumber"
                name="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={handleChange}
                placeholder="Enter your account number"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/")}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : 'Submit Application'}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay" style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="success-modal" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '3rem 2rem',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 10000
          }}>
            <div className="success-icon">
              <div className="checkmark">
                <div className="checkmark-circle"></div>
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
            </div>
            <h2>Application Submitted Successfully!</h2>
            <p>
              Thank you for your interest in becoming a supplier. Your application has been submitted 
              and is now under review by our admin team.
            </p>
            <div className="success-details">
              <div className="detail-item">
                <span className="icon">📧</span>
                <span>We'll contact you via email within 2-3 business days</span>
              </div>
              <div className="detail-item">
                <span className="icon">📋</span>
                <span>Your application is being reviewed by our team</span>
              </div>
              <div className="detail-item">
                <span className="icon">✅</span>
                <span>You'll receive approval confirmation soon</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/");
                }}
                className="btn btn-primary"
              >
                Return to Home
              </button>
            </div>
            <p className="auto-redirect">
              You will be automatically redirected to the home page in a few seconds...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierApplication;
