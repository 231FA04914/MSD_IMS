// Notification Service for Email/SMS delivery
// This service handles sending notifications via multiple channels

class NotificationService {
  constructor() {
    this.notificationHistory = [];
    this.isEnabled = true;
  }

  // Email notification using EmailJS (free service)
  async sendEmail(to, subject, message, productData = null) {
    try {
      // In a real application, you would use EmailJS, Nodemailer, or similar service
      // For demo purposes, we'll simulate the email sending
      
      const emailData = {
        to_email: to,
        subject: subject,
        message: message,
        product_name: productData?.name || '',
        current_stock: productData?.stock || '',
        threshold: productData?.threshold || '',
        timestamp: new Date().toISOString()
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log the notification
      this.logNotification('email', to, subject, message, 'sent');

      console.log('📧 Email sent successfully:', emailData);
      return { success: true, data: emailData };
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      this.logNotification('email', to, subject, message, 'failed', error.message);
      return { success: false, error: error.message };
    }
  }

  // SMS notification using Twilio or similar service
  async sendSMS(to, message, productData = null) {
    try {
      // In a real application, you would use Twilio, AWS SNS, or similar service
      // For demo purposes, we'll simulate the SMS sending
      
      const smsData = {
        to_phone: to,
        message: message,
        product_name: productData?.name || '',
        current_stock: productData?.stock || '',
        timestamp: new Date().toISOString()
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Log the notification
      this.logNotification('sms', to, 'Low Stock Alert', message, 'sent');

      console.log('📱 SMS sent successfully:', smsData);
      return { success: true, data: smsData };
    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      this.logNotification('sms', to, 'Low Stock Alert', message, 'failed', error.message);
      return { success: false, error: error.message };
    }
  }

  // Push notification (for future mobile app integration)
  async sendPushNotification(userId, title, message, productData = null) {
    try {
      const pushData = {
        user_id: userId,
        title: title,
        message: message,
        product_data: productData,
        timestamp: new Date().toISOString()
      };

      // Simulate push notification
      await new Promise(resolve => setTimeout(resolve, 500));

      this.logNotification('push', userId, title, message, 'sent');
      console.log('🔔 Push notification sent:', pushData);
      return { success: true, data: pushData };
    } catch (error) {
      console.error('❌ Push notification failed:', error);
      this.logNotification('push', userId, title, message, 'failed', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send low stock alert via multiple channels
  async sendLowStockAlert(product, threshold, settings) {
    const results = [];
    
    if (!this.isEnabled || !settings.notifications.lowStock) {
      return results;
    }

    const isLowStock = parseInt(product.stock) <= threshold;
    const isCritical = parseInt(product.stock) <= Math.floor(threshold / 2);
    
    if (!isLowStock) return results;

    // Prepare notification content
    const urgencyLevel = isCritical ? 'CRITICAL' : 'WARNING';
    const emoji = isCritical ? '🚨' : '⚠️';
    
    const emailSubject = `${emoji} ${urgencyLevel}: Low Stock Alert - ${product.name}`;
    const emailMessage = this.generateEmailTemplate(product, threshold, isCritical);
    const smsMessage = this.generateSMSTemplate(product, threshold, isCritical);

    // Send email notifications
    if (settings.notifications.email && settings.notificationContacts?.email) {
      const emailResult = await this.sendEmail(
        settings.notificationContacts.email,
        emailSubject,
        emailMessage,
        { ...product, threshold }
      );
      results.push({ type: 'email', ...emailResult });
    }

    // Send SMS notifications
    if (settings.notifications.sms && settings.notificationContacts?.phone) {
      const smsResult = await this.sendSMS(
        settings.notificationContacts.phone,
        smsMessage,
        { ...product, threshold }
      );
      results.push({ type: 'sms', ...smsResult });
    }

    // Send push notifications (for future use)
    if (settings.notifications.push && settings.userId) {
      const pushResult = await this.sendPushNotification(
        settings.userId,
        emailSubject,
        smsMessage,
        product
      );
      results.push({ type: 'push', ...pushResult });
    }

    return results;
  }

  // Send expiry alert via multiple channels
  async sendExpiryAlert(product, daysUntilExpiry, settings) {
    const results = [];
    
    if (!this.isEnabled || !settings.notifications.expiryWarning) {
      return results;
    }

    // Determine urgency level
    const criticalDays = settings.criticalExpiryDays || 3;
    const isExpired = daysUntilExpiry < 0;
    const isCritical = daysUntilExpiry >= 0 && daysUntilExpiry <= criticalDays;
    
    let urgencyLevel, emoji;
    if (isExpired) {
      urgencyLevel = 'EXPIRED';
      emoji = '💀';
    } else if (isCritical) {
      urgencyLevel = 'CRITICAL';
      emoji = '🚨';
    } else {
      urgencyLevel = 'WARNING';
      emoji = '⚠️';
    }
    
    const emailSubject = `${emoji} ${urgencyLevel}: Expiry Alert - ${product.name}`;
    const emailMessage = this.generateExpiryEmailTemplate(product, daysUntilExpiry, isExpired, isCritical);
    const smsMessage = this.generateExpirySMSTemplate(product, daysUntilExpiry, isExpired, isCritical);

    // Send email notifications
    if (settings.notifications.email && settings.notificationContacts?.email) {
      const emailResult = await this.sendEmail(
        settings.notificationContacts.email,
        emailSubject,
        emailMessage,
        { ...product, daysUntilExpiry }
      );
      results.push({ type: 'email', ...emailResult });
    }

    // Send SMS notifications
    if (settings.notifications.sms && settings.notificationContacts?.phone) {
      const smsResult = await this.sendSMS(
        settings.notificationContacts.phone,
        smsMessage,
        { ...product, daysUntilExpiry }
      );
      results.push({ type: 'sms', ...smsResult });
    }

    // Send push notifications (for future use)
    if (settings.notifications.push && settings.userId) {
      const pushResult = await this.sendPushNotification(
        settings.userId,
        emailSubject,
        smsMessage,
        product
      );
      results.push({ type: 'push', ...pushResult });
    }

    return results;
  }

  // Generate email template
  generateEmailTemplate(product, threshold, isCritical) {
    const urgency = isCritical ? 'CRITICAL' : 'LOW';
    const action = isCritical ? 'IMMEDIATE ACTION REQUIRED' : 'Please restock soon';
    
    return `
Dear Inventory Manager,

${urgency} STOCK ALERT for ${product.name}

Current Stock: ${product.stock} ${product.unit}
Threshold: ${threshold} ${product.unit}
Status: ${isCritical ? 'CRITICAL - Out of stock or very low' : 'LOW - Below threshold'}

${action}

Please check your inventory management system and restock this item as soon as possible.

Time: ${new Date().toLocaleString()}
System: Inventory Management System

Best regards,
IMS Alert System
    `.trim();
  }

  // Generate SMS template
  generateSMSTemplate(product, threshold, isCritical) {
    const emoji = isCritical ? '🚨' : '⚠️';
    const urgency = isCritical ? 'CRITICAL' : 'LOW';
    
    return `${emoji} ${urgency} STOCK: ${product.name} - Only ${product.stock} ${product.unit} left (threshold: ${threshold}). Restock needed! - IMS`;
  }

  // Generate expiry email template
  generateExpiryEmailTemplate(product, daysUntilExpiry, isExpired, isCritical) {
    let urgency, action, statusMessage;
    
    if (isExpired) {
      urgency = 'EXPIRED';
      action = 'REMOVE FROM INVENTORY IMMEDIATELY';
      statusMessage = `This product expired ${Math.abs(daysUntilExpiry)} days ago and must be removed from inventory immediately to prevent health risks.`;
    } else if (isCritical) {
      urgency = 'CRITICAL EXPIRY';
      action = 'USE OR SELL IMMEDIATELY';
      statusMessage = `This product expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} and requires immediate attention.`;
    } else {
      urgency = 'EXPIRY WARNING';
      action = 'Plan to use or sell soon';
      statusMessage = `This product expires in ${daysUntilExpiry} days. Please plan accordingly.`;
    }
    
    return `
Dear Inventory Manager,

${urgency} ALERT for ${product.name}

Product Details:
- Name: ${product.name}
- Category: ${product.category}
- Current Stock: ${product.stock} ${product.unit}
- Expiry Date: ${product.expiryDate}
- Days Until Expiry: ${daysUntilExpiry}

Status: ${statusMessage}

${action}

Please check your inventory management system and take appropriate action immediately.

Time: ${new Date().toLocaleString()}
System: Inventory Management System

Best regards,
IMS Alert System
    `.trim();
  }

  // Generate expiry SMS template
  generateExpirySMSTemplate(product, daysUntilExpiry, isExpired, isCritical) {
    let emoji, urgency, message;
    
    if (isExpired) {
      emoji = '💀';
      urgency = 'EXPIRED';
      message = `${emoji} ${urgency}: ${product.name} expired ${Math.abs(daysUntilExpiry)} days ago! Remove immediately - IMS`;
    } else if (isCritical) {
      emoji = '🚨';
      urgency = 'CRITICAL';
      message = `${emoji} ${urgency} EXPIRY: ${product.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}! Use/sell now - IMS`;
    } else {
      emoji = '⚠️';
      urgency = 'WARNING';
      message = `${emoji} EXPIRY ${urgency}: ${product.name} expires in ${daysUntilExpiry} days. Plan accordingly - IMS`;
    }
    
    return message;
  }

  // Log notification for history
  logNotification(type, recipient, subject, message, status, error = null) {
    const logEntry = {
      id: Date.now() + Math.random(),
      type: type.toUpperCase(),
      recipient,
      subject,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      status: status.toUpperCase(),
      error,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };

    this.notificationHistory.unshift(logEntry);
    
    // Keep only last 100 notifications
    if (this.notificationHistory.length > 100) {
      this.notificationHistory = this.notificationHistory.slice(0, 100);
    }
  }

  // Get notification history
  getNotificationHistory(limit = 50) {
    return this.notificationHistory.slice(0, limit);
  }

  // Clear notification history
  clearHistory() {
    this.notificationHistory = [];
  }

  // Enable/disable notifications
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Test notification system
  async testNotifications(settings) {
    const testResults = [];
    
    if (settings.notificationContacts?.email) {
      const emailResult = await this.sendEmail(
        settings.notificationContacts.email,
        '✅ Test Email - IMS Notification System',
        'This is a test email from your Inventory Management System. Email notifications are working correctly!'
      );
      testResults.push({ type: 'email', ...emailResult });
    }

    if (settings.notificationContacts?.phone) {
      const smsResult = await this.sendSMS(
        settings.notificationContacts.phone,
        '✅ Test SMS from IMS - Notifications are working!'
      );
      testResults.push({ type: 'sms', ...smsResult });
    }

    return testResults;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
