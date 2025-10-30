import { useState, useEffect } from "react";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import "../styles/global.css";

const NotificationHistory = () => {
  const { getNotificationHistory, clearNotificationHistory } = useNotification();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadHistory = () => {
      const notificationHistory = getNotificationHistory(100);
      setHistory(notificationHistory);
    };
    
    loadHistory();
    // Refresh every 30 seconds
    const interval = setInterval(loadHistory, 30000);
    
    return () => clearInterval(interval);
  }, [getNotificationHistory]);

  const filteredHistory = history.filter(notification => {
    if (filter === "all") return true;
    return notification.type.toLowerCase() === filter.toLowerCase();
  });

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all notification history?")) {
      clearNotificationHistory();
      setHistory([]);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'sent': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '📧';
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'email': return '📧';
      case 'sms': return '📱';
      case 'push': return '🔔';
      default: return '📬';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📋 Notification History</h1>
        <p>View all sent notifications and their delivery status</p>
      </div>

      {/* Statistics Cards */}
      <div className="content-grid">
        <div className="summary-card">
          <h2>Total Notifications</h2>
          <p>{history.length}</p>
        </div>
        <div className="summary-card">
          <h2>Successful</h2>
          <p>{history.filter(n => n.status === 'SENT').length}</p>
        </div>
        <div className="summary-card">
          <h2>Failed</h2>
          <p>{history.filter(n => n.status === 'FAILED').length}</p>
        </div>
        <div className="summary-card">
          <h2>Email Sent</h2>
          <p>{history.filter(n => n.type === 'EMAIL' && n.status === 'SENT').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="table-section">
        <div className="filter-controls">
          <label>Filter by Type:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="email">Email Only</option>
            <option value="sms">SMS Only</option>
            <option value="push">Push Only</option>
          </select>
          
          <button onClick={handleClearHistory} className="export-btn" style={{marginLeft: '10px'}}>
            🗑️ Clear History
          </button>
        </div>

        {/* Notification History Table */}
        <div className="table-container">
          {filteredHistory.length === 0 ? (
            <div className="no-data">
              <p>📭 No notifications found</p>
              <small>Notifications will appear here once the system sends alerts</small>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((notification) => (
                  <tr key={notification.id}>
                    <td>
                      <span className={`status-badge status-${notification.status.toLowerCase()}`}>
                        {getStatusIcon(notification.status)} {notification.status}
                      </span>
                    </td>
                    <td>
                      <span className="type-badge">
                        {getTypeIcon(notification.type)} {notification.type}
                      </span>
                    </td>
                    <td>{notification.recipient}</td>
                    <td>{notification.subject}</td>
                    <td title={notification.message}>
                      {notification.message}
                    </td>
                    <td>{notification.date}</td>
                    <td>{notification.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationHistory;
