import { useState } from "react";
import { useBilling } from "../../contexts/BillingContext";
import { useInventory } from "../../contexts/InventoryContext";
import { useNotification } from "../../contexts/NotificationContext";
import invoiceService from "../../services/InvoiceService";
import "../styles/global.css";

const Billing = () => {
  const { 
    currentInvoice, 
    setCurrentInvoice, 
    addItemToInvoice, 
    removeItemFromInvoice, 
    updateItemInInvoice,
    createInvoice,
    calculateInvoiceTotals,
    isLoading
  } = useBilling();
  
  const { products } = useInventory();
  const { addNotificationToHistory } = useNotification();

  const [selectedProduct, setSelectedProduct] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [showProductSelector, setShowProductSelector] = useState(false);

  // Handle customer info changes
  const handleCustomerChange = (field, value) => {
    setCurrentInvoice(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle adding product to invoice
  const handleAddProduct = () => {
    if (!selectedProduct || !itemQuantity || !itemPrice) {
      addNotificationToHistory({
        type: 'userAction',
        title: 'Missing Information',
        message: 'Please select a product and enter quantity and price.',
        channels: ["system"]
      });
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) {
      addNotificationToHistory({
        type: 'userAction',
        title: 'Product Not Found',
        message: 'Selected product not found.',
        channels: ["system"]
      });
      return;
    }

    // Check if product already exists in invoice
    const existingItem = currentInvoice.items.find(item => item.id === product.id);
    if (existingItem) {
      addNotificationToHistory({
        type: 'userAction',
        title: 'Product Already Added',
        message: 'This product is already in the invoice. You can update its quantity below.',
        channels: ["system"]
      });
      return;
    }

    addItemToInvoice(product, itemQuantity, itemPrice);
    
    // Reset form
    setSelectedProduct("");
    setItemQuantity("");
    setItemPrice("");
    setShowProductSelector(false);

    addNotificationToHistory({
      type: 'billing',
      title: 'Product Added',
      message: `${product.name} added to invoice successfully.`,
      channels: ["system"]
    });
  };

  // Handle removing product from invoice
  const handleRemoveProduct = (itemId) => {
    removeItemFromInvoice(itemId);
    addNotificationToHistory({
      type: 'billing',
      title: 'Product Removed',
      message: 'Product removed from invoice.',
      channels: ["system"]
    });
  };

  // Handle updating item in invoice
  const handleUpdateItem = (itemId, quantity, price) => {
    if (quantity <= 0 || price <= 0) {
      addNotificationToHistory({
        type: 'userAction',
        title: 'Invalid Values',
        message: 'Quantity and price must be greater than 0.',
        channels: ["system"]
      });
      return;
    }
    updateItemInInvoice(itemId, quantity, price);
  };

  // Calculate totals for display
  const totals = calculateInvoiceTotals(currentInvoice.items, currentInvoice.taxRate, currentInvoice.discount);

  // Handle invoice creation
  const handleCreateInvoice = async () => {
    // Validate invoice
    const validation = invoiceService.validateInvoice(currentInvoice);
    if (!validation.isValid) {
      addNotificationToHistory({
        type: 'userAction',
        title: 'Validation Error',
        message: validation.errors.join(', '),
        channels: ["system"]
      });
      return;
    }

    try {
      const invoice = await createInvoice(currentInvoice);
      addNotificationToHistory({
        type: 'billing',
        title: 'Invoice Created',
        message: `Invoice ${invoice.invoiceNumber} created successfully! Total: ₹${invoice.totalAmount.toLocaleString('en-IN')}`,
        channels: ["system"]
      });
    } catch (error) {
      addNotificationToHistory({
        type: 'userAction',
        title: 'Creation Failed',
        message: 'Failed to create invoice. Please try again.',
        channels: ["system"]
      });
    }
  };

  // Auto-fill price when product is selected
  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      // Set a default price (you can customize this logic)
      const defaultPrice = product.category === 'Electronics' ? 1000 : 100;
      setItemPrice(defaultPrice.toString());
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>💰 Create Invoice</h1>
        <p>Generate professional invoices for your customers</p>
      </div>

      <div className="billing-container">
        {/* Customer Information */}
        <div className="info-card">
          <h2>👤 Customer Information</h2>
          <div className="customer-form">
            <div className="form-row">
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  value={currentInvoice.customerName}
                  onChange={(e) => handleCustomerChange('customerName', e.target.value)}
                  placeholder="Enter customer name  ligedha"
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={currentInvoice.customerEmail}
                  onChange={(e) => handleCustomerChange('customerEmail', e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={currentInvoice.customerPhone}
                  onChange={(e) => handleCustomerChange('customerPhone', e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={currentInvoice.dueDate}
                  onChange={(e) => handleCustomerChange('dueDate', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={currentInvoice.customerAddress}
                onChange={(e) => handleCustomerChange('customerAddress', e.target.value)}
                placeholder="Enter customer address"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="info-card">
          <h2>📦 Add Products</h2>
          
          {!showProductSelector ? (
            <button 
              className="add-product-btn"
              onClick={() => setShowProductSelector(true)}
            >
              + Add Product
            </button>
          ) : (
            <div className="product-selector">
              <div className="form-row">
                <div className="form-group">
                  <label>Select Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => handleProductSelect(e.target.value)}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Stock: {product.stock} {product.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    placeholder="1"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price (₹)</label>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="product-actions">
                <button onClick={handleAddProduct} className="btn-primary">
                  Add to Invoice
                </button>
                <button 
                  onClick={() => setShowProductSelector(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Items */}
        {currentInvoice.items.length > 0 && (
          <div className="info-card">
            <h2>📋 Invoice Items</h2>
            <div className="invoice-items">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, e.target.value, item.price)}
                          min="1"
                          className="quantity-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleUpdateItem(item.id, item.quantity, e.target.value)}
                          min="0"
                          step="0.01"
                          className="price-input"
                        />
                      </td>
                      <td>₹{item.total.toLocaleString('en-IN')}</td>
                      <td>
                        <button
                          onClick={() => handleRemoveProduct(item.id)}
                          className="btn-danger"
                        >
                          🗑️ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Invoice Settings & Totals */}
        {currentInvoice.items.length > 0 && (
          <div className="invoice-summary">
            <div className="info-card">
              <h2>⚙️ Invoice Settings</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Tax Rate (%)</label>
                  <input
                    type="number"
                    value={currentInvoice.taxRate}
                    onChange={(e) => handleCustomerChange('taxRate', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Discount (₹)</label>
                  <input
                    type="number"
                    value={currentInvoice.discount}
                    onChange={(e) => handleCustomerChange('discount', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={currentInvoice.notes}
                  onChange={(e) => handleCustomerChange('notes', e.target.value)}
                  placeholder="Additional notes or terms..."
                  rows="3"
                />
              </div>
            </div>

            <div className="info-card">
              <h2>💰 Invoice Totals</h2>
              <div className="totals-display">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="total-row">
                  <span>Tax ({currentInvoice.taxRate}%):</span>
                  <span>₹{totals.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                {currentInvoice.discount > 0 && (
                  <div className="total-row">
                    <span>Discount:</span>
                    <span>-₹{currentInvoice.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="total-row final-total">
                  <span>Total Amount:</span>
                  <span>₹{totals.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Invoice Button */}
        {currentInvoice.items.length > 0 && (
          <div className="invoice-actions">
            <button
              onClick={handleCreateInvoice}
              disabled={isLoading}
              className="btn-create-invoice"
            >
              {isLoading ? '⏳ Creating...' : '📄 Create Invoice'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
