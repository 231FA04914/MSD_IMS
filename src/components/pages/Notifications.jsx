import { useState, useEffect } from "react";
import "../styles/global.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize notifications
  useEffect(() => {
    const initNotifications = () => {
      try {
        const saved = localStorage.getItem('systemNotifications');
        if (saved) {
          setNotifications(JSON.parse(saved));
        } else {
          // Sample notifications for real-time scenario
          const sampleData = [
            {
              id: "notif-001",
              type: "lowStock",
              title: "Low Stock Alert",
              message: "Product 'Wireless Mouse' is running low (5 units remaining).",
              timestamp: new Date().toISOString(),
              isRead: false,
              priority: "medium"
            },
            {
              id: "notif-002",
              type: "newOrder",
              title: "New Order Received",
              message: "Order #ORD-2024-001 placed by John Doe for ₹2,500.",
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              isRead: false,
              priority: "high"
            },
            {
              id: "notif-003",
              type: "criticalStock",
              title: "Critical Stock Alert",
              message: "Product 'Gaming Keyboard' is out of stock.",
              timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
              isRead: false,
              priority: "critical"
            },
            {
              id: "notif-004",
              type: "systemUpdate",
              title: "System Maintenance Complete",
              message: "Scheduled maintenance completed successfully.",
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              isRead: true,
              priority: "low"
            }
          ];
          setNotifications(sampleData);
          localStorage.setItem('systemNotifications', JSON.stringify(sampleData));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    initNotifications();
  }, []);

  // Save to localStorage when notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('systemNotifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Calculate stats
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    read: notifications.filter(n => n.isRead).length,
    today: notifications.filter(n => {
      const today = new Date().toDateString();
      const notifDate = new Date(n.timestamp).toDateString();
      return today === notifDate;
    }).length
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "read" && notification.isRead) ||
      (filterStatus === "unread" && !notification.isRead);
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  // Actions
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }
  };

  const clearAll = () => {
    if (window.confirm('Clear all notifications?')) {
      setNotifications([]);
      localStorage.removeItem('systemNotifications');
    }
  };

  // Get icon for notification type
  const getIcon = (type) => {
    const icons = {
      lowStock: '📦',
      criticalStock: '🚨',
      newOrder: '🛒',
      expiryWarning: '⏰',
      systemUpdate: '🔄',
      billing: '💰'
    };
    return icons[type] || '📢';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#dc3545',
      high: '#fd7e14',
      medium: '#ffc107',
      low: '#28a745'
    };
    return colors[priority] || '#6c757d';
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>🔔 Notifications</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🔔 Notifications</h1>
        <p>Stay updated with real-time system notifications</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Total</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#007bff' }}>{stats.total}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Unread</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#dc3545' }}>{stats.unread}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Read</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#28a745' }}>{stats.read}</p>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Today</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#ffc107' }}>{stats.today}</p>
        </div>
      </div>

      {/* Controls */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="all">All Types</option>
            <option value="lowStock">Low Stock</option>
            <option value="criticalStock">Critical Stock</option>
            <option value="newOrder">New Orders</option>
            <option value="systemUpdate">System Updates</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={markAllAsRead}
            disabled={stats.unread === 0}
            style={{ 
              padding: '0.5rem 1rem', 
              background: stats.unread > 0 ? '#007bff' : '#f8f9fa', 
              color: stats.unread > 0 ? 'white' : '#666', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: stats.unread > 0 ? 'pointer' : 'not-allowed' 
            }}
          >
            Mark All Read ({stats.unread})
          </button>
          <button 
            onClick={clearAll}
            disabled={stats.total === 0}
            style={{ 
              padding: '0.5rem 1rem', 
              background: stats.total > 0 ? '#dc3545' : '#f8f9fa', 
              color: stats.total > 0 ? 'white' : '#666', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: stats.total > 0 ? 'pointer' : 'not-allowed' 
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee' }}>
          <h3 style={{ margin: 0 }}>Notifications ({filteredNotifications.length})</h3>
        </div>
        
        {filteredNotifications.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
            <h4>No notifications found</h4>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div>
            {filteredNotifications.map((notification, index) => (
              <div 
                key={notification.id}
                style={{ 
                  padding: '1.5rem', 
                  borderBottom: index < filteredNotifications.length - 1 ? '1px solid #eee' : 'none',
                  background: notification.isRead ? 'white' : '#f8f9ff'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, color: '#333', fontSize: '1rem' }}>{notification.title}</h4>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span 
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem', 
                            color: 'white',
                            backgroundColor: getPriorityColor(notification.priority),
                            textTransform: 'uppercase'
                          }}
                        >
                          {notification.priority}
                        </span>
                        <span style={{ fontSize: '0.875rem', color: '#666' }}>
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p style={{ margin: '0 0 1rem 0', color: '#555', lineHeight: 1.5 }}>
                      {notification.message}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          Mark as Read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id, notification.title)}
                        style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
