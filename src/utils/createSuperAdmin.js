// One-time script to create a Super Admin user
const createSuperAdmin = () => {
  if (typeof window === 'undefined') return;

  try {
    // Get existing users or initialize empty array
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if super admin already exists
    const superAdminExists = users.some(user => user.role === 'superadmin');
    
    if (!superAdminExists) {
      // Create super admin user
      const superAdmin = {
        id: 'superadmin-' + Date.now(),
        name: 'Super Admin',
        email: 'superadmin@inventory.com',
        password: 'Admin@123',
        role: 'superadmin',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add super admin to users
      users.push(superAdmin);
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      
      console.log('Super Admin created successfully!');
      console.log('Email: superadmin@inventory.com');
      console.log('Password: Admin@123');
      
      return true;
    } else {
      console.log('Super Admin already exists');
      return false;
    }
  } catch (error) {
    console.error('Error creating Super Admin:', error);
    return false;
  }
};

// Run the function
createSuperAdmin();
