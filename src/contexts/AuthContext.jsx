import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { webSocketService } from '../services/websocket';
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '../constants/auth';
import { initializeDefaultUsers, resetAndInitializeUsers, debugUsers } from '../utils/initializeDefaultUsers';

export { ROLES, PERMISSIONS }; // Re-export for backward compatibility

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize default users first
        initializeDefaultUsers();
        
        // Add debug functions to window for testing (only in development)
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          window.resetUsers = resetAndInitializeUsers;
          window.debugUsers = debugUsers;
          window.initUsers = initializeDefaultUsers;
          // Import and add custom admin function
          import('../utils/initializeDefaultUsers').then(module => {
            window.addCustomAdmin = module.addCustomAdmin;
          });
        }
        
        const savedUser = localStorage.getItem('inventoryUser');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          
          // Notify WebSocket service about the authenticated user (optional)
          try {
            if (webSocketService && typeof webSocketService.send === 'function') {
              webSocketService.send({
                type: 'AUTH',
                userId: userData.id,
                role: userData.role
              });
            }
          } catch (error) {
            console.warn('WebSocket authentication failed, continuing without real-time features:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('inventoryUser');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);
  
  // Set up WebSocket message handler for auth-related updates
  useEffect(() => {
    const handleWebSocketMessage = (message) => {
      try {
        if (message.type === 'AUTH_UPDATE' && user && message.userId === user.id) {
          // Handle auth-related updates (e.g., session expiration, permission changes)
          if (message.action === 'SESSION_EXPIRED') {
            logout();
          } else if (message.action === 'PERMISSIONS_UPDATED') {
            // Refresh user data if permissions were updated
            const updatedUser = { ...user, permissions: message.permissions };
            setUser(updatedUser);
            localStorage.setItem('inventoryUser', JSON.stringify(updatedUser));
          }
        }
      } catch (error) {
        console.warn('Error handling WebSocket message:', error);
      }
    };

    try {
      if (webSocketService && typeof webSocketService.addMessageHandler === 'function') {
        webSocketService.addMessageHandler(handleWebSocketMessage);
        return () => {
          if (webSocketService && typeof webSocketService.removeMessageHandler === 'function') {
            webSocketService.removeMessageHandler(handleWebSocketMessage);
          }
        };
      }
    } catch (error) {
      console.warn('Failed to set up WebSocket message handler, continuing without real-time features:', error);
    }
    
    return () => {}; // Return empty cleanup function
  }, [user]);

  // Get all registered users (admin only)
  const getRegisteredUsers = () => {
    return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  };

  // Get user permissions based on role
  const getUserPermissions = (role) => {
    return ROLE_PERMISSIONS[role] || [];
  };

  // Check if user has a specific permission
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    // Check if the user's role has the required permission
    const rolePermissions = ROLE_PERMISSIONS[user?.role] || [];
    return rolePermissions.includes(permission);
  }, [user]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissions) => {
    if (!user) return false;
    const rolePermissions = ROLE_PERMISSIONS[user?.role] || [];
    return permissions.some(permission => rolePermissions.includes(permission));
  }, [user]);

  // Check if user has a specific role
  const hasRole = useCallback((role) => {
    if (!user) return false;
    return user.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  // Check if user is admin (boolean value, not function)
  const isAdmin = user?.role === 'admin';

  // Check if user is staff (boolean value, not function)
  const isStaff = user?.role === 'staff';

  // Login user
  const login = useCallback(async (email, password, role = null) => {
    try {
      // In a real app, this would be an API call
      const users = getRegisteredUsers();
      
      const foundUser = users.find(u => 
        u.email === email && u.password === password && u.status !== 'inactive'
      );

      if (!foundUser) {
        return { success: false, message: 'Invalid email or password' };
      }

      // If role is specified, verify the user has that role
      if (role && foundUser.role !== role) {
        return { success: false, message: 'Invalid role for this account' };
      }

      // Update user data
      const userData = { ...foundUser, lastLogin: new Date().toISOString() };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('inventoryUser', JSON.stringify(userData));
      
      // Log the login activity
      logActivity('login', 'User logged in');
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  }, []);

  // Logout user
  const logout = () => {
    if (user) {
      logActivity('logout', 'User logged out');
    }
    
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('inventoryUser');
  };

  // Log user activity
  const logActivity = (action, details) => {
    try {
      const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
      activities.push({
        userId: user?.id,
        action,
        details,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1' // In a real app, get this from the request
      });
      localStorage.setItem('userActivities', JSON.stringify(activities));
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Get user activities
  const getUserActivities = (userId = null) => {
    try {
      const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
      if (userId) {
        return activities.filter(activity => activity.userId === userId);
      }
      return activities;
    } catch (error) {
      console.error('Error getting user activities:', error);
      return [];
    }
  };

  // Register a new user
  const register = async (userData) => {
    try {
      const users = getRegisteredUsers();
      
      // Check if email already exists
      if (users.some(u => u.email === userData.email)) {
        return { success: false, message: 'Email already in use' };
      }

      // Create new user
      const newUser = {
        ...userData,
        id: `user-${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null,
        permissions: getUserPermissions(userData.role)
      };

      // Save user
      users.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      
      // Log the registration
      logActivity('user_registered', `New ${userData.role} account created`);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  // Update user profile
  const updateProfile = async (userId, updates) => {
    try {
      const users = getRegisteredUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return { success: false, message: 'User not found' };
      }

      // Update user data
      const updatedUser = { 
        ...users[userIndex], 
        ...updates,
        updatedAt: new Date().toISOString() 
      };
      
      // Save updated user
      users[userIndex] = updatedUser;
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      
      // Update current user if it's the same user
      if (user && user.id === userId) {
        setUser(updatedUser);
        localStorage.setItem('inventoryUser', JSON.stringify(updatedUser));
      }
      
      logActivity('profile_updated', 'User profile updated');
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'An error occurred while updating profile' };
    }
  };

  // Check if email exists
  const emailExists = async (email) => {
    const users = getRegisteredUsers();
    return { exists: users.some(u => u.email === email) };
  };

  // Get all users (admin only)
  const getAllUsers = () => {
    if (!hasPermission(PERMISSIONS.VIEW_USERS)) {
      throw new Error('Unauthorized');
    }
    return getRegisteredUsers();
  };

  // Create a new user (only for admin with create_users permission)
  const createUser = (userData) => {
    if (!hasPermission(PERMISSIONS.CREATE_USERS)) {
      throw new Error('Unauthorized');
    }
    return register({
      ...userData,
      role: userData.role || ROLES.STAFF,
      status: 'active'
    });
  };

  // Update user (only for admin with edit_users permission)
  const updateUser = (userId, updates) => {
    if (!hasPermission(PERMISSIONS.EDIT_USERS)) {
      throw new Error('Unauthorized');
    }
    return updateProfile(userId, updates);
  };

  // Delete user (only for admin with delete_users permission)
  const deleteUser = (userId) => {
    if (!hasPermission(PERMISSIONS.DELETE_USERS)) {
      throw new Error('Unauthorized');
    }
    
    if (user && user.id === userId) {
      throw new Error('Cannot delete your own account');
    }
    
    try {
      const users = getRegisteredUsers();
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      logActivity('user_deleted', `User ${userId} was deleted by ${user?.id}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, message: error.message };
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    ROLES,
    PERMISSIONS,
    hasPermission,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    isAdmin,
    isStaff,
    login,
    logout,
    register,
    updateProfile,
    logActivity,
    getUserActivities,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    emailExists
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
