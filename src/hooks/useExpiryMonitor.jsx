import { useEffect, useRef } from "react";
import { useNotification } from "../contexts/NotificationContext";

export const useExpiryMonitor = (products, settings) => {
  const notificationContext = useNotification();
  const { addNotificationToHistory, sendExpiryNotification } = notificationContext || {};
  const alertedProducts = useRef(new Set());
  const notifiedProducts = useRef(new Set()); // Track products that have been notified via email/SMS
  
  useEffect(() => {
    if (!products || !Array.isArray(products) || !settings || !addNotificationToHistory) {
      return;
    }
    
    if (!settings.notifications?.expiryWarning) {
      return;
    }

    const warningDays = settings.expiryWarningDays || 7;
    const criticalDays = settings.criticalExpiryDays || 3;
    const today = new Date();

    products.forEach(async (product) => {
      if (!product.expiryDate) return;

      const expiryDate = new Date(product.expiryDate);
      const diffTime = expiryDate - today;
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Expired products
      if (daysUntilExpiry < 0 && !alertedProducts.current.has(`expired-${product.id}`)) {
        addNotificationToHistory({
          type: 'expired',
          title: 'Expired Products Found',
          message: `${product.name} expired ${Math.abs(daysUntilExpiry)} days ago and should be removed from inventory`,
          channels: ["system"]
        });
        alertedProducts.current.add(`expired-${product.id}`);
        
        // Send notification for expired products
        if (!notifiedProducts.current.has(`expired-${product.id}`)) {
          try {
            await sendExpiryNotification(product, daysUntilExpiry, settings);
            notifiedProducts.current.add(`expired-${product.id}`);
          } catch (error) {
            console.error('Failed to send expiry notification:', error);
          }
        }
      }
      // Critical expiry (within critical days)
      else if (daysUntilExpiry >= 0 && daysUntilExpiry <= criticalDays && !alertedProducts.current.has(`critical-expiry-${product.id}`)) {
        addNotificationToHistory({
          type: 'expiryWarning',
          title: 'Critical Expiry Alert',
          message: `${product.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}! Immediate attention required`,
          channels: ["system"]
        });
        alertedProducts.current.add(`critical-expiry-${product.id}`);
        alertedProducts.current.delete(`expiry-warning-${product.id}`); // Remove warning alert if critical
        
        // Send notification for critical expiry
        if (!notifiedProducts.current.has(`critical-expiry-${product.id}`)) {
          try {
            await sendExpiryNotification(product, daysUntilExpiry, settings);
            notifiedProducts.current.add(`critical-expiry-${product.id}`);
            notifiedProducts.current.delete(`expiry-warning-${product.id}`);
          } catch (error) {
            console.error('Failed to send expiry notification:', error);
          }
        }
      }
      // Warning expiry (within warning days but not critical)
      else if (daysUntilExpiry > criticalDays && daysUntilExpiry <= warningDays && !alertedProducts.current.has(`expiry-warning-${product.id}`)) {
        addNotificationToHistory({
          type: 'expiryWarning',
          title: 'Products Expiring Soon',
          message: `${product.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Consider using or restocking soon`,
          channels: ["system"]
        });
        alertedProducts.current.add(`expiry-warning-${product.id}`);
        
        // Send notification for expiry warning
        if (!notifiedProducts.current.has(`expiry-warning-${product.id}`)) {
          try {
            await sendExpiryNotification(product, daysUntilExpiry, settings);
            notifiedProducts.current.add(`expiry-warning-${product.id}`);
          } catch (error) {
            console.error('Failed to send expiry notification:', error);
          }
        }
      }
      // Product expiry extended or no longer in warning range
      else if (daysUntilExpiry > warningDays) {
        alertedProducts.current.delete(`expiry-warning-${product.id}`);
        alertedProducts.current.delete(`critical-expiry-${product.id}`);
        alertedProducts.current.delete(`expired-${product.id}`);
        notifiedProducts.current.delete(`expiry-warning-${product.id}`);
        notifiedProducts.current.delete(`critical-expiry-${product.id}`);
        notifiedProducts.current.delete(`expired-${product.id}`);
      }
    });

    // Clean up alerts for products that no longer exist
    const currentProductIds = new Set(products.map(p => p.id));
    alertedProducts.current.forEach(alertKey => {
      const productId = parseInt(alertKey.split('-').pop());
      if (!currentProductIds.has(productId)) {
        alertedProducts.current.delete(alertKey);
      }
    });

  }, [products, settings, addNotificationToHistory, sendExpiryNotification]);

  // Function to get expiry status for a product
  const getExpiryStatus = (product) => {
    if (!product.expiryDate) return { status: 'none', daysUntilExpiry: null };
    
    const today = new Date();
    const expiryDate = new Date(product.expiryDate);
    const diffTime = expiryDate - today;
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const warningDays = settings.expiryWarningDays || 7;
    const criticalDays = settings.criticalExpiryDays || 3;
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', daysUntilExpiry };
    } else if (daysUntilExpiry <= criticalDays) {
      return { status: 'critical', daysUntilExpiry };
    } else if (daysUntilExpiry <= warningDays) {
      return { status: 'warning', daysUntilExpiry };
    } else {
      return { status: 'normal', daysUntilExpiry };
    }
  };

  // Function to get expiry status class for styling
  const getExpiryStatusClass = (product) => {
    const { status } = getExpiryStatus(product);
    switch (status) {
      case 'expired': return 'expiry-expired';
      case 'critical': return 'expiry-critical';
      case 'warning': return 'expiry-warning';
      case 'normal': return 'expiry-normal';
      default: return 'expiry-none';
    }
  };

  return {
    getExpiryStatus,
    getExpiryStatusClass
  };
};
