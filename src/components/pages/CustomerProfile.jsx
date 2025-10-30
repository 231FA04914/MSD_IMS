import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useInventory } from "../../contexts/InventoryContext.jsx";
import RoleGuard from "../RoleGuard.jsx";
import { getRupeesValue } from "../../utils/currency.js";
import "../styles/global.css";

const CustomerProfile = () => {
  const { user, logout } = useAuth();
  const { products } = useInventory();
  const [customerOrders, setCustomerOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
    
    // Set up event listeners for automatic updates
    const handleOrderPlaced = () => {
      console.log('CustomerProfile - Order placed event received, refreshing data...');
      setTimeout(() => loadCustomerData(), 100);
    };

    const handleWindowFocus = () => {
      console.log('CustomerProfile - Window focused, refreshing data...');
      loadCustomerData();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'orders' || e.key === 'cart') {
        console.log('CustomerProfile - Storage changed, refreshing data...');
        loadCustomerData();
      }
    };

    // Add event listeners
    window.addEventListener('orderPlaced', handleOrderPlaced);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('storage', handleStorageChange);

    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('CustomerProfile - Periodic refresh...');
      loadCustomerData();
    }, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('orderPlaced', handleOrderPlaced);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(refreshInterval);
    };
  }, [user]);

  const loadCustomerData = () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    // Load customer orders from the main orders localStorage (not customerOrders)
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    console.log('CustomerProfile - All orders from localStorage:', allOrders);
    console.log('CustomerProfile - Current user email:', user?.email);
    
    // Filter orders for current customer (case-insensitive)
    const userOrders = allOrders.filter(order => {
      const orderEmail = order.customerEmail?.toLowerCase();
      const userEmail = user?.email?.toLowerCase();
      const matches = orderEmail === userEmail;
      
      if (!matches && order.customerEmail) {
        console.log('CustomerProfile - Order email mismatch:', {
          orderEmail: order.customerEmail,
          userEmail: user?.email
        });
      }
      
      return matches;
    });
    
    console.log('CustomerProfile - Filtered user orders:', userOrders);
    setCustomerOrders(userOrders);

    // Load cart items from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    setLoading(false);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (getRupeesValue(item.price) * item.quantity), 0);
  };

  const getTotalOrders = () => {
    return customerOrders.length;
  };

  const getRecentOrders = () => {
    return customerOrders
      .sort((a, b) => new Date(b.date || b.orderDate) - new Date(a.date || a.orderDate))
      .slice(0, 5);
  };

  const calculateOrderTotal = (order) => {
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((total, item) => {
        return total + (getRupeesValue(item.price) * item.quantity);
      }, 0);
    }
    return order.total ? getRupeesValue(order.total) : 0;
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Simulate profile update
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // Simulate password change
    alert('Password changed successfully!');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["customer", "Customer"]}>
      <div className="customer-profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-role">Customer</p>
          </div>
          <div className="profile-actions">
            <button 
              className="refresh-profile-btn"
              onClick={loadCustomerData}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? '🔄 Refreshing...' : `🔄 Refresh (${customerOrders.length} orders)`}
            </button>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <h3>{getTotalOrders()}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛍️</div>
            <div className="stat-content">
              <h3>{cartItems.length}</h3>
              <p>Cart Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>₹{getCartTotal().toLocaleString('en-IN')}</h3>
              <p>Cart Total</p>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="profile-sections">
          {/* Personal Information */}
          <div className="profile-section">
            <h2>Personal Information</h2>
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  defaultValue={user?.name}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  defaultValue={user?.email}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="Enter your phone number"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea 
                  placeholder="Enter your address"
                  className="form-textarea"
                  rows="3"
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Update Profile
              </button>
            </form>
          </div>

          {/* Security Settings */}
          <div className="profile-section">
            <h2>Security Settings</h2>
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  placeholder="Enter current password"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password"
                  className="form-input"
                  required
                />
              </div>
              <button type="submit" className="btn btn-warning">
                Change Password
              </button>
            </form>
          </div>

          {/* Recent Orders */}
          <div className="profile-section">
            <h2>Recent Orders</h2>
            {getRecentOrders().length > 0 ? (
              <div className="recent-orders">
                {getRecentOrders().map((order) => (
                  <div key={order.id} className="order-summary">
                    <div className="order-info">
                      <h4>Order #{order.orderNumber || order.id}</h4>
                      <p>{order.items?.length || 0} items • ₹{calculateOrderTotal(order).toLocaleString('en-IN')}</p>
                      <span className={`status-badge ${order.status?.toLowerCase() || 'pending'}`}>
                        {order.status || 'Pending'}
                      </span>
                    </div>
                    <div className="order-date">
                      {new Date(order.orderDate || order.date).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                ))}
                <button className="btn btn-secondary" onClick={() => window.location.href = '/my-orders'}>
                  View All Orders
                </button>
              </div>
            ) : (
              <div className="empty-state">
                <p>No orders yet. Start shopping!</p>
                <button className="btn btn-primary" onClick={() => window.location.href = '/customer-products'}>
                  Browse Products
                </button>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="profile-section">
            <h2>Account Actions</h2>
            <div className="account-actions">
              <button className="btn btn-info" onClick={() => window.location.href = '/cart'}>
                View Cart ({cartItems.length} items)
              </button>
              <button className="btn btn-secondary" onClick={() => window.location.href = '/my-orders'}>
                Order History
              </button>
              <button className="btn btn-success" onClick={() => window.location.href = '/customer-products'}>
                Browse Products
              </button>
              <button className="btn btn-danger" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default CustomerProfile;
