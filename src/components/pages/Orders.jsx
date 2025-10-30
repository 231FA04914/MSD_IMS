import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useInventory } from "../../contexts/InventoryContext";
import RoleGuard from "../RoleGuard";
import { getRupeesValue } from "../../utils/currency.js";
import invoiceService from "../../services/InvoiceService.js";
import communicationService from "../../services/CommunicationService.js";
import "../styles/global.css";

const Orders = () => {
  const { hasPermission } = useAuth();
  const { products, updateProduct } = useInventory();
  
  const [orders, setOrders] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [form, setForm] = useState({ customer: "", supplier: "", product: "", quantity: "", status: "", type: "" });
  const [editingId, setEditingId] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [stockConfirmation, setStockConfirmation] = useState({});
  const [generatingInvoice, setGeneratingInvoice] = useState(null);
  const [sendingNotifications, setSendingNotifications] = useState(null);

  // Load orders from localStorage on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders when orders change
  useEffect(() => {
    filterOrders();
  }, [orders]);

  // Real-time order synchronization
  useEffect(() => {
    // Refresh orders when window gains focus (user switches back to tab)
    const handleFocus = () => {
      console.log('Window focused - refreshing orders...');
      loadOrders();
    };

    // Periodic refresh every 30 seconds to catch new orders
    const refreshInterval = setInterval(() => {
      console.log('Periodic refresh - checking for new orders...');
      loadOrders();
    }, 30000);

    // Listen for localStorage changes from other tabs/windows
    const handleStorageChange = (e) => {
      if (e.key === 'orders') {
        console.log('Orders updated in another tab - refreshing...');
        loadOrders();
      }
    };

    // Listen for custom orderPlaced events (immediate updates)
    const handleOrderPlaced = (e) => {
      console.log('New order placed - refreshing immediately...', e.detail);
      loadOrders();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('orderPlaced', handleOrderPlaced);

    // Cleanup
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('orderPlaced', handleOrderPlaced);
      clearInterval(refreshInterval);
    };
  }, []);

  const loadOrders = () => {
    setLoading(true);
    
    // Load orders from localStorage
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    console.log('Loaded orders from localStorage:', allOrders);
    
    // Also load legacy orders for compatibility
    const legacyOrders = [
      { id: 1, customer: "John Doe", product: "Laptop", quantity: 2, status: "Pending", type: "Outgoing" },
      { id: 2, customer: "Jane Smith", product: "Keyboard", quantity: 5, status: "Shipped", type: "Outgoing" },
      { id: 3, supplier: "Tech Supplies Co", product: "Mouse", quantity: 50, status: "Received", type: "Incoming" },
    ];
    
    // Merge orders, avoiding duplicates
    const mergedOrders = [...allOrders, ...legacyOrders.filter(legacy => 
      !allOrders.some(order => order.id === legacy.id)
    )];
    
    console.log('Total merged orders:', mergedOrders);
    setOrders(mergedOrders);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const filterOrders = () => {
    // Enhanced filtering for customer orders - includes orders from customer checkout
    const customer = orders.filter(order => {
      // Include orders with type 'Outgoing' (manually created)
      if (order.type === 'Outgoing') return true;
      
      // Include orders from customer checkout (these have customerEmail and items)
      if (order.customerEmail && order.items && order.items.length > 0) return true;
      
      // Include legacy orders with customer field
      if (order.customer && !order.supplier) return true;
      
      return false;
    });
    
    const supplier = orders.filter(order => 
      order.type === 'Incoming' || 
      order.supplier
    );
    
    console.log('All orders loaded:', orders);
    console.log('Filtered customer orders:', customer);
    console.log('Filtered supplier orders:', supplier);
    
    setCustomerOrders(customer);
    setSupplierOrders(supplier);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation based on order type
    if (form.type === "Incoming") {
      if (!form.supplier || !form.product || !form.quantity || !form.status) return;
    } else {
      if (!form.customer || !form.product || !form.quantity || !form.status) return;
    }

    const newOrder = {
      id: editingId || Date.now(),
      ...form,
      orderDate: new Date().toISOString(),
      orderNumber: `ORD-${Date.now()}`
    };

    if (editingId) {
      setOrders(
        orders.map((o) =>
          o.id === editingId ? newOrder : o
        )
      );
      setEditingId(null);
    } else {
      setOrders([...orders, newOrder]);
    }
    
    // Save to localStorage
    localStorage.setItem('orders', JSON.stringify([...orders, newOrder]));
    
    setForm({ customer: "", supplier: "", product: "", quantity: "", status: "", type: "" });
  };

  const handleEdit = (o) => {
    setForm({
      customer: o.customer || "",
      supplier: o.supplier || "",
      product: o.product,
      quantity: o.quantity,
      status: o.status,
      type: o.type
    });
    setEditingId(o.id);
  };

  const handleDelete = (id) => {
    const updatedOrders = orders.filter((o) => o.id !== id);
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  };

  // Order processing functions for Staff
  const confirmStock = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.items) return;

    // Check if all items have sufficient stock
    const stockIssues = [];
    order.items.forEach(item => {
      const product = products.find(p => p.name === item.name);
      if (!product || product.stock < item.quantity) {
        stockIssues.push({
          item: item.name,
          available: product ? product.stock : 0,
          required: item.quantity
        });
      }
    });

    if (stockIssues.length > 0) {
      alert('Stock confirmation failed:\n' + 
        stockIssues.map(issue => 
          `${issue.item}: Available ${issue.available}, Required ${issue.required}`
        ).join('\n'));
      return false;
    }

    // Update stock confirmation status
    setStockConfirmation(prev => ({
      ...prev,
      [orderId]: true
    }));

    // Update order status to 'processed'
    updateOrderStatus(orderId, 'processed');
    return true;
  };

  const packItems = (orderId) => {
    if (!stockConfirmation[orderId]) {
      alert('Please confirm stock availability first!');
      return;
    }

    // Update order status to 'packed'
    updateOrderStatus(orderId, 'packed');
  };

  const markAsShipped = (orderId) => {
    // Update order status to 'shipped'
    updateOrderStatus(orderId, 'shipped');
    
    // Deduct inventory when order is shipped
    deductInventoryForOrder(orderId);
  };

  // Inventory integration
  const deductInventoryForOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.items) return;

    order.items.forEach(item => {
      const product = products.find(p => p.name === item.name);
      if (product && product.stock >= item.quantity) {
        const updatedProduct = {
          ...product,
          stock: product.stock - item.quantity
        };
        updateProduct(updatedProduct);
      }
    });
  };

  // Order status update functionality
  const updateOrderStatus = (orderId, newStatus) => {
    // Update the order in the current state
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    // Update the order in localStorage
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const updatedOrders = allOrders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Send notification to customer
    sendOrderStatusNotification(orderId, newStatus);
  };

  // Send notification when order status changes
  const sendOrderStatusNotification = (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Only send notifications for customer orders (not supplier orders)
    const customerEmail = order.customerEmail || order.customer;
    if (!customerEmail) return;
    
    // Create notification
    const notification = {
      id: Date.now(),
      orderId: orderId,
      customerEmail: customerEmail,
      type: 'order_status_update',
      title: `Order Status Updated`,
      message: `Your order #${orderId} status has been updated to: ${newStatus}`,
      status: newStatus,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Store notification in localStorage
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // In a real app, this would send an email or push notification
    console.log(`Notification sent to ${customerEmail}: Order #${orderId} status updated to ${newStatus}`);
  };

  // Generate and send invoice
  const generateAndSendInvoice = async (order) => {
    if (!order.customerEmail) {
      alert('Customer email is required to send invoice');
      return;
    }

    setGeneratingInvoice(order.id);
    setSendingNotifications(order.id);

    try {
      // Create invoice data from order
      const invoiceData = createInvoiceFromOrder(order);
      
      // Validate invoice data
      const validation = invoiceService.validateInvoice(invoiceData);
      if (!validation.isValid) {
        alert('Invoice validation failed:\n' + validation.errors.join('\n'));
        return;
      }

      // Generate PDF
      console.log('📄 Generating invoice PDF...');
      const pdfBlob = await invoiceService.generatePDF(invoiceData);
      
      setGeneratingInvoice(null);
      
      // Send notifications (email and SMS)
      console.log('📧 Sending invoice notifications...');
      const notificationResults = await communicationService.sendInvoiceNotifications(
        invoiceData, 
        pdfBlob,
        {
          sendEmail: true,
          sendSMS: !!invoiceData.customerPhone // Send SMS only if phone is available
        }
      );

      setSendingNotifications(null);

      // Show results to user
      if (notificationResults.success) {
        const successMessages = [];
        if (notificationResults.email?.success) {
          successMessages.push('✅ Invoice sent via email');
        }
        if (notificationResults.sms?.success) {
          successMessages.push('✅ SMS notification sent');
        }
        
        alert('Invoice Generated & Sent Successfully!\n\n' + successMessages.join('\n'));
        
        // Save invoice to history and download for admin records
        saveInvoiceToHistory(invoiceData, 'sent');
        invoiceService.downloadInvoice(invoiceData, pdfBlob);
      } else {
        const errorMessages = notificationResults.errors.length > 0 
          ? notificationResults.errors.join('\n') 
          : 'Unknown error occurred';
        
        alert('Invoice generated but sending failed:\n' + errorMessages + '\n\nInvoice will be downloaded for manual sending.');
        
        // Save invoice to history and download for manual sending
        saveInvoiceToHistory(invoiceData, 'failed');
        invoiceService.downloadInvoice(invoiceData, pdfBlob);
      }

    } catch (error) {
      console.error('❌ Invoice generation failed:', error);
      alert('Failed to generate invoice: ' + error.message);
    } finally {
      setGeneratingInvoice(null);
      setSendingNotifications(null);
    }
  };

  // Create invoice data from order
  const createInvoiceFromOrder = (order) => {
    const invoiceNumber = `INV-${order.orderNumber || order.id}-${Date.now()}`;
    const currentDate = new Date().toISOString();
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

    // Convert order items to invoice items
    const invoiceItems = order.items ? order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: getRupeesValue(item.price || 0),
      total: getRupeesValue((item.price || 0) * item.quantity)
    })) : [];

    // Calculate totals
    const totals = invoiceService.calculateTotals(invoiceItems, 18, 0); // 18% tax, no discount

    return {
      invoiceNumber,
      customerName: order.customerName || order.customer || 'N/A',
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone || order.phone || '',
      customerAddress: order.customerAddress || order.address || 'Address not provided',
      items: invoiceItems,
      subtotal: totals.subtotal,
      taxRate: 18,
      taxAmount: totals.taxAmount,
      discount: 0,
      totalAmount: totals.totalAmount,
      status: 'pending',
      createdDate: currentDate,
      dueDate: dueDate,
      notes: `Generated for Order #${order.orderNumber || order.id}`,
      orderId: order.id
    };
  };

  // Save invoice to history for tracking
  const saveInvoiceToHistory = (invoiceData, status) => {
    try {
      const invoiceHistory = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
      
      const historyEntry = {
        ...invoiceData,
        generatedAt: new Date().toISOString(),
        generatedBy: user?.name || 'Admin',
        communicationStatus: status, // 'sent', 'failed', 'pending'
        lastUpdated: new Date().toISOString()
      };
      
      invoiceHistory.push(historyEntry);
      
      // Keep only last 100 invoices
      if (invoiceHistory.length > 100) {
        invoiceHistory.splice(0, invoiceHistory.length - 100);
      }
      
      localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory));
      console.log('📋 Invoice saved to history:', invoiceData.invoiceNumber);
    } catch (error) {
      console.error('Failed to save invoice to history:', error);
    }
  };

  // Get invoice history for an order
  const getInvoiceHistoryForOrder = (orderId) => {
    try {
      const invoiceHistory = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
      return invoiceHistory.filter(invoice => invoice.orderId === orderId);
    } catch (error) {
      console.error('Failed to get invoice history:', error);
      return [];
    }
  };

  // Order status options for outgoing orders
  const outgoingOrderStatuses = [
    { value: 'pending', label: 'Pending', icon: '⏳', color: '#ffc107' },
    { value: 'processed', label: 'Processed', icon: '🔄', color: '#17a2b8' },
    { value: 'shipped', label: 'Shipped', icon: '📦', color: '#007bff' },
    { value: 'delivered', label: 'Delivered', icon: '✅', color: '#28a745' }
  ];

  // Order status options for incoming orders
  const incomingOrderStatuses = [
    { value: 'ordered', label: 'Ordered', icon: '📝', color: '#6c757d' },
    { value: 'in_transit', label: 'In Transit', icon: '🚚', color: '#fd7e14' },
    { value: 'received', label: 'Received', icon: '✅', color: '#28a745' }
  ];

  // Helper functions for order display
  const getOrderItems = (order) => {
    if (order.items) {
      return order.items.map(item => `${item.name} (${item.quantity})`).join(', ');
    }
    return order.product ? `${order.product} (${order.quantity})` : 'No items';
  };

  const getOrderTotal = (order) => {
    if (order.total) {
      return `₹${getRupeesValue(order.total).toLocaleString('en-IN')}`;
    }
    return order.quantity && order.product ? `N/A` : 'N/A';
  };

  const getCustomerName = (order) => {
    return order.customerName || order.customer || 'N/A';
  };

  const getOrderDate = (order) => {
    return order.date || order.orderDate ? new Date(order.date || order.orderDate).toLocaleDateString() : 'N/A';
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase();
    switch(statusLower) {
      case 'pending': return 'status-pending';
      case 'processed': return 'status-processed';
      case 'packed': return 'status-packed';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'received': return 'status-received';
      default: return 'status-default';
    }
  };

  // Helper function to get filtered orders based on active tab
  const getFilteredOrders = () => {
    switch(activeTab) {
      case 'customer':
        return customerOrders;
      case 'supplier':
        return supplierOrders;
      default:
        return orders;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div className="header-text">
            <h1>📋 Order Management</h1>
            <p>Manage customer orders and track order status</p>
            {hasPermission("orders_add_incoming") && !hasPermission("orders_full") && (
              <div className="access-level">
                Staff Access - Can Add Incoming Orders Only
              </div>
            )}
          </div>
          <div className="header-actions">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
              {lastUpdated && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="refresh-btn"
                  onClick={loadOrders}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {loading ? '🔄 Refreshing...' : `🔄 Refresh Orders (${orders.length} total)`}
                </button>
                <button 
                  className="debug-btn"
                  onClick={() => {
                    console.log('=== ORDERS DEBUG INFO ===');
                    console.log('All orders from localStorage:', JSON.parse(localStorage.getItem('orders') || '[]'));
                    console.log('Current orders state:', orders);
                    console.log('Customer orders:', customerOrders);
                    console.log('Supplier orders:', supplierOrders);
                    console.log('Active tab:', activeTab);
                    console.log('Filtered orders:', getFilteredOrders());
                    alert('Orders debug info logged to console. Check browser console (F12).');
                  }}
                  style={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  🐛 Debug
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RoleGuard permission={["orders_full", "orders_add_incoming"]}>
        <form className="product-form" onSubmit={handleSubmit}>
          {/* Order Type Selection */}
          <select name="type" value={form.type} onChange={handleChange} required>
            <option value="">Select Order Type</option>
            <RoleGuard permission="orders_full">
              <option value="Outgoing">Outgoing (Customer Order)</option>
            </RoleGuard>
            <option value="Incoming">Incoming (Supplier Order)</option>
          </select>

          {/* Customer field - only for outgoing orders */}
          {form.type === "Outgoing" && (
            <RoleGuard permission="orders_full">
              <input
                name="customer"
                placeholder="Customer Name"
                value={form.customer}
                onChange={handleChange}
                required
              />
            </RoleGuard>
          )}

          {/* Supplier field - only for incoming orders */}
          {form.type === "Incoming" && (
            <input
              name="supplier"
              placeholder="Supplier Name"
              value={form.supplier}
              onChange={handleChange}
              required
            />
          )}

          <input
            name="product"
            placeholder="Product"
            value={form.product}
            onChange={handleChange}
            required
          />
          <input
            name="quantity"
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            required
          />
          
          {/* Status options based on order type */}
          <select name="status" value={form.status} onChange={handleChange} required>
            <option value="">Select Status</option>
            {form.type === "Outgoing" && (
              <>
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </>
            )}
            {form.type === "Incoming" && (
              <>
                <option value="Ordered">Ordered</option>
                <option value="In Transit">In Transit</option>
                <option value="Received">Received</option>
              </>
            )}
          </select>
          
          <button type="submit">
            {editingId ? "Update Order" : "Add Order"}
          </button>
        </form>
      </RoleGuard>

      {/* Order Tabs */}
      <div className="order-tabs">
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Orders
          </button>
          {hasPermission("orders_full") && (
            <button 
              className={`tab-button ${activeTab === 'customer' ? 'active' : ''}`}
              onClick={() => setActiveTab('customer')}
            >
              Customer Orders ({customerOrders.length} total)
            </button>
          )}
          {hasPermission("orders_add_incoming") && (
            <button 
              className={`tab-button ${activeTab === 'supplier' ? 'active' : ''}`}
              onClick={() => setActiveTab('supplier')}
            >
              Supplier Orders
            </button>
          )}
        </div>

        <div className="tab-content">
          <div className="table-section">
            <h2>
              {activeTab === 'all' && '📋 All Orders'}
              {activeTab === 'customer' && '🛒 Customer Orders'}
              {activeTab === 'supplier' && '📦 Supplier Orders'}
            </h2>
            
            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                      {hasPermission("orders_full") && <th>Actions</th>}
                      {hasPermission("orders_add_incoming") && <th>Processing</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredOrders().length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{textAlign: 'center', padding: '2rem'}}>
                          {activeTab === 'all' && 'No orders found. Customer orders will appear here after checkout.'}
                          {activeTab === 'customer' && 'No customer orders found. Orders will appear here after customers complete checkout.'}
                          {activeTab === 'supplier' && 'No supplier orders found.'}
                        </td>
                      </tr>
                    ) : (
                      getFilteredOrders().map((order) => (
                      <tr key={order.id}>
                        <td>{order.orderNumber || order.id}</td>
                        <td>{getCustomerName(order)}</td>
                        <td>{order.customerEmail || 'N/A'}</td>
                        <td>{getOrderItems(order)}</td>
                        <td>{getOrderTotal(order)}</td>
                        <td>{getOrderDate(order)}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        
                        {/* Admin Actions */}
                        {hasPermission("orders_full") && (
                          <td>
                            <select 
                              className="status-update-select"
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            >
                              {outgoingOrderStatuses.map(status => (
                                <option key={status.value} value={status.value}>
                                  {status.icon} {status.label}
                                </option>
                              ))}
                            </select>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => handleEdit(order)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(order.id)}
                            >
                              Delete
                            </button>
                            {/* Generate Invoice Button - Only for customer orders with email */}
                            {order.customerEmail && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <button
                                  className={`btn btn-sm ${generatingInvoice === order.id ? 'btn-secondary' : 'btn-success'}`}
                                  onClick={() => generateAndSendInvoice(order)}
                                  disabled={generatingInvoice === order.id || sendingNotifications === order.id}
                                  style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '12px'
                                  }}
                                >
                                  {generatingInvoice === order.id ? (
                                    <>🔄 Generating...</>
                                  ) : sendingNotifications === order.id ? (
                                    <>📧 Sending...</>
                                  ) : (
                                    <>📄 Generate Invoice</>
                                  )}
                                </button>
                                {/* Invoice History Indicator */}
                                {getInvoiceHistoryForOrder(order.id).length > 0 && (
                                  <div className="communication-status success" style={{ fontSize: '10px' }}>
                                    📋 {getInvoiceHistoryForOrder(order.id).length} invoice(s) sent
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        )}
                        
                        {/* Staff Processing Actions */}
                        {hasPermission("orders_add_incoming") && !hasPermission("orders_full") && (
                          <td>
                            <div className="processing-actions">
                              <button
                                className={`btn btn-sm ${stockConfirmation[order.id] ? 'btn-success' : 'btn-primary'}`}
                                onClick={() => confirmStock(order.id)}
                                disabled={stockConfirmation[order.id]}
                              >
                                {stockConfirmation[order.id] ? '✓ Stock Confirmed' : 'Confirm Stock'}
                              </button>
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => packItems(order.id)}
                                disabled={!stockConfirmation[order.id] || order.status === 'packed'}
                              >
                                Pack Items
                              </button>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => markAsShipped(order.id)}
                                disabled={order.status !== 'packed'}
                              >
                                Mark Shipped
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
