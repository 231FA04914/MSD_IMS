// Initialize default users for the system
export const initializeDefaultUsers = () => {
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  
  // Check if default users already exist
  const hasAdmin = existingUsers.some(user => user.email === 'admin@inventory.com');
  const hasStaff = existingUsers.some(user => user.email === 'staff@inventory.com');
  const hasCustomer = existingUsers.some(user => user.email === 'customer@inventory.com');
  
  const defaultUsers = [];
  
  // Create default admin user
  if (!hasAdmin) {
    defaultUsers.push({
      id: 'admin-001',
      name: 'System Administrator',
      email: 'admin@inventory.com',
      password: 'admin123', // In production, this should be hashed
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      permissions: [
        'dashboard_full',
        'view_users',
        'create_users', 
        'edit_users',
        'delete_users',
        'users_full',
        'products_full',
        'products_view',
        'orders_full',
        'orders_add_incoming',
        'reports_full',
        'reports_basic',
        'suppliers_full',
        'transactions_full',
        'inventory_full',
        'settings_full',
        'billing_full',
        'notifications_view',
        'notifications_full'
      ]
    });
  }
  
  // Create default staff user
  if (!hasStaff) {
    defaultUsers.push({
      id: 'staff-001',
      name: 'Staff Member',
      email: 'staff@inventory.com',
      password: 'staff123', // In production, this should be hashed
      role: 'staff',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      permissions: [
        'dashboard_limited',
        'products_full',
        'products_view',
        'orders_full',
        'orders_add_incoming',
        'reports_basic'
      ]
    });
  }
  
  // Create default customer user
  if (!hasCustomer) {
    defaultUsers.push({
      id: 'customer-001',
      name: 'Demo Customer',
      email: 'customer@inventory.com',
      password: 'customer123', // In production, this should be hashed
      role: 'customer',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      permissions: [
        'products_view',
        'orders_customer',
        'cart_access',
        'profile_view'
      ]
    });
  }
  
  // Add default users to existing users
  if (defaultUsers.length > 0) {
    const updatedUsers = [...existingUsers, ...defaultUsers];
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    return defaultUsers;
  }
  
  return [];
};

// Get default credentials for testing
export const getDefaultCredentials = () => {
  return {
    admin: {
      email: 'admin@inventory.com',
      password: 'admin123',
      role: 'admin'
    },
    staff: {
      email: 'staff@inventory.com',
      password: 'staff123',
      role: 'staff'
    },
    customer: {
      email: 'customer@inventory.com',
      password: 'customer123',
      role: 'customer'
    }
  };
};

// Reset and reinitialize users (for debugging)
export const resetAndInitializeUsers = () => {
  console.log('🔄 Resetting users...');
  localStorage.removeItem('registeredUsers');
  localStorage.removeItem('inventoryUser');
  return initializeDefaultUsers();
};

// Debug function to check current users
export const debugUsers = () => {
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  console.log('🔍 Current users in localStorage:', users);
  return users;
};

// Add custom admin user function
export const addCustomAdmin = (name, email, password) => {
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  
  // Check if email already exists
  const emailExists = existingUsers.some(user => user.email === email);
  if (emailExists) {
    console.warn('⚠️ Email already exists:', email);
    return { success: false, message: 'Email already exists' };
  }
  
  // Create new admin user
  const newAdmin = {
    id: `admin-${Date.now()}`,
    name: name,
    email: email,
    password: password, // In production, this should be hashed
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: null,
    permissions: [
      'dashboard_full',
      'view_users',
      'create_users', 
      'edit_users',
      'delete_users',
      'users_full',
      'products_full',
      'products_view',
      'orders_full',
      'orders_add_incoming',
      'reports_full',
      'reports_basic',
      'suppliers_full',
      'transactions_full',
      'inventory_full',
      'settings_full',
      'billing_full',
      'notifications_view',
      'notifications_full'
    ]
  };
  
  // Add to users array
  const updatedUsers = [...existingUsers, newAdmin];
  localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
  
  console.log('✅ Custom admin created:', { email: newAdmin.email, role: newAdmin.role });
  return { success: true, user: newAdmin };
};
