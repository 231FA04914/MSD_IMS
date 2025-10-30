import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useInventory } from "../../contexts/InventoryContext.jsx";
import { useNotification } from "../../contexts/NotificationContext.jsx";
// import { useAlert } from "../../contexts/AlertContext.jsx"; // Disabled - using notifications instead
import "../styles/global.css";

const Settings = () => {
  const { isAdmin } = useAuth();
  const { settings: globalSettings, updateSettings } = useInventory();
  const { testNotifications, getNotificationHistory, addNotificationToHistory } = useNotification();
  
  const [settings, setSettings] = useState(globalSettings);
  const [isTestingNotifications, setIsTestingNotifications] = useState(false);

  const [exportFormat, setExportFormat] = useState("csv");

  // Redirect if not admin
  
  if (!isAdmin) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>🚫 Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleSettingChange = (section, key, value) => {
    if (section) {
      setSettings({
        ...settings,
        [section]: {
          ...settings[section],
          [key]: value
        }
      });
    } else {
      setSettings({
        ...settings,
        [key]: value
      });
    }
  };

  const handleExportData = () => {
    // Demo export functionality
    const data = {
      products: [
        { id: 1, name: "Apples", stock: 50, category: "Fruits" },
        { id: 2, name: "Milk", stock: 30, category: "Dairy" }
      ],
      suppliers: [
        { id: 1, name: "ABC Traders", contact: "9876543210" }
      ],
      orders: [
        { id: 1, customer: "John Doe", product: "Laptop", quantity: 2 }
      ]
    };

    const dataStr = exportFormat === "json" 
      ? JSON.stringify(data, null, 2)
      : convertToCSV(data);
    
    const dataBlob = new Blob([dataStr], { type: exportFormat === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventory_data.${exportFormat}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    let csv = "Type,ID,Name,Details\n";
    data.products.forEach(p => csv += `Product,${p.id},${p.name},"Stock: ${p.stock}, Category: ${p.category}"\n`);
    data.suppliers.forEach(s => csv += `Supplier,${s.id},${s.name},"Contact: ${s.contact}"\n`);
    data.orders.forEach(o => csv += `Order,${o.id},${o.customer},"Product: ${o.product}, Quantity: ${o.quantity}"\n`);
    return csv;
  };

  const handleSaveSettings = () => {
    updateSettings(settings);
    addNotificationToHistory({
      type: 'systemUpdate',
      title: 'Settings Saved',
      message: 'Your settings have been saved successfully!',
      channels: ["system"]
    });
  };

  const handleTestNotifications = async () => {
    setIsTestingNotifications(true);
    try {
      const results = await testNotifications(settings);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        addNotificationToHistory({
          type: 'systemUpdate',
          title: 'Test Notifications Sent',
          message: `Successfully sent ${successCount} test notification(s). Check your email/SMS.`,
          channels: ["system"]
        });
      }
      
      if (failCount > 0) {
        addNotificationToHistory({
          type: 'systemUpdate',
          title: 'Some Tests Failed',
          message: `${failCount} notification(s) failed to send. Check your settings.`,
          channels: ["system"]
        });
      }
    } catch (error) {
      addNotificationToHistory({
        type: 'systemUpdate',
        title: 'Test Failed',
        message: 'Failed to send test notifications. Please check your settings.',
        channels: ["system"]
      });
    } finally {
      setIsTestingNotifications(false);
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          console.log("Imported data:", importedData);
          alert("Data imported successfully! (Demo - check console)");
        } catch (error) {
          alert("Error importing data. Please check file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>⚙️ System Settings</h1>
        <p>Configure system preferences and manage data</p>
      </div>

      <div className="settings-sections">
        {/* Company Settings */}
        <div className="settings-section">
            <h2>Company Information</h2>
            <div className="setting-item">
              <label>Company Name:</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => handleSettingChange(null, "companyName", e.target.value)}
              />
            </div>
            <div className="setting-item">
              <label>Currency Symbol:</label>
              <select
                value={settings.currency}
                onChange={(e) => handleSettingChange(null, "currency", e.target.value)}
              >
                <option value="₹">₹ (INR)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
              </select>
            </div>
          </div>

        {/* Inventory Settings */}
        <div className="settings-section">
            <h2>Inventory Settings</h2>
            <div className="setting-item">
              <label>Low Stock Threshold:</label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => handleSettingChange(null, "lowStockThreshold", parseInt(e.target.value))}
                min="1"
              />
            </div>
          </div>

        {/* Notifications */}
        <div className="settings-section">
            <h2>📧 Notification Settings</h2>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.lowStock}
                  onChange={(e) => handleSettingChange("notifications", "lowStock", e.target.checked)}
                />
                Enable Low Stock Alerts
              </label>
            </div>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleSettingChange("notifications", "email", e.target.checked)}
                />
                📧 Email Notifications
              </label>
            </div>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={(e) => handleSettingChange("notifications", "sms", e.target.checked)}
                />
                📱 SMS Notifications
              </label>
            </div>

            <div className="setting-item">
              <label>Email Address:</label>
              <input
                type="email"
                value={settings.notificationContacts?.email || ''}
                onChange={(e) => handleSettingChange("notificationContacts", "email", e.target.value)}
                placeholder="admin@company.com"
                disabled={!settings.notifications.email}
              />
            </div>

            <div className="setting-item">
              <label>Phone Number:</label>
              <input
                type="tel"
                value={settings.notificationContacts?.phone || ''}
                onChange={(e) => handleSettingChange("notificationContacts", "phone", e.target.value)}
                placeholder="+1234567890"
                disabled={!settings.notifications.sms}
              />
            </div>

            <div className="setting-item">
              <button 
                onClick={handleTestNotifications}
                disabled={isTestingNotifications || (!settings.notifications.email && !settings.notifications.sms)}
                className="export-btn"
              >
                {isTestingNotifications ? '🔄 Testing...' : '🧪 Test Notifications'}
              </button>
            </div>
          </div>

        {/* Data Management */}
        <div className="settings-section">
            <h2>Data Management</h2>
            <div className="setting-item">
              <label>Export Format:</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <button onClick={handleExportData} className="export-btn">
                📤 Export Data
              </button>
            </div>
            <div className="setting-item">
              <label>Import Data:</label>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleImportData}
                className="import-input"
              />
            </div>
          </div>

        {/* Backup Settings */}
        <div className="settings-section">
            <h2>Backup Settings</h2>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => handleSettingChange("backup", "autoBackup", e.target.checked)}
                />
                Enable Auto Backup
              </label>
            </div>
            <div className="setting-item">
              <label>Backup Frequency:</label>
              <select
                value={settings.backup.backupFrequency}
                onChange={(e) => handleSettingChange("backup", "backupFrequency", e.target.value)}
                disabled={!settings.backup.autoBackup}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
      </div>

      <div className="table-section">
        <div className="settings-actions">
          <button onClick={handleSaveSettings} className="save-btn">💾 Save Settings</button>
          <button onClick={() => setSettings(globalSettings)} className="reset-btn">🔄 Reset to Defaults</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
