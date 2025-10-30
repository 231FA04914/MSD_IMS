import { useState } from "react";
import { useNotification } from "../contexts/NotificationContext.jsx";
import { useInventory } from "../contexts/InventoryContext.jsx";
// import { useAlert } from "../contexts/AlertContext.jsx"; // Disabled - using notifications instead
import "./styles/global.css";

const NotificationDemo = () => {
  const { sendLowStockNotification, testNotifications, getNotificationHistory, addNotificationToHistory } = useNotification();
  const { products, settings } = useInventory();
  const [isLoading, setIsLoading] = useState(false);

  const handleTestLowStockNotification = async () => {
    setIsLoading(true);
    try {
      // Find a low stock product for demo
      const lowStockProduct = products.find(p => parseInt(p.stock) <= settings.lowStockThreshold);
      
      if (lowStockProduct) {
        const results = await sendLowStockNotification(lowStockProduct, settings.lowStockThreshold, settings);
        
        addNotificationToHistory({
          type: 'systemUpdate',
          title: 'Demo Notification Sent',
          message: `Sent ${results.length} notification(s) for ${lowStockProduct.name}. Check console for details.`,
          channels: ["system"]
        });
      } else {
        addNotificationToHistory({
          type: 'systemUpdate',
          title: 'No Low Stock Items',
          message: 'All products are above the threshold. Try lowering the threshold in Settings.',
          channels: ["system"]
        });
      }
    } catch (error) {
      addNotificationToHistory({
        type: 'systemUpdate',
        title: 'Demo Failed',
        message: 'Failed to send demo notification.',
        channels: ["system"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAllNotifications = async () => {
    setIsLoading(true);
    try {
      const results = await testNotifications(settings);
      
      addNotificationToHistory({
        type: 'systemUpdate',
        title: 'Test Notifications Sent',
        message: `Sent ${results.length} test notification(s). Check your email/SMS and console.`,
        channels: ["system"]
      });
    } catch (error) {
      addNotificationToHistory({
        type: 'systemUpdate',
        title: 'Test Failed',
        message: 'Failed to send test notifications.',
        channels: ["system"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showNotificationHistory = () => {
    const history = getNotificationHistory(10);
    console.log('📋 Recent Notification History:', history);
    
    addNotificationToHistory({
      type: 'systemUpdate',
      title: 'Notification History',
      message: `Found ${history.length} recent notifications. Check browser console for details.`,
      channels: ["system"]
    });
  };

  return (
    <div className="info-card" style={{ margin: '1rem', maxWidth: '600px' }}>
      <h2>🧪 Notification System Demo</h2>
      <p>Test the email/SMS notification delivery system</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <button 
          onClick={handleTestLowStockNotification}
          disabled={isLoading}
          className="export-btn"
          style={{ width: '100%' }}
        >
          {isLoading ? '🔄 Sending...' : '📧 Send Low Stock Alert (Demo)'}
        </button>
        
        <button 
          onClick={handleTestAllNotifications}
          disabled={isLoading}
          className="export-btn"
          style={{ width: '100%' }}
        >
          {isLoading ? '🔄 Testing...' : '🧪 Send Test Notifications'}
        </button>
        
        <button 
          onClick={showNotificationHistory}
          className="export-btn"
          style={{ width: '100%' }}
        >
          📋 Show Notification History
        </button>
      </div>
      
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
        <h4>📝 Current Settings:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>Email: {settings.notifications?.email ? '✅ Enabled' : '❌ Disabled'}</li>
          <li>SMS: {settings.notifications?.sms ? '✅ Enabled' : '❌ Disabled'}</li>
          <li>Email Address: {settings.notificationContacts?.email || 'Not set'}</li>
          <li>Phone: {settings.notificationContacts?.phone || 'Not set'}</li>
          <li>Low Stock Threshold: {settings.lowStockThreshold}</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationDemo;
