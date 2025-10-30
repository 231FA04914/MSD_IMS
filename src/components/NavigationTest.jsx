import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [testResults, setTestResults] = useState({});

  const publicRoutes = [
    { path: '/', name: 'Landing Page' },
    { path: '/about', name: 'About Page' },
    { path: '/contact', name: 'Contact Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/signup', name: 'Signup Page' },
    { path: '/supplier-application', name: 'Supplier Application' }
  ];

  const testNavigation = async (route) => {
    try {
      console.log(`Testing navigation to: ${route.path}`);
      navigate(route.path);
      
      // Wait a moment for navigation
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const success = currentPath === route.path;
        
        setTestResults(prev => ({
          ...prev,
          [route.path]: {
            status: success ? 'Success' : `Failed - Current: ${currentPath}`,
            color: success ? 'green' : 'red'
          }
        }));
      }, 100);
      
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [route.path]: {
          status: `Error: ${error.message}`,
          color: 'red'
        }
      }));
    }
  };

  const testAllRoutes = () => {
    publicRoutes.forEach((route, index) => {
      setTimeout(() => {
        testNavigation(route);
      }, index * 300);
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      right: 0,
      transform: 'translateY(-50%)',
      background: 'white',
      border: '2px solid #007bff',
      borderRadius: '8px 0 0 8px',
      padding: '20px',
      maxWidth: '350px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 10001,
      boxShadow: '-4px 0 20px rgba(0,0,0,0.15)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>🧭 Navigation Test</h3>
      
      <div style={{ marginBottom: '15px', fontSize: '14px' }}>
        <strong>Current Route:</strong><br/>
        <code style={{ background: '#f8f9fa', padding: '2px 6px', borderRadius: '3px' }}>
          {location.pathname}
        </code>
      </div>

      <button 
        onClick={testAllRoutes}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '15px',
          width: '100%'
        }}
      >
        Test All Public Routes
      </button>

      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Public Routes:</h4>
        {publicRoutes.map(route => (
          <div key={route.path} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #eee'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{route.name}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>{route.path}</div>
              {testResults[route.path] && (
                <div style={{
                  fontSize: '11px',
                  color: testResults[route.path].color,
                  marginTop: '2px'
                }}>
                  {testResults[route.path].status}
                </div>
              )}
            </div>
            <button
              onClick={() => testNavigation(route)}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Test
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>Instructions:</strong><br/>
        1. Click "Test All Public Routes" to test navigation<br/>
        2. Check console for navigation logs<br/>
        3. Individual "Test" buttons for specific routes
      </div>
    </div>
  );
};

export default NavigationTest;
