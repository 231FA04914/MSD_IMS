import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../../contexts/InventoryContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";
import RoleGuard from "../RoleGuard";
import "../styles/global.css";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { hasPermission, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Use inventory context with safe defaults
  const { 
    products = [], 
    settings = {}, 
    getLowStockProducts = () => [], 
    getCriticalStockProducts = () => [], 
    lowStockCount = 0, 
    criticalStockCount = 0,
    getExpiringProducts = () => [],
    getCriticalExpiryProducts = () => [],
    getExpiredProducts = () => [],
    expiringProductsCount = 0,
    criticalExpiryCount = 0,
    expiredProductsCount = 0
  } = useInventory() || {};
  
  const { addNotificationToHistory } = useNotification() || {};

  const [sales] = useState([
    { id: 1, product: "Laptop", quantity: 2, date: "2025-09-01" },
    { id: 2, product: "Keyboard", quantity: 5, date: "2025-09-01" },
    { id: 3, product: "Mouse", quantity: 1, date: "2025-08-31" },
  ]);

  // Dashboard stats
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (parseInt(p.stock) || 0), 0);

  // Demo function to show notification
  const showLowStockAlert = () => {
    if (addNotificationToHistory) {
      const lowStockProducts = getLowStockProducts();
      addNotificationToHistory({
        type: 'lowStock',
        title: 'Low Stock Summary',
        message: `You have ${lowStockProducts.length} products with low stock. Check the Products page for details.`,
        channels: ["system"]
      });
    }
  };

  // Demo function to show expiry alert
  const showExpiryAlert = () => {
    if (addNotificationToHistory) {
      const expiringProducts = getExpiringProducts();
      const expiredProducts = getExpiredProducts();
      
      if (expiredProducts.length > 0) {
        addNotificationToHistory({
          type: 'expired',
          title: 'Expired Products Alert',
          message: `You have ${expiredProducts.length} expired products that need immediate attention!`,
          channels: ["system"]
        });
      } else if (expiringProducts.length > 0) {
        addNotificationToHistory({
          type: 'expiryWarning',
          title: 'Expiry Warning',
          message: `You have ${expiringProducts.length} products expiring soon. Check the Products page for details.`,
          channels: ["system"]
        });
      }
    }
  };

  // Quick Action handlers
  const handleAddProduct = () => {
    navigate('/products');
  };

  const handleNewOrder = () => {
    navigate('/orders');
  };

  const handleViewReports = () => {
    navigate('/reports');
  };

  const handleCreateInvoice = () => {
    navigate('/billing');
  };

  return (
    <div className="dashboard-container">
      {/* Hero Header Section */}
      <div className="dashboard-hero">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="gradient-text">Dashboard Overview</span>
            </h1>
            <p className="hero-subtitle">
              Welcome back! Here's what's happening with your inventory today.
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-number">{totalProducts}</span>
                <span className="stat-label">Products</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">{totalStock.toLocaleString()}</span>
                <span className="stat-label">Total Stock</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">{sales.length}</span>
                <span className="stat-label">Orders Today</span>
              </div>
            </div>
          </div>
          {hasPermission("dashboard_limited") && !hasPermission("dashboard_full") && (
            <div className="access-badge">
              <span className="badge badge-warning">Staff Access</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Metrics Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">📊 Key Performance Metrics</h2>
          <p className="section-subtitle">Real-time insights into your inventory performance</p>
        </div>
        
        <div className="enhanced-metrics-grid">
          <div className="enhanced-metric-card primary-card">
            <div className="metric-header">
              <div className="metric-icon-wrapper primary">
                <span className="metric-icon">📦</span>
              </div>
              <div className="metric-trend">
                <span className="trend-indicator up">↗</span>
                <span className="trend-text">+12%</span>
              </div>
            </div>
            <div className="metric-content">
              <h3>Total Products</h3>
              <div className="metric-value">{totalProducts}</div>
              <div className="metric-change positive">Growing inventory</div>
            </div>
            <div className="metric-footer">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
          
          <div className="enhanced-metric-card success-card">
            <div className="metric-header">
              <div className="metric-icon-wrapper success">
                <span className="metric-icon">📊</span>
              </div>
              <div className="metric-trend">
                <span className="trend-indicator up">↗</span>
                <span className="trend-text">+5%</span>
              </div>
            </div>
            <div className="metric-content">
              <h3>Total Stock</h3>
              <div className="metric-value">{totalStock.toLocaleString()}</div>
              <div className="metric-change positive">Units in inventory</div>
            </div>
            <div className="metric-footer">
              <div className="progress-bar">
                <div className="progress-fill success" style={{width: '85%'}}></div>
              </div>
            </div>
          </div>
          
          <div className="enhanced-metric-card info-card">
            <div className="metric-header">
              <div className="metric-icon-wrapper info">
                <span className="metric-icon">🛒</span>
              </div>
              <div className="metric-trend">
                <span className="trend-indicator neutral">→</span>
                <span className="trend-text">Today</span>
              </div>
            </div>
            <div className="metric-content">
              <h3>Recent Orders</h3>
              <div className="metric-value">{sales.length}</div>
              <div className="metric-change neutral">Transactions processed</div>
            </div>
            <div className="metric-footer">
              <div className="progress-bar">
                <div className="progress-fill info" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
          
          <div className={`enhanced-metric-card ${lowStockCount > 0 ? 'warning-card' : 'success-card'}`} onClick={showLowStockAlert}>
            <div className="metric-header">
              <div className={`metric-icon-wrapper ${lowStockCount > 0 ? 'warning' : 'success'}`}>
                <span className="metric-icon">{lowStockCount > 0 ? '⚠️' : '✅'}</span>
              </div>
              <div className="metric-trend">
                <span className={`trend-indicator ${lowStockCount > 0 ? 'down' : 'up'}`}>
                  {lowStockCount > 0 ? '↓' : '↗'}
                </span>
                <span className="trend-text">{lowStockCount > 0 ? 'Alert' : 'Good'}</span>
              </div>
            </div>
            <div className="metric-content">
              <h3>Stock Status</h3>
              <div className="metric-value">{lowStockCount}</div>
              <div className={`metric-change ${lowStockCount > 0 ? 'negative' : 'positive'}`}>
                {criticalStockCount > 0 ? `${criticalStockCount} Critical` : 'Stock levels healthy'}
              </div>
            </div>
            <div className="metric-footer">
              <div className="progress-bar">
                <div className={`progress-fill ${lowStockCount > 0 ? 'warning' : 'success'}`} 
                     style={{width: lowStockCount > 0 ? '30%' : '90%'}}></div>
              </div>
            </div>
          </div>
          
          <div className={`enhanced-metric-card ${(expiredProductsCount > 0 || criticalExpiryCount > 0) ? 'danger-card' : (expiringProductsCount > 0 ? 'warning-card' : 'success-card')}`} onClick={showExpiryAlert}>
            <div className="metric-header">
              <div className={`metric-icon-wrapper ${(expiredProductsCount > 0 || criticalExpiryCount > 0) ? 'danger' : (expiringProductsCount > 0 ? 'warning' : 'success')}`}>
                <span className="metric-icon">⏰</span>
              </div>
              <div className="metric-trend">
                <span className={`trend-indicator ${expiredProductsCount > 0 ? 'down' : 'neutral'}`}>
                  {expiredProductsCount > 0 ? '↓' : '→'}
                </span>
                <span className="trend-text">{expiredProductsCount > 0 ? 'Urgent' : 'Monitor'}</span>
              </div>
            </div>
            <div className="metric-content">
              <h3>Expiry Status</h3>
              <div className="metric-value">{expiringProductsCount}</div>
              <div className={`metric-change ${expiredProductsCount > 0 ? 'negative' : 'neutral'}`}>
                {expiredProductsCount > 0 ? `${expiredProductsCount} Expired` : 'Products monitored'}
              </div>
            </div>
            <div className="metric-footer">
              <div className="progress-bar">
                <div className={`progress-fill ${expiredProductsCount > 0 ? 'danger' : (expiringProductsCount > 0 ? 'warning' : 'success')}`} 
                     style={{width: expiredProductsCount > 0 ? '20%' : (expiringProductsCount > 0 ? '50%' : '85%')}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Welcome */}
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <RoleGuard permission="dashboard_full">
            <div className="welcome-card">
              <div className="welcome-header">
                <h2>Welcome to Your Inventory System</h2>
                <div className="system-status">
                  <span className="status-indicator active"></span>
                  <span>All systems operational</span>
                </div>
              </div>
              <div className="horizontal-feature-grid">
                <div className="horizontal-feature-item">
                  <div className="horizontal-feature-icon">📦</div>
                  <div className="horizontal-feature-content">
                    <div className="horizontal-feature-title">{totalProducts} Products</div>
                    <div className="horizontal-feature-desc">Across multiple categories</div>
                  </div>
                </div>
                <div className="horizontal-feature-item">
                  <div className="horizontal-feature-icon">📊</div>
                  <div className="horizontal-feature-content">
                    <div className="horizontal-feature-title">Real-time Monitoring</div>
                    <div className="horizontal-feature-desc">Stock levels & alerts</div>
                  </div>
                </div>
                <div className="horizontal-feature-item">
                  <div className="horizontal-feature-icon">💰</div>
                  <div className="horizontal-feature-content">
                    <div className="horizontal-feature-title">Billing System</div>
                    <div className="horizontal-feature-desc">Invoice generation</div>
                  </div>
                </div>
                <div className="horizontal-feature-item">
                  <div className="horizontal-feature-icon">👥</div>
                  <div className="horizontal-feature-content">
                    <div className="horizontal-feature-title">User Management</div>
                    <div className="horizontal-feature-desc">Role-based access</div>
                  </div>
                </div>
                <div className="horizontal-feature-item">
                  <div className="horizontal-feature-icon">🤝</div>
                  <div className="horizontal-feature-content">
                    <div className="horizontal-feature-title">Supplier Network</div>
                    <div className="horizontal-feature-desc">Partner management</div>
                  </div>
                </div>
                <div className="horizontal-feature-item">
                  <div className="horizontal-feature-icon">🔔</div>
                  <div className="horizontal-feature-content">
                    <div className="horizontal-feature-title">Smart Alerts</div>
                    <div className="horizontal-feature-desc">Automated notifications</div>
                  </div>
                </div>
              </div>
            </div>
          </RoleGuard>

          <RoleGuard permission="dashboard_limited">
            <div className="welcome-card staff-welcome">
              <div className="welcome-header">
                <h2>Welcome back, {user?.name}!</h2>
                <div className="role-badge">
                  <span className="badge badge-info">Staff Member</span>
                </div>
              </div>
              <div className="staff-features">
                <div className="staff-feature">
                  <span className="feature-icon">📦</span>
                  <span>Manage {totalProducts} products</span>
                </div>
                <div className="staff-feature">
                  <span className="feature-icon">🔔</span>
                  <span>Monitor {lowStockCount} stock alerts</span>
                </div>
                <div className="staff-feature">
                  <span className="feature-icon">⏰</span>
                  <span>Track {expiringProductsCount} expiring items</span>
                </div>
                <div className="staff-feature">
                  <span className="feature-icon">📋</span>
                  <span>Process orders & reports</span>
                </div>
              </div>
            </div>
          </RoleGuard>
        </div>
        
        <div className="dashboard-section">
          <div className="enhanced-quick-actions-card">
            <div className="actions-header">
              <h3>⚡ Quick Actions</h3>
              <p>Streamline your workflow with one-click actions</p>
            </div>
            <div className="enhanced-actions-grid">
              <button className="enhanced-action-btn primary-action" onClick={handleAddProduct}>
                <div className="action-icon-wrapper">
                  <span className="action-icon">➕</span>
                </div>
                <div className="action-content">
                  <span className="action-title">Add Product</span>
                  <span className="action-desc">Create new inventory item</span>
                </div>
                <div className="action-arrow">→</div>
              </button>
              
              <button className="enhanced-action-btn secondary-action" onClick={handleNewOrder}>
                <div className="action-icon-wrapper">
                  <span className="action-icon">📋</span>
                </div>
                <div className="action-content">
                  <span className="action-title">New Order</span>
                  <span className="action-desc">Process customer order</span>
                </div>
                <div className="action-arrow">→</div>
              </button>
              
              <button className="enhanced-action-btn info-action" onClick={handleViewReports}>
                <div className="action-icon-wrapper">
                  <span className="action-icon">📊</span>
                </div>
                <div className="action-content">
                  <span className="action-title">View Reports</span>
                  <span className="action-desc">Analytics & insights</span>
                </div>
                <div className="action-arrow">→</div>
              </button>
              
              <button className="enhanced-action-btn success-action" onClick={handleCreateInvoice}>
                <div className="action-icon-wrapper">
                  <span className="action-icon">💰</span>
                </div>
                <div className="action-content">
                  <span className="action-title">Create Invoice</span>
                  <span className="action-desc">Generate billing document</span>
                </div>
                <div className="action-arrow">→</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      <div className="enhanced-activity-section">
        <div className="section-header">
          <h2 className="section-title">📈 Recent Activity</h2>
          <p className="section-subtitle">Stay updated with the latest transactions and system events</p>
        </div>
        
        <div className="activity-grid">
          <div className="enhanced-activity-card">
            <div className="activity-card-header">
              <div className="activity-card-title">
                <span className="activity-card-icon">🛒</span>
                <h3>Sales Activity</h3>
              </div>
              <button className="enhanced-view-all-btn">View All →</button>
            </div>
            <div className="enhanced-activity-list">
              {sales.map((sale) => (
                <div key={sale.id} className="enhanced-activity-item">
                  <div className="activity-item-icon">
                    <span className="item-icon">🛍️</span>
                  </div>
                  <div className="activity-item-content">
                    <div className="activity-item-title">{sale.product}</div>
                    <div className="activity-item-meta">
                      <span className="quantity-badge">Qty: {sale.quantity}</span>
                      <span className="date-text">{sale.date}</span>
                    </div>
                  </div>
                  <div className="activity-item-status">
                    <span className="status-badge success">✓ Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="enhanced-activity-card">
            <div className="activity-card-header">
              <div className="activity-card-title">
                <span className="activity-card-icon">🔔</span>
                <h3>System Alerts</h3>
              </div>
              <button className="enhanced-view-all-btn">View All →</button>
            </div>
            <div className="enhanced-activity-list">
              <div className="enhanced-activity-item">
                <div className="activity-item-icon warning">
                  <span className="item-icon">⚠️</span>
                </div>
                <div className="activity-item-content">
                  <div className="activity-item-title">Low Stock Alert</div>
                  <div className="activity-item-meta">
                    <span className="alert-text">{lowStockCount} items need restocking</span>
                  </div>
                </div>
                <div className="activity-item-status">
                  <span className="status-badge warning">⚠ Action Required</span>
                </div>
              </div>
              
              <div className="enhanced-activity-item">
                <div className="activity-item-icon info">
                  <span className="item-icon">📊</span>
                </div>
                <div className="activity-item-content">
                  <div className="activity-item-title">Daily Report Generated</div>
                  <div className="activity-item-meta">
                    <span className="alert-text">Inventory summary ready</span>
                  </div>
                </div>
                <div className="activity-item-status">
                  <span className="status-badge info">ℹ Ready</span>
                </div>
              </div>
              
              <div className="enhanced-activity-item">
                <div className="activity-item-icon success">
                  <span className="item-icon">✅</span>
                </div>
                <div className="activity-item-content">
                  <div className="activity-item-title">System Backup Complete</div>
                  <div className="activity-item-meta">
                    <span className="alert-text">All data secured successfully</span>
                  </div>
                </div>
                <div className="activity-item-status">
                  <span className="status-badge success">✓ Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
