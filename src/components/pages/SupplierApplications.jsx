import { useState, useEffect } from "react";
import { useAlert } from "../../contexts/AlertContext.jsx";
import "../styles/global.css";

const SupplierApplications = () => {
  const { addAlert } = useAlert();
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadApplications();
    
    // Listen for new applications
    const handleNewApplication = (event) => {
      console.log('🔔 New application received:', event.detail);
      loadApplications();
    };
    
    window.addEventListener('supplierApplicationSubmitted', handleNewApplication);
    
    return () => {
      window.removeEventListener('supplierApplicationSubmitted', handleNewApplication);
    };
  }, []);

  const loadApplications = () => {
    const storedApplications = JSON.parse(localStorage.getItem('supplierApplications') || '[]');
    console.log('📋 Loading supplier applications from localStorage:', storedApplications);
    setApplications(storedApplications);
  };

  const createTestApplication = () => {
    const testApp = {
      id: 'app_test_' + Date.now(),
      contactPerson: 'Test Supplier',
      email: 'test@supplier.com',
      phone: '9876543210',
      address: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      bankAccountNumber: '1234567890',
      bankName: 'HDFC Bank',
      drivingLicense: { name: 'test-license.pdf', type: 'application/pdf', size: 1024, data: 'test' },
      verificationDocuments: [{ id: 1, name: 'test-doc.pdf', type: 'application/pdf', size: 1024, data: 'test' }],
      status: 'pending',
      appliedDate: new Date().toISOString(),
      reviewedDate: null,
      reviewedBy: null,
      notes: ''
    };
    
    const existing = JSON.parse(localStorage.getItem('supplierApplications') || '[]');
    const updated = [...existing, testApp];
    localStorage.setItem('supplierApplications', JSON.stringify(updated));
    console.log('✅ Test application created and saved');
    loadApplications();
    addAlert({ type: 'success', message: 'Test application created successfully!' });
  };

  const handleApprove = (application) => {
    try {
      console.log('✅ Approving application:', application.id);
      
      // Update application status
      const updatedApplications = applications.map(app => 
        app.id === application.id 
          ? { 
              ...app, 
              status: 'approved', 
              reviewedDate: new Date().toISOString(),
              reviewedBy: 'Admin'
            }
          : app
      );
      
      setApplications(updatedApplications);
      localStorage.setItem('supplierApplications', JSON.stringify(updatedApplications));
      console.log('💾 Application status updated to approved');

      // Add to suppliers list
      const existingSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
      console.log('📦 Existing suppliers:', existingSuppliers.length);
      
      const newSupplier = {
        id: Date.now(),
        name: application.contactPerson,
        contact: application.phone,
        email: application.email,
        address: `${application.address}, ${application.city}, ${application.state}`,
        contactPerson: application.contactPerson,
        bankName: application.bankName || '',
        bankAccountNumber: application.bankAccountNumber || '',
        addedDate: new Date().toISOString(),
        addedBy: 'Admin',
        status: 'active'
      };

      const updatedSuppliers = [...existingSuppliers, newSupplier];
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      console.log('✅ Supplier added to suppliers list. Total suppliers:', updatedSuppliers.length);

      addAlert({ type: 'success', message: `Supplier application for ${application.contactPerson} has been approved and added to suppliers list!` });
      setSelectedApplication(null);
    } catch (error) {
      console.error('❌ Error approving application:', error);
      addAlert({ type: 'error', message: 'Error approving application. Please try again.' });
    }
  };

  const handleReject = (application, reason = '') => {
    try {
      console.log('❌ Rejecting application:', application.id);
      
      const updatedApplications = applications.map(app => 
        app.id === application.id 
          ? { 
              ...app, 
              status: 'rejected', 
              reviewedDate: new Date().toISOString(),
              reviewedBy: 'Admin',
              rejectionReason: reason
            }
          : app
      );
      
      setApplications(updatedApplications);
      localStorage.setItem('supplierApplications', JSON.stringify(updatedApplications));
      console.log('💾 Application status updated to rejected');

      addAlert({ type: 'warning', message: `Supplier application for ${application.contactPerson} has been rejected.` });
      setSelectedApplication(null);
    } catch (error) {
      console.error('❌ Error rejecting application:', error);
      addAlert({ type: 'error', message: 'Error rejecting application. Please try again.' });
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-badge pending',
      approved: 'status-badge approved',
      rejected: 'status-badge rejected'
    };
    
    return <span className={statusClasses[status]}>{status.toUpperCase()}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>📋 Supplier Applications</h1>
          <p>Review and manage supplier applications</p>
        </div>
        <button 
          onClick={loadApplications}
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
        >
          🔄 Refresh Applications
        </button>
      </div>

      {/* Debug Info */}
      <div style={{ 
        background: '#f0f9ff', 
        border: '1px solid #0ea5e9', 
        padding: '1rem', 
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <strong>Debug Info:</strong> Total applications loaded: {applications.length}
        <br />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button 
            onClick={() => {
              console.log('All applications:', applications);
              console.log('localStorage data:', localStorage.getItem('supplierApplications'));
              alert(`Total applications: ${applications.length}\nCheck console for details`);
            }}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            🐛 Show Debug Info
          </button>
          <button 
            onClick={createTestApplication}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            ➕ Create Test Application
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-section">
        <div className="filter">
          <label>Filter by Status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Applications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="table-section">
        <h2>📊 Applications Overview ({filteredApplications.length})</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No applications found
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.contactPerson}</td>
                    <td>{app.email}</td>
                    <td>{app.phone}</td>
                    <td>{formatDate(app.appliedDate)}</td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td>
                      <button 
                        onClick={() => setSelectedApplication(app)}
                        className="btn btn-sm"
                      >
                        👁️ View Details
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(app)}
                            className="btn btn-success btn-sm"
                          >
                            ✅ Approve
                          </button>
                          <button 
                            onClick={() => handleReject(app)}
                            className="btn btn-error btn-sm"
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Application Details</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedApplication(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="application-details">
                <div className="detail-section">
                  <h3>Personal Info</h3>
                  <div className="detail-grid">
                    <div><strong>Full Name:</strong> {selectedApplication.contactPerson}</div>
                    <div><strong>Email:</strong> {selectedApplication.email}</div>
                    <div><strong>Phone:</strong> {selectedApplication.phone}</div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Address</h3>
                  <div className="detail-grid">
                    <div><strong>Address:</strong> {selectedApplication.address}</div>
                    <div><strong>City:</strong> {selectedApplication.city}</div>
                    <div><strong>State:</strong> {selectedApplication.state}</div>
                  </div>
                </div>

                {/* Document Verification Section */}
                <div className="detail-section">
                  <h3>Document Verification</h3>
                  
                  {selectedApplication.drivingLicense && (
                    <div className="document-item">
                      <strong>Driving License:</strong>
                      <div className="document-file">
                        <span className="file-icon">📄</span>
                        <span className="file-name">{selectedApplication.drivingLicense.name}</span>
                        <span className="file-size">({(selectedApplication.drivingLicense.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button 
                          onClick={() => window.open(selectedApplication.drivingLicense.data, '_blank')}
                          className="btn btn-sm view-document-btn"
                        >
                          👁️ View
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.verificationDocuments && selectedApplication.verificationDocuments.length > 0 && (
                    <div className="document-item">
                      <strong>Additional Documents:</strong>
                      <div className="documents-list">
                        {selectedApplication.verificationDocuments.map((doc, index) => (
                          <div key={doc.id || index} className="document-file">
                            <span className="file-icon">📄</span>
                            <span className="file-name">{doc.name}</span>
                            <span className="file-size">({(doc.size / 1024 / 1024).toFixed(2)} MB)</span>
                            <button 
                              onClick={() => window.open(doc.data, '_blank')}
                              className="btn btn-sm view-document-btn"
                            >
                              👁️ View
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!selectedApplication.drivingLicense && (!selectedApplication.verificationDocuments || selectedApplication.verificationDocuments.length === 0) && (
                    <p className="no-documents">No documents uploaded</p>
                  )}
                </div>

                {(selectedApplication.bankName || selectedApplication.bankAccountNumber) && (
                  <div className="detail-section">
                    <h3>Banking Information</h3>
                    <div className="detail-grid">
                      <div><strong>Bank Name:</strong> {selectedApplication.bankName || 'Not provided'}</div>
                      <div><strong>Account Number:</strong> {selectedApplication.bankAccountNumber || 'Not provided'}</div>
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h3>Application Status</h3>
                  <div className="detail-grid">
                    <div><strong>Status:</strong> {getStatusBadge(selectedApplication.status)}</div>
                    <div><strong>Applied Date:</strong> {formatDate(selectedApplication.appliedDate)}</div>
                    {selectedApplication.reviewedDate && (
                      <>
                        <div><strong>Reviewed Date:</strong> {formatDate(selectedApplication.reviewedDate)}</div>
                        <div><strong>Reviewed By:</strong> {selectedApplication.reviewedBy}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selectedApplication.status === 'pending' && (
              <div className="modal-footer">
                <button 
                  onClick={() => handleApprove(selectedApplication)}
                  className="btn btn-success"
                >
                  ✅ Approve Application
                </button>
                <button 
                  onClick={() => handleReject(selectedApplication)}
                  className="btn btn-error"
                >
                  ❌ Reject Application
                </button>
                <button 
                  onClick={() => setSelectedApplication(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierApplications;
