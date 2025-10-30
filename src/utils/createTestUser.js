// Utility to create a test admin user for debugging
export const createTestAdminUser = () => {
  const testUser = {
    id: 'admin-test-001',
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123', // In real app, this would be hashed
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  // Save to registered users
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const userExists = existingUsers.some(user => user.email === testUser.email);
  
  if (!userExists) {
    existingUsers.push(testUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    console.log('✅ Test admin user created:', testUser.email);
  } else {
    console.log('ℹ️ Test admin user already exists');
  }

  // Also log them in automatically
  localStorage.setItem('inventoryUser', JSON.stringify(testUser));
  console.log('✅ Test admin user logged in automatically');

  return testUser;
};

// Call this function to create and login test user
if (typeof window !== 'undefined') {
  // Only run in browser environment
  window.createTestAdminUser = createTestAdminUser;
  console.log('🔧 Debug: Run createTestAdminUser() in console to create test admin');
}
