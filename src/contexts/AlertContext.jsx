import { createContext, useContext, useState, useCallback } from "react";

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]); // Keep for compatibility but won't show popups

  // Add alert - now redirects to notifications instead of showing popup
  const addAlert = useCallback((alert) => {
    const id = Date.now() + Math.random();
    const newAlert = {
      id,
      ...alert,
      timestamp: new Date().toISOString()
    };
    
    // Instead of showing popup, log to console (will be handled by notification integration)
    console.log('Alert redirected to notifications:', newAlert);
    
    // Still add to alerts array for compatibility but don't show popup
    setAlerts(prev => [...prev, newAlert]);
    
    // Auto-remove from alerts array after 1 second (no visual impact)
    setTimeout(() => {
      removeAlert(id);
    }, 1000);
  }, []);

  // Remove alert
  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Low stock alert helper
  const addLowStockAlert = useCallback((product, threshold) => {
    addAlert({
      type: 'warning',
      title: 'Low Stock Alert',
      message: `${product.name} is running low! Only ${product.stock} ${product.unit} remaining (threshold: ${threshold})`,
      productId: product.id,
      category: 'low-stock'
    });
  }, [addAlert]);

  // Critical stock alert helper
  const addCriticalStockAlert = useCallback((product) => {
    addAlert({
      type: 'error',
      title: 'Critical Stock Alert',
      message: `${product.name} is out of stock or critically low!`,
      productId: product.id,
      category: 'critical-stock'
    });
  }, [addAlert]);

  // Expiry warning alert helper
  const addExpiryWarningAlert = useCallback((product, daysUntilExpiry) => {
    addAlert({
      type: 'warning',
      title: 'Expiry Warning',
      message: `${product.name} expires in ${daysUntilExpiry} days. Plan to use or sell soon.`,
      productId: product.id,
      category: 'expiry-warning'
    });
  }, [addAlert]);

  // Critical expiry alert helper
  const addCriticalExpiryAlert = useCallback((product, daysUntilExpiry) => {
    addAlert({
      type: 'error',
      title: 'Critical Expiry Alert',
      message: `${product.name} expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}! Use or sell immediately.`,
      productId: product.id,
      category: 'critical-expiry'
    });
  }, [addAlert]);

  // Expired product alert helper
  const addExpiredAlert = useCallback((product, daysExpired) => {
    addAlert({
      type: 'error',
      title: 'Product Expired',
      message: `${product.name} expired ${daysExpired} days ago! Remove from inventory immediately.`,
      productId: product.id,
      category: 'expired'
    });
  }, [addAlert]);

  const value = {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    addLowStockAlert,
    addCriticalStockAlert,
    addExpiryWarningAlert,
    addCriticalExpiryAlert,
    addExpiredAlert
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};
