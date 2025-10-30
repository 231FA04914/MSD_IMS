import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../contexts/InventoryContext';

const DebugInfo = () => {
  const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
  const { products, settings } = useInventory() || {};

  if (isLoading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        right: 0, 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px', 
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px'
      }}>
        <h4>🔄 Loading...</h4>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <h4>🔧 Debug Info</h4>
      <div>
        <strong>Auth Status:</strong><br/>
        - Authenticated: {isAuthenticated ? '✅' : '❌'}<br/>
        - Loading: {isLoading ? '⏳' : '✅'}<br/>
        - User: {user ? user.name : 'None'}<br/>
        - Role: {user?.role || 'None'}<br/>
        - Email: {user?.email || 'None'}<br/>
      </div>
      <div style={{ marginTop: '10px' }}>
        <strong>Permissions:</strong><br/>
        - view_users: {hasPermission('view_users') ? '✅' : '❌'}<br/>
        - products_view: {hasPermission('products_view') ? '✅' : '❌'}<br/>
        - orders_full: {hasPermission('orders_full') ? '✅' : '❌'}<br/>
      </div>
      <div style={{ marginTop: '10px' }}>
        <strong>Inventory:</strong><br/>
        - Products: {products?.length || 0}<br/>
        - Settings: {settings ? '✅' : '❌'}<br/>
      </div>
      <div style={{ marginTop: '10px' }}>
        <strong>URL:</strong><br/>
        {window.location.pathname}
      </div>
      <div style={{ marginTop: '10px', fontSize: '10px' }}>
        <button 
          onClick={() => window.createTestAdminUser?.()}
          style={{ 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '5px 10px', 
            cursor: 'pointer',
            borderRadius: '3px'
          }}
        >
          Create Test Admin
        </button>
      </div>
    </div>
  );
};

export default DebugInfo;
