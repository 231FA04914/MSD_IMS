import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import RoleGuard from "../RoleGuard";
import { formatCurrency, getRupeesValue } from "../../utils/currency.js";
import "../styles/global.css";

const MyOrders = () => {
  const { user, isCustomer } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [trackingPopup, setTrackingPopup] = useState({ show: false, order: null });
  const [statusUpdates, setStatusUpdates] = useState([]);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showOrdersLoaded, setShowOrdersLoaded] = useState(false);

  // Order status flow for customers
  const orderStatuses = [
    { value: "pending", label: "Pending", icon: "⏳", color: "#ffc107" },
    { value: "processed", label: "Processed", icon: "🔄", color: "#17a2b8" },
    { value: "shipped", label: "Shipped", icon: "📦", color: "#007bff" },
    { value: "delivered", label: "Delivered", icon: "✅", color: "#28a745" }
  ];

  useEffect(() => {
    loadOrders();
    checkForStatusUpdates();
    
    // Set up polling for status updates every 30 seconds
    const interval = setInterval(() => {
      checkForStatusUpdates();
      loadOrders(); // Refresh orders to get latest status
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  // Filter orders whenever orders, statusFilter, or searchTerm changes
  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchTerm]);

  // Listen for new orders from cart checkout
  useEffect(() => {
    const handleOrderPlaced = (event) => {
      console.log('MyOrders - Order placed event received:', event.detail);
      // Refresh orders when a new order is placed
      setTimeout(() => {
        loadOrders();
      }, 100); // Small delay to ensure localStorage is updated
    };

    const handleWindowFocus = () => {
      console.log('MyOrders - Window focused, refreshing orders...');
      loadOrders();
    };

    window.addEventListener('orderPlaced', handleOrderPlaced);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('orderPlaced', handleOrderPlaced);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const checkForStatusUpdates = () => {
    if (!user?.email) return;

    // Get notifications for this customer
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const customerNotifications = notifications.filter(
      notification => 
        notification.customerEmail === user.email && 
        notification.type === 'order_status_update' &&
        !notification.read
    );

    if (customerNotifications.length > 0) {
      // Show the latest status update
      const latestUpdate = customerNotifications[customerNotifications.length - 1];
      setStatusUpdates(customerNotifications);
      setShowStatusUpdate(true);

      // Mark notifications as read after showing
      setTimeout(() => {
        markNotificationsAsRead(customerNotifications.map(n => n.id));
      }, 5000);
    }
  };

  const markNotificationsAsRead = (notificationIds) => {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updatedNotifications = notifications.map(notification =>
      notificationIds.includes(notification.id) 
        ? { ...notification, read: true }
        : notification
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const loadOrders = () => {
    setLoading(true);
    
    try {
      // Load orders from localStorage
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      console.log('MyOrders - All orders from localStorage:', allOrders);
      console.log('MyOrders - Current user email:', user?.email);
      console.log('MyOrders - Current user object:', user);
      
      // Debug each order
      allOrders.forEach((order, index) => {
        console.log(`MyOrders - Order ${index}:`, {
          id: order.id,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          itemsCount: order.items?.length || 0,
          status: order.status,
          date: order.date || order.orderDate,
          total: order.total
        });
      });
      
      // Filter orders for the current customer (case-insensitive email comparison)
      const customerOrders = allOrders.filter(order => {
        const orderEmail = order.customerEmail?.toLowerCase();
        const userEmail = user?.email?.toLowerCase();
        const matches = orderEmail === userEmail;
        if (!matches) {
          console.log(`MyOrders - Order ${order.id} doesn't match user email:`, {
            orderEmail: order.customerEmail,
            userEmail: user?.email,
            orderEmailLower: orderEmail,
            userEmailLower: userEmail
          });
        }
        return matches;
      });
      console.log('MyOrders - Filtered customer orders:', customerOrders);
      
      // Sort orders by date (newest first)
      const sortedOrders = customerOrders.sort((a, b) => 
        new Date(b.date || b.orderDate) - new Date(a.date || a.orderDate)
      );
      
      setOrders(sortedOrders);
      setLoading(false);
      
      // Show success message if orders were loaded
      if (sortedOrders.length > 0) {
        setShowOrdersLoaded(true);
        setTimeout(() => setShowOrdersLoaded(false), 3000);
      }
    } catch (error) {
      console.error('MyOrders - Error loading orders:', error);
      setOrders([]);
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (!orders || orders.length === 0) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term (product name or order ID)
    if (searchTerm) {
      filtered = filtered.filter(order => {
        // Check if order has items and search in item names
        const itemMatch = order.items && order.items.some(item => 
          item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Check if search term matches order ID
        const idMatch = order.id && order.id.toString().includes(searchTerm);
        return itemMatch || idMatch;
      });
    }

    console.log('MyOrders - filterOrders result:', {
      originalCount: orders.length,
      filteredCount: filtered.length,
      statusFilter,
      searchTerm
    });

    setFilteredOrders(filtered);
  };

  const getOrderStatus = (status) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) {
      console.log('MyOrders - calculateOrderTotal: No items or invalid items array:', items);
      return 0;
    }
    return items.reduce((total, item) => {
      const itemTotal = getRupeesValue(item.price) * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const trackOrder = (order) => {
    // Calculate delivery dates based on order status and date
    const orderDate = new Date(order.date);
    const deliveryDates = calculateDeliveryDates(orderDate, order.status);
    
    setTrackingPopup({ 
      show: true, 
      order: { ...order, deliveryDates } 
    });
  };

  // Calculate delivery dates for each status
  const calculateDeliveryDates = (orderDate, currentStatus) => {
    const dates = {};
    
    // Pending: Same day as order
    dates.pending = new Date(orderDate);
    
    // Processed: 1 day after order
    dates.processed = new Date(orderDate);
    dates.processed.setDate(dates.processed.getDate() + 1);
    
    // Shipped: 2 days after order
    dates.shipped = new Date(orderDate);
    dates.shipped.setDate(dates.shipped.getDate() + 2);
    
    // Delivered: 3-4 days after order (depending on current status)
    dates.delivered = new Date(orderDate);
    if (currentStatus === 'delivered') {
      // If already delivered, use actual delivery date (3-4 days after order)
      dates.delivered.setDate(dates.delivered.getDate() + 3);
    } else {
      // Estimated delivery date
      dates.delivered.setDate(dates.delivered.getDate() + 4);
    }
    
    return dates;
  };

  const closeTrackingPopup = () => {
    setTrackingPopup({ show: false, order: null });
  };

  const reorderItems = (items) => {
    // Add items to cart for reordering
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    items.forEach(item => {
      // Check if item already exists in cart
      const existingItemIndex = existingCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        existingCart[existingItemIndex].quantity += item.quantity;
      } else {
        // Add new item to cart
        existingCart.push({
          ...item,
          cartId: Date.now() + Math.random()
        });
      }
    });
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    navigate('/cart');
  };

  const getStatusProgress = (status) => {
    const statusIndex = orderStatuses.findIndex(s => s.value === status);
    return ((statusIndex + 1) / orderStatuses.length) * 100;
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['customer', 'Customer']}>
        <div className="page-container">
          <div className="loading-state">
            <div className="loading-spinner">⏳</div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['customer', 'Customer']}>
      <div className="page-container">
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1>📋 My Orders</h1>
              <p>View and track your order history</p>
            </div>
            <div className="header-actions">
              <button 
                className="refresh-orders-btn"
                onClick={loadOrders}
                disabled={loading}
              >
                🔄 {loading ? 'Loading...' : `Refresh (${orders.length} orders)`}
              </button>
              <button 
                className="debug-btn"
                onClick={() => {
                  console.log('=== DEBUG INFO ===');
                  console.log('Current user:', user);
                  console.log('All orders in localStorage:', JSON.parse(localStorage.getItem('orders') || '[]'));
                  console.log('Current orders state:', orders);
                  console.log('Current filteredOrders state:', filteredOrders);
                  console.log('Status filter:', statusFilter);
                  console.log('Search term:', searchTerm);
                  alert('Debug info logged to console. Check browser console (F12).');
                }}
                style={{ marginLeft: '10px', padding: '8px 16px', fontSize: '14px' }}
              >
                🐛 Debug
              </button>
            </div>
          </div>
        </div>

        {/* Order Statistics */}
        <div className="order-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-value">{orders.length}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending</h3>
              <p className="stat-value">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Delivered</h3>
              <p className="stat-value">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Spent</h3>
              <p className="stat-value">
                ₹{orders.reduce((total, order) => total + calculateOrderTotal(order.items), 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="orders-controls">
          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search orders by product or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
          
          <div className="filter-section">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              {orderStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No orders found</h3>
              <p>
                {orders.length === 0 
                  ? "You haven't placed any orders yet." 
                  : "No orders match your current filters."
                }
              </p>
              {orders.length === 0 && (
                <button 
                  className="primary-btn"
                  onClick={() => navigate('/customer-products')}
                >
                  Browse Products
                </button>
              )}
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map(order => {
                const statusInfo = getOrderStatus(order.status);
                const orderTotal = calculateOrderTotal(order.items);
                
                return (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h3 className="order-id">Order #{order.id}</h3>
                        <p className="order-date">{formatDate(order.date || order.orderDate)}</p>
                      </div>
                      <div className="order-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: statusInfo.color }}
                        >
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Order Progress */}
                    <div className="order-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${getStatusProgress(order.status)}%`,
                            backgroundColor: statusInfo.color
                          }}
                        ></div>
                      </div>
                      <div className="progress-steps">
                        {orderStatuses.map((status, index) => (
                          <div 
                            key={status.value}
                            className={`progress-step ${
                              orderStatuses.findIndex(s => s.value === order.status) >= index 
                                ? 'completed' : 'pending'
                            }`}
                          >
                            <span className="step-icon">{status.icon}</span>
                            <span className="step-label">{status.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="order-items">
                      <h4>Items ({order.items?.length || 0})</h4>
                      <div className="items-list">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div key={item.id || index} className="order-item">
                              <div className="item-details">
                                <span className="item-name">{item.name}</span>
                                <span className="item-unit">
                                  {item.unit === 'kg' ? `${item.quantity} kg` : `Qty: ${item.quantity}`}
                                </span>
                              </div>
                              <div className="item-pricing">
                                <span className="item-unit-price">₹{getRupeesValue(item.price).toLocaleString('en-IN')} each</span>
                                <span className="item-total-price">₹{(getRupeesValue(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-items">No items found</div>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>₹{orderTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="summary-row">
                        <span>Delivery:</span>
                        <span>₹{((order.deliveryFee || 0) * 83).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span>₹{(orderTotal + ((order.deliveryFee || 0) * 83)).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    {order.deliveryAddress && (
                      <div className="delivery-info">
                        <h4>📬 Delivery Address</h4>
                        <p>{order.deliveryAddress.address}</p>
                        <p>{order.deliveryAddress.city}, {order.deliveryAddress.postalCode}</p>
                        <p>📞 {order.deliveryAddress.phone}</p>
                      </div>
                    )}

                    {/* Order Actions */}
                    <div className="order-actions">
                      <button 
                        className="action-btn secondary"
                        onClick={() => trackOrder(order)}
                      >
                        📊 Track Order
                      </button>
                      
                      {order.status === 'delivered' && (
                        <button 
                          className="action-btn primary"
                          onClick={() => reorderItems(order.items)}
                        >
                          🔄 Reorder
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Order Tracking Popup */}
      {trackingPopup.show && trackingPopup.order && (
        <div className="popup-overlay" onClick={closeTrackingPopup}>
          <div className="tracking-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>📦 Order Tracking</h3>
              <button className="close-btn" onClick={closeTrackingPopup}>×</button>
            </div>
            
            <div className="popup-content">
              <div className="order-info">
                <p><strong>Order ID:</strong> {trackingPopup.order.orderNumber || trackingPopup.order.id}</p>
                <p><strong>Order Date:</strong> {formatDate(trackingPopup.order.date || trackingPopup.order.orderDate)}</p>
                <p><strong>Total:</strong> ₹{calculateOrderTotal(trackingPopup.order.items).toLocaleString('en-IN')}</p>
              </div>

              <div className="tracking-progress">
                <h4>Order Status</h4>
                <div className="status-timeline">
                  {orderStatuses.map((status, index) => {
                    const isActive = status.value === trackingPopup.order.status;
                    const isCompleted = orderStatuses.findIndex(s => s.value === trackingPopup.order.status) >= index;
                    const deliveryDate = trackingPopup.order.deliveryDates?.[status.value];
                    
                    return (
                      <div 
                        key={status.value} 
                        className={`status-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      >
                        <div className="status-icon" style={{ backgroundColor: isCompleted ? status.color : '#e9ecef' }}>
                          {status.icon}
                        </div>
                        <div className="status-info">
                          <h5 style={{ color: isCompleted ? status.color : '#6c757d' }}>
                            {status.label}
                          </h5>
                          {deliveryDate && (
                            <p className="delivery-date">
                              {isCompleted ? 'Completed on:' : isActive ? 'Expected:' : 'Estimated:'} {' '}
                              {deliveryDate.toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          )}
                          {isActive && (
                            <p className="current-status">Current Status</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="estimated-delivery">
                {trackingPopup.order.status === 'pending' && (
                  <div className="delivery-estimate">
                    <p><strong>⏳ Processing:</strong> Your order is being prepared</p>
                    <p><strong>📅 Expected Delivery:</strong> {' '}
                      {trackingPopup.order.deliveryDates?.delivered.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {trackingPopup.order.status === 'processed' && (
                  <div className="delivery-estimate">
                    <p><strong>🔄 Processed:</strong> Order confirmed and ready for shipment</p>
                    <p><strong>📅 Expected Delivery:</strong> {' '}
                      {trackingPopup.order.deliveryDates?.delivered.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {trackingPopup.order.status === 'shipped' && (
                  <div className="delivery-estimate">
                    <p><strong>📦 Shipped:</strong> Your order is on the way!</p>
                    <p><strong>📅 Expected Delivery:</strong> {' '}
                      {trackingPopup.order.deliveryDates?.delivered.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {trackingPopup.order.status === 'delivered' && (
                  <div className="delivery-complete">
                    <p><strong>✅ Delivered Successfully!</strong></p>
                    <p><strong>📅 Delivered on:</strong> {' '}
                      {trackingPopup.order.deliveryDates?.delivered.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Notification */}
      {showStatusUpdate && statusUpdates.length > 0 && (
        <div className="status-update-notification">
          <div className="notification-content">
            <div className="notification-header">
              <h4>📦 Order Status Updated!</h4>
              <button 
                className="close-notification"
                onClick={() => setShowStatusUpdate(false)}
              >
                ×
              </button>
            </div>
            <div className="notification-body">
              {statusUpdates.map((update, index) => (
                <div key={update.id} className="status-update-item">
                  <div className="update-info">
                    <p><strong>Order #{update.orderId}</strong></p>
                    <p className="status-change">
                      Status updated to: <span className={`status-badge status-${update.status}`}>
                        {orderStatuses.find(s => s.value === update.status)?.icon} {' '}
                        {orderStatuses.find(s => s.value === update.status)?.label || update.status}
                      </span>
                    </p>
                    <p className="update-time">
                      {new Date(update.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="notification-actions">
              <button 
                className="view-orders-btn"
                onClick={() => {
                  setShowStatusUpdate(false);
                  // Refresh the page to show updated orders
                  window.location.reload();
                }}
              >
                View Updated Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Loaded Success Message */}
      {showOrdersLoaded && (
        <div className="orders-loaded-notification">
          <div className="notification-content">
            <span className="success-icon">✅</span>
            <span>Orders loaded successfully! Found {orders.length} order{orders.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </RoleGuard>
  );
};

export default MyOrders;
