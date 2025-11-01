import { Link, useLocation } from "react-router-dom";
import { useAuth, ROLES } from "../contexts/AuthContext.jsx";
import { useInventory } from "../contexts/InventoryContext.jsx";
import "./styles/global.css";

const Sidebar = () => {
  const { user, logout, isAdmin, hasPermission } = useAuth();
  const { 
    lowStockCount = 0, 
    criticalStockCount = 0, 
    expiringProductsCount = 0, 
    criticalExpiryCount = 0, 
    expiredProductsCount = 0 
  } = useInventory() || {};
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="sidebar-logo">📦 IMS</div>
        {user && (
          <div className="sidebar-user">
            <div className="user-role">{user?.role}</div>
          </div>
        )}
      </div>

      {/* Navigation Links - ALL ADMIN PAGES RESTORED */}
      <nav className="sidebar-nav">
        {user?.role !== 'customer' && (
          <Link 
            to="/dashboard" 
            className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">🏠</span>
            <span className="sidebar-text">Dashboard</span>
            {(lowStockCount > 0 || expiringProductsCount > 0) && (
              <span className="alert-badge">
                {lowStockCount + expiringProductsCount}
              </span>
            )}
          </Link>
        )}

        {hasPermission("products_full") && (
          <Link 
            to="/products" 
            className={`sidebar-link ${isActive('/products') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">📦</span>
            <span className="sidebar-text">Products</span>
            {lowStockCount > 0 && (
              <span className="alert-badge">{lowStockCount}</span>
            )}
          </Link>
        )}

        {hasPermission("products_view") && !hasPermission("products_full") && (
          <Link 
            to="/products" 
            className={`sidebar-link ${isActive('/products') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">📦</span>
            <span className="sidebar-text">Products (View)</span>
            {lowStockCount > 0 && (
              <span className="alert-badge">{lowStockCount}</span>
            )}
          </Link>
        )}

        {hasPermission("suppliers_full") && (
          <Link 
            to="/suppliers" 
            className={`sidebar-link ${isActive('/suppliers') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">🤝</span>
            <span className="sidebar-text">Suppliers</span>
          </Link>
        )}

        {(hasPermission("orders_full") || hasPermission("orders_add_incoming")) && (
          <Link 
            to="/orders" 
            className={`sidebar-link ${isActive('/orders') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">📋</span>
            <span className="sidebar-text">Orders</span>
          </Link>
        )}

        {hasPermission("orders_full") && (
          <Link 
            to="/communication-logs" 
            className={`sidebar-link ${isActive('/communication-logs') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">💬</span>
            <span className="sidebar-text">Communication Logs</span>
          </Link>
        )}

        {(hasPermission("reports_full") || hasPermission("reports_basic")) && (
          <Link 
            to="/reports" 
            className={`sidebar-link ${isActive('/reports') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">📊</span>
            <span className="sidebar-text">Reports</span>
          </Link>
        )}

        {hasPermission("billing_full") && (
          <Link 
            to="/billing" 
            className={`sidebar-link ${isActive('/billing') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">💰</span>
            <span className="sidebar-text">Billing</span>
          </Link>
        )}

        {/* Customer-specific navigation */}
        {user?.role === 'customer' && (
          <>
            <Link 
              to="/customer-products" 
              className={`sidebar-link ${isActive('/customer-products') ? 'active' : ''}`}
            >
              <span className="sidebar-icon">🛍️</span>
              <span className="sidebar-text">Browse Products</span>
            </Link>
            
            <Link 
              to="/cart" 
              className={`sidebar-link ${isActive('/cart') ? 'active' : ''}`}
            >
              <span className="sidebar-icon">🛒</span>
              <span className="sidebar-text">My Cart</span>
            </Link>
            
            <Link 
              to="/my-orders" 
              className={`sidebar-link ${isActive('/my-orders') ? 'active' : ''}`}
            >
              <span className="sidebar-icon">📋</span>
              <span className="sidebar-text">My Orders</span>
            </Link>
            
            <Link 
              to="/customer-profile" 
              className={`sidebar-link ${isActive('/customer-profile') ? 'active' : ''}`}
            >
              <span className="sidebar-icon">👤</span>
              <span className="sidebar-text">My Profile</span>
            </Link>
          </>
        )}

        {(hasPermission("notifications_view") || isAdmin) && (
          <Link 
            to="/notifications" 
            className={`sidebar-link ${isActive('/notifications') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">🔔</span>
            <span className="sidebar-text">Notifications</span>
          </Link>
        )}

        {hasPermission("inventory_full") && (
          <Link 
            to="/transactions" 
            className={`sidebar-link ${isActive('/transactions') ? 'active' : ''}`}
          >
            <span className="sidebar-icon">💳</span>
            <span className="sidebar-text">Transactions</span>
          </Link>
        )}

        {isAdmin && (
          <>
            <Link 
              to="/user-management" 
              className={`sidebar-link ${isActive('/user-management') ? 'active' : ''}`}
            >
              <span className="sidebar-icon">👥</span>
              <span className="sidebar-text">User Management</span>
            </Link>
            
            <Link 
              to="/supplier-applications" 
              className={`sidebar-link ${isActive('/supplier-applications') ? 'active' : ''}`}
            >
              <span className="sidebar-icon">📝</span>
              <span className="sidebar-text">Supplier Applications</span>
            </Link>
            
            <Link 
              to="/settings" 
              className={`sidebar-link ${isActive('/settings') ? 'active' : ''}`}
            >
              <span className="sidebar-icon">⚙️</span>
              <span className="sidebar-text">Settings</span>
            </Link>
          </>
        )}

      </nav>
      {/* Logout Section */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout">
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-text">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
