import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../contexts/InventoryContext';

const PageDiagnostic = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasPermission } = useAuth();
  const { products } = useInventory() || {};
  const [testResults, setTestResults] = useState({});

  const pages = [
    { path: '/', name: 'Landing Page', public: true },
    { path: '/about', name: 'About Page', public: true },
    { path: '/contact', name: 'Contact Page', public: true },
    { path: '/login', name: 'Login Page', public: true },
    { path: '/signup', name: 'Signup Page', public: true },
    { path: '/dashboard', name: 'Dashboard', permission: 'dashboard_full' },
    { path: '/products', name: 'Products', permission: 'products_view' },
    { path: '/orders', name: 'Orders', permission: 'orders_full' },
    { path: '/reports', name: 'Reports', permission: 'reports_basic' },
    { path: '/suppliers', name: 'Suppliers', permission: 'suppliers_full' },
    { path: '/user-management', name: 'User Management', permission: 'view_users' },
    { path: '/cart', name: 'Cart', permission: 'cart_access' },
    { path: '/my-orders', name: 'My Orders', permission: 'orders_customer' },
    { path: '/customer-profile', name: 'Customer Profile', permission: 'profile_view' }
  ];

  const testPage = async (page) => {
    try {
      // Check if user has permission for protected pages
      if (page.permission && !hasPermission(page.permission)) {
        setTestResults(prev => ({
          ...prev,
          [page.path]: { status: 'No Permission', color: 'orange' }
        }));
        return;
      }

      // Try to navigate to the page
      navigate(page.path);
      
      // Wait a moment for navigation
      setTimeout(() => {
        setTestResults(prev => ({
          ...prev,
          [page.path]: { status: 'Navigated Successfully', color: 'green' }
        }));
      }, 100);
      
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [page.path]: { status: `Error: ${error.message}`, color: 'red' }
      }));
    }
  };

  const testAllPages = () => {
    pages.forEach((page, index) => {
      setTimeout(() => {
        testPage(page);
      }, index * 200); // Stagger the tests
    });
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '50px', 
      left: 0, 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '20px', 
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 10000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    }}>
      <h3>🔧 Page Diagnostic Tool</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Auth Status:</strong><br/>
        User: {user?.name || 'Not logged in'}<br/>
        Role: {user?.role || 'None'}<br/>
        Products: {products?.length || 0}
      </div>

      <button 
        onClick={testAllPages}
        style={{ 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          padding: '10px 15px', 
          cursor: 'pointer',
          borderRadius: '5px',
          marginBottom: '15px'
        }}
      >
        Test All Pages
      </button>

      <div>
        <h4>Page Test Results:</h4>
        {pages.map(page => (
          <div key={page.path} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '5px 0',
            borderBottom: '1px solid #eee'
          }}>
            <div>
              <strong>{page.name}</strong><br/>
              <small>{page.path}</small>
              {page.permission && <small> (Req: {page.permission})</small>}
            </div>
            <div>
              <button 
                onClick={() => testPage(page)}
                style={{ 
                  background: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  padding: '5px 10px', 
                  cursor: 'pointer',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}
              >
                Test
              </button>
              {testResults[page.path] && (
                <div style={{ 
                  color: testResults[page.path].color, 
                  fontSize: '12px',
                  marginTop: '2px'
                }}>
                  {testResults[page.path].status}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageDiagnostic;
