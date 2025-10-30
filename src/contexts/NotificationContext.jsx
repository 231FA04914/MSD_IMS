import { createContext, useContext, useState, useCallback } from "react";
import notificationService from "../services/NotificationService.js";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    console.warn("useNotification must be used within a NotificationProvider");
    // Return default values instead of throwing error
    return {
      notificationHistory: [],
      isLoading: false,
      lastNotificationTime: null,
      sendLowStockNotification: () => Promise.resolve([]),
      sendExpiryNotification: () => Promise.resolve([]),
      testNotifications: () => Promise.resolve([]),
      getNotificationHistory: () => [],
      addNotificationToHistory: () => {},
      markNotificationAsRead: () => {},
      markAllNotificationsAsRead: () => {},
      deleteNotification: () => {},
      clearNotificationHistory: () => {},
      getNotificationStats: () => ({ total: 0, unread: 0, read: 0, today: 0 }),
      setNotificationsEnabled: () => {}
    };
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Notification history state
  const [notificationHistory, setNotificationHistory] = useState([
    {
      id: "notif-001",
      type: "lowStock",
      title: "Low Stock Alert",
      message: "Mouse stock is running low (3 pieces remaining). Consider restocking soon.",
      timestamp: new Date().toISOString(),
      isRead: false,
      channels: ["email", "system"]
    },
    {
      id: "notif-002", 
      type: "expiryWarning",
      title: "Products Expiring Soon",
      message: "5 products are expiring within the next 7 days. Check expiry alerts for details.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      isRead: false,
      channels: ["email", "sms", "system"]
    },
    {
      id: "notif-003",
      type: "criticalStock", 
      title: "Critical Stock Alert",
      message: "Multiple products have reached critical stock levels and need immediate attention.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      isRead: true,
      channels: ["email", "system"]
    },
    {
      id: "notif-004",
      type: "billing",
      title: "New Invoice Created",
      message: "Invoice INV-2024-001 has been created for John Doe (₹115,950).",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      isRead: true,
      channels: ["system"]
    },
    {
      id: "notif-005",
      type: "expired",
      title: "Expired Products Found",
      message: "2 products have expired and should be removed from inventory immediately.",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      isRead: false,
      channels: ["email", "sms", "system"]
    }
  ]);
  const [lastNotificationTime, setLastNotificationTime] = useState(null);

  // Send low stock notification
  const sendLowStockNotification = useCallback(async (product, threshold, settings) => {
    setIsLoading(true);
    try {
      const results = await notificationService.sendLowStockAlert(product, threshold, settings);
      
      // Update history
      const history = notificationService.getNotificationHistory();
      setNotificationHistory(history);
      setLastNotificationTime(new Date());
      
      return results;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send expiry notification
  const sendExpiryNotification = useCallback(async (product, daysUntilExpiry, settings) => {
    setIsLoading(true);
    try {
      const results = await notificationService.sendExpiryAlert(product, daysUntilExpiry, settings);
      
      // Update history
      const history = notificationService.getNotificationHistory();
      setNotificationHistory(history);
      setLastNotificationTime(new Date());
      
      return results;
    } catch (error) {
      console.error('Failed to send expiry notification:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test notifications
  const testNotifications = useCallback(async (settings) => {
    setIsLoading(true);
    try {
      const results = await notificationService.testNotifications(settings);
      
      // Update history
      const history = notificationService.getNotificationHistory();
      setNotificationHistory(history);
      
      return results;
    } catch (error) {
      console.error('Failed to test notifications:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get notification history
  const getNotificationHistory = useCallback((limit = 50) => {
    const history = notificationService.getNotificationHistory(limit);
    setNotificationHistory(history);
    return history;
  }, []);

  // Clear notification history
  const clearNotificationHistory = useCallback(() => {
    notificationService.clearHistory();
    setNotificationHistory([]);
  }, []);

  // Enable/disable notifications
  const setNotificationsEnabled = useCallback((enabled) => {
    notificationService.setEnabled(enabled);
  }, []);

  // Add notification to history
  const addNotificationToHistory = useCallback((notification) => {
    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification
    };
    
    setNotificationHistory(prev => [newNotification, ...prev]);
    return newNotification;
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId) => {
    setNotificationHistory(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(() => {
    setNotificationHistory(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    setNotificationHistory(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    const total = notificationHistory.length;
    const unread = notificationHistory.filter(n => !n.isRead).length;
    const read = total - unread;
    
    const today = new Date().toISOString().split('T')[0];
    const todayNotifications = notificationHistory.filter(n => 
      n.timestamp.split('T')[0] === today
    ).length;

    return {
      total,
      unread,
      read,
      today: todayNotifications
    };
  }, [notificationHistory]);

  const value = {
    // State
    notificationHistory,
    isLoading,
    lastNotificationTime,
    
    // Actions
    sendLowStockNotification,
    sendExpiryNotification,
    testNotifications,
    getNotificationHistory,
    addNotificationToHistory,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearNotificationHistory,
    getNotificationStats,
    setNotificationsEnabled
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
