import { useEffect, useRef } from "react";
import { useNotification } from "../contexts/NotificationContext";

export const useLowStockMonitor = (products, settings) => {
  const notificationContext = useNotification();
  const { addNotificationToHistory, sendLowStockNotification } = notificationContext || {};
  const alertedProducts = useRef(new Set());
  const notifiedProducts = useRef(new Set()); // Track products that have been notified via email/SMS
  
  useEffect(() => {
    if (!products || !Array.isArray(products) || !settings || !addNotificationToHistory) {
      return;
    }
    
    if (!settings.notifications?.lowStock) {
      return;
    }

    const threshold = settings.lowStockThreshold || 10;
    const criticalThreshold = Math.floor(threshold / 2); // Half of threshold is critical

    products.forEach(async (product) => {
      const stock = parseInt(product.stock) || 0;
      const productKey = `${product.id}-${stock}`;

      // Critical stock (out of stock or very low)
      if (stock <= criticalThreshold && !alertedProducts.current.has(`critical-${product.id}`)) {
        // Add to notifications instead of showing popup alert
        addNotificationToHistory({
          type: 'criticalStock',
          title: 'Critical Stock Alert',
          message: `${product.name} is critically low! Only ${stock} ${product.unit} remaining (threshold: ${threshold})`,
          channels: ["system"]
        });
        alertedProducts.current.add(`critical-${product.id}`);
        alertedProducts.current.delete(`low-${product.id}`); // Remove low stock alert if critical
        
        // Send email/SMS notification (only once per product until restocked)
        if (!notifiedProducts.current.has(`critical-${product.id}`)) {
          try {
            await sendLowStockNotification(product, threshold, settings);
            notifiedProducts.current.add(`critical-${product.id}`);
            notifiedProducts.current.delete(`low-${product.id}`);
          } catch (error) {
            console.error('Failed to send critical stock notification:', error);
          }
        }
      }
      // Low stock warning
      else if (stock <= threshold && stock > criticalThreshold && !alertedProducts.current.has(`low-${product.id}`)) {
        // Add to notifications instead of showing popup alert
        addNotificationToHistory({
          type: 'lowStock',
          title: 'Low Stock Alert',
          message: `${product.name} is running low! Only ${stock} ${product.unit} remaining (threshold: ${threshold})`,
          channels: ["system"]
        });
        alertedProducts.current.add(`low-${product.id}`);
        
        // Send email/SMS notification (only once per product until restocked)
        if (!notifiedProducts.current.has(`low-${product.id}`)) {
          try {
            await sendLowStockNotification(product, threshold, settings);
            notifiedProducts.current.add(`low-${product.id}`);
          } catch (error) {
            console.error('Failed to send low stock notification:', error);
          }
        }
      }
      // Stock replenished - remove from alerted and notified lists
      else if (stock > threshold) {
        alertedProducts.current.delete(`low-${product.id}`);
        alertedProducts.current.delete(`critical-${product.id}`);
        notifiedProducts.current.delete(`low-${product.id}`);
        notifiedProducts.current.delete(`critical-${product.id}`);
      }
    });

    // Clean up alerts for products that no longer exist
    const currentProductIds = new Set(products.map(p => p.id));
    alertedProducts.current.forEach(alertKey => {
      const productId = parseInt(alertKey.split('-')[1]);
      if (!currentProductIds.has(productId)) {
        alertedProducts.current.delete(alertKey);
      }
    });

  }, [products, settings, addNotificationToHistory, sendLowStockNotification]);

  // Function to get low stock products for display
  const getLowStockProducts = () => {
    if (!products || !settings) return [];
    
    const threshold = settings.lowStockThreshold || 10;
    return products.filter(product => parseInt(product.stock) <= threshold);
  };

  // Function to get critical stock products
  const getCriticalStockProducts = () => {
    if (!products || !settings) return [];
    
    const threshold = settings.lowStockThreshold || 10;
    const criticalThreshold = Math.floor(threshold / 2);
    return products.filter(product => parseInt(product.stock) <= criticalThreshold);
  };

  return {
    getLowStockProducts,
    getCriticalStockProducts,
    lowStockCount: getLowStockProducts().length,
    criticalStockCount: getCriticalStockProducts().length
  };
};
