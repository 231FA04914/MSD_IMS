// User roles
export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier'
};

// User permissions
export const PERMISSIONS = {
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  MANAGE_ROLES: 'manage_roles',
  
  // System Configuration
  MANAGE_SETTINGS: 'manage_settings',
  CONFIGURE_SYSTEM: 'configure_system',
  
  // Monitoring & Oversight
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  VIEW_ACTIVITY_LOGS: 'view_activity_logs',
  
  // Financial Control
  VIEW_ALL_TRANSACTIONS: 'view_all_transactions',
  MANAGE_INVOICES: 'manage_invoices',
  APPROVE_REFUNDS: 'approve_refunds',
  
  // Inventory
  MANAGE_INVENTORY: 'manage_inventory',
  VIEW_REPORTS: 'view_reports',
  
  // Supplier Management
  APPROVE_SUPPLIERS: 'approve_suppliers',
  MANAGE_SUPPLIERS: 'manage_suppliers'
};

// Role to permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Dashboard
    'dashboard_full',
    // User management
    'view_users',
    'create_users', 
    'edit_users',
    'delete_users',
    'users_full',
    // Products
    'products_full',
    'products_view',
    // Orders
    'orders_full',
    'orders_add_incoming',
    // Reports
    'reports_full',
    'reports_basic',
    // Suppliers
    'suppliers_full',
    // Transactions
    'transactions_full',
    'inventory_full',
    // Settings
    'settings_full',
    // Billing
    'billing_full',
    // Notifications
    'notifications_view',
    'notifications_full'
  ],
  [ROLES.STAFF]: [
    'dashboard_limited',
    'products_full',
    'products_view',
    'orders_full',
    'orders_add_incoming',
    'reports_basic'
  ],
  [ROLES.CUSTOMER]: [
    'products_view',
    'orders_customer',
    'cart_access',
    'profile_view'
  ],
  [ROLES.SUPPLIER]: [
    'products_view'
  ]
};
