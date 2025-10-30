import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminDebug = () => {
  const { user, hasPermission, isAdmin } = useAuth();

  if (!user || user.role !== 'admin') {
    return null;
  }

  const permissions = [
    'dashboard_full',
    'view_users',
    'create_users',
    'products_full',
    'products_view',
    'orders_full',
    'suppliers_full',
    'reports_full',
    'reports_basic',
    'transactions_full',
    'inventory_full',
    'settings_full',
    'billing_full',
    'notifications_view'
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '1rem',
      fontSize: '12px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 10000,
      borderRadius: '0 8px 0 0'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>🔧 Admin Debug Panel</h4>
      <div><strong>User:</strong> {user.name} ({user.role})</div>
      <div><strong>Is Admin:</strong> {isAdmin ? '✅' : '❌'}</div>
      <div style={{ marginTop: '10px' }}>
        <strong>Permissions:</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginTop: '5px' }}>
          {permissions.map(permission => (
            <div key={permission} style={{ fontSize: '10px' }}>
              {hasPermission(permission) ? '✅' : '❌'} {permission}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
        Press F12 → Console for detailed logs
      </div>
    </div>
  );
};

export default AdminDebug;
