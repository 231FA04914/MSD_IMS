// Service to redirect alerts to notifications instead of showing popups
class AlertToNotificationService {
  constructor() {
    this.notificationContext = null;
  }

  // Set the notification context reference
  setNotificationContext(context) {
    this.notificationContext = context;
  }

  // Convert alert to notification
  convertAlertToNotification(alert) {
    if (!this.notificationContext?.addNotificationToHistory) {
      console.log('Alert (redirected to console):', alert);
      return;
    }

    // Map alert types to notification types
    const notificationType = this.mapAlertTypeToNotificationType(alert.type, alert.title);
    
    this.notificationContext.addNotificationToHistory({
      type: notificationType,
      title: alert.title || this.getDefaultTitle(alert.type),
      message: alert.message || "System notification",
      channels: ["system"]
    });
  }

  // Helper function to map alert types to notification types
  mapAlertTypeToNotificationType(alertType, title) {
    if (title?.toLowerCase().includes('stock')) {
      if (title.toLowerCase().includes('critical')) return 'criticalStock';
      return 'lowStock';
    }
    if (title?.toLowerCase().includes('expiry') || title?.toLowerCase().includes('expir')) {
      if (title.toLowerCase().includes('critical')) return 'expiryWarning';
      if (title.toLowerCase().includes('expired')) return 'expired';
      return 'expiryWarning';
    }
    if (title?.toLowerCase().includes('invoice') || title?.toLowerCase().includes('billing')) {
      return 'billing';
    }
    if (title?.toLowerCase().includes('user')) {
      return 'userAction';
    }
    
    // Default mapping based on alert type
    switch (alertType) {
      case 'error': return 'criticalStock';
      case 'warning': return 'lowStock';
      case 'success': return 'userAction';
      case 'info': return 'systemUpdate';
      default: return 'systemUpdate';
    }
  }

  // Helper function to get default titles
  getDefaultTitle(alertType) {
    switch (alertType) {
      case 'error': return 'System Error';
      case 'warning': return 'System Warning';
      case 'success': return 'Action Completed';
      case 'info': return 'System Information';
      default: return 'System Notification';
    }
  }
}

// Create singleton instance
const alertToNotificationService = new AlertToNotificationService();

export default alertToNotificationService;
