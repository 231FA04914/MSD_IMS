import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../../contexts/InventoryContext";
import { useAuth } from "../../contexts/AuthContext";
import RoleGuard from "../RoleGuard";
import { formatCurrency } from "../../utils/currency.js";
import "../styles/global.css";

const CustomerDashboard = () => {
  const { user, isCustomer } = useAuth();
  const navigate = useNavigate();
  
  // Use inventory context with safe defaults
  const { 
    products = [], 
    getLowStockProducts = () => [], 
    getCriticalStockProducts = () => []
  } = useInventory() || {};

  const [recentOrders, setRecentOrders] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Load recent orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const customerOrders = orders.filter(order => order.customerEmail === user?.email);
    setRecentOrders(customerOrders.slice(0, 5)); // Show last 5 orders

    // Load cart count from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);
  }, [user?.email]);

  // Dashboard stats for customers
  const availableProducts = products.filter(p => parseInt(p.stock) > 0).length;
  const totalProducts = products.length;
  const outOfStockProducts = products.filter(p => parseInt(p.stock) === 0).length;

  const navigateToProducts = () => {
    navigate("/customer-products");
  };

  const navigateToOrders = () => {
    navigate("/my-orders");
  };

  const navigateToCart = () => {
    navigate("/cart");
  };

  return (
    <RoleGuard permission="customer_dashboard">
      <div className="dashboard-container customer-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Customer Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome back, {user?.name}! Browse products and manage your orders.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3 className="stat-title">Available Products</h3>
              <p className="stat-value">{availableProducts}</p>
              <p className="stat-description">Ready to order</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <h3 className="stat-title">Cart Items</h3>
              <p className="stat-value">{cartCount}</p>
              <p className="stat-description">Items in cart</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3 className="stat-title">Total Orders</h3>
              <p className="stat-value">{recentOrders.length}</p>
              <p className="stat-description">Order history</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3 className="stat-title">Out of Stock</h3>
              <p className="stat-value">{outOfStockProducts}</p>
              <p className="stat-description">Unavailable items</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          
          {/* All Actions Side by Side */}
          <div className="all-actions-row">
            <button 
              className="action-card primary-action third-width"
              onClick={navigateToProducts}
            >
              <div className="action-icon">🛍️</div>
              <h3>Browse Products</h3>
              <p>View and order available products</p>
            </button>

            <button 
              className="action-card secondary-action third-width"
              onClick={navigateToCart}
            >
              <div className="action-icon">🛒</div>
              <h3>View Cart</h3>
              <p>Review items before checkout</p>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>

            <button 
              className="action-card secondary-action third-width"
              onClick={navigateToOrders}
            >
              <div className="action-icon">📦</div>
              <h3>My Orders</h3>
              <p>View order history and status</p>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders">
          <div className="section-header">
            <h2 className="section-title">Recent Orders</h2>
            <button className="view-all-btn" onClick={navigateToOrders}>
              View All Orders
            </button>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="orders-list">
              {recentOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <h4 className="order-id">Order #{order.id}</h4>
                    <p className="order-date">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                    <p className="order-items">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="order-details">
                    <p className="order-total">
                      Total: ${order.totalAmount.toFixed(2)}
                    </p>
                    <span className={`order-status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No orders yet</h3>
              <p>Start shopping to see your order history here.</p>
              <button className="primary-btn" onClick={navigateToProducts}>
                Browse Products
              </button>
            </div>
          )}
        </div>

        {/* Popular Products */}
        <div className="popular-products">
          <h2 className="section-title">Popular Products</h2>
          <div className="products-grid">
            {products.slice(0, 4).map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">{formatCurrency(product.price)}</p>
                  <p className={`product-stock ${parseInt(product.stock) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {parseInt(product.stock) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </p>
                </div>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => navigateToProducts()}
                  disabled={parseInt(product.stock) === 0}
                >
                  {parseInt(product.stock) > 0 ? 'Add to Cart' : 'Unavailable'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default CustomerDashboard;
