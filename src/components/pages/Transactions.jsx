import { useState, useEffect } from "react";
import "../styles/global.css";
import { formatCurrency } from "../../utils/currency";

// Dynamic imports with error handling
let XLSX;
let saveAs;
let jsPDF;

// Lazy load heavy dependencies
const loadDependencies = async () => {
  try {
    const [xlsxModule, fileSaverModule, jsPdfModule] = await Promise.all([
      import('xlsx'),
      import('file-saver'),
      import('jspdf')
    ]);
    
    XLSX = xlsxModule.default;
    saveAs = fileSaverModule.saveAs;
    jsPDF = jsPdfModule.default;
    
    // Load jspdf-autotable dynamically
    await import('jspdf-autotable');
  } catch (error) {
    console.error('Failed to load dependencies:', error);
  }
};

// Initialize dependencies when the module loads
loadDependencies();

const Transactions = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    date: "",
    paymentMode: "",
    status: "",
    search: ""
  });
  
  const [form, setForm] = useState({
    type: "Sale",
    productId: "",
    productPrice: "",
    quantity: "",
    amount: "",
    paymentMode: "Cash",
    referenceNo: "",
    customer: "",
    supplier: "",
  });

  // Fetch products and transactions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // TODO: Replace with your actual API endpoints
        // const productsResponse = await fetch('/api/products');
        // const transactionsResponse = await fetch('/api/transactions');
        // const productsData = await productsResponse.json();
        // const transactionsData = await transactionsResponse.json();
        
        // For now, using empty arrays
        setProducts([]);
        setTransactions([]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.productId || !form.quantity) {
      setError("⚠️ Please select a product and enter quantity.");
      return;
    }

    // Here you would typically make an API call to save the transaction
    // For now, we'll just add it to the local state
    const newTransaction = {
      id: `TXN${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: form.type,
      product: products.find(p => p.id === form.productId)?.name || 'Unknown',
      quantity: form.quantity,
      unit: products.find(p => p.id === form.productId)?.unit || '',
      amount: form.amount || 0,
      paymentMode: form.paymentMode,
      referenceNo: form.referenceNo,
      status: 'Success',
      customer: form.customer,
      supplier: form.supplier
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Reset form
    setForm({
      type: "Sale",
      productId: "",
      productPrice: "",
      quantity: "",
      amount: "",
      paymentMode: "Cash",
      referenceNo: "",
      customer: "",
      supplier: "",
    });
  };

  // Filter transactions based on all filters
  const filteredTransactions = transactions.filter(transaction => {
    // Date filter
    if (filters.date && transaction.date !== filters.date) return false;
    
    // Payment mode filter
    if (filters.paymentMode && transaction.paymentMode !== filters.paymentMode) return false;
    
    // Status filter
    if (filters.status && transaction.status !== filters.status) return false;
    
    // Search filter (searches in product name, customer, supplier, reference)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        transaction.product?.toLowerCase().includes(searchTerm) ||
        (transaction.customer && transaction.customer.toLowerCase().includes(searchTerm)) ||
        (transaction.supplier && transaction.supplier.toLowerCase().includes(searchTerm)) ||
        (transaction.referenceNo && transaction.referenceNo.toLowerCase().includes(searchTerm))
      );
    }
    
    return true;
  });

  // Export to CSV
  const exportToCSV = () => {
    if (!XLSX || !saveAs) {
      alert('Export features are still loading. Please try again in a moment.');
      return;
    }

    try {
      const headers = [
        'Transaction ID', 'Date', 'Type', 'Product', 'Quantity', 
        'Unit', 'Amount', 'Payment Mode', 'Reference No', 'Status', 'Customer/Supplier'
      ];
      
      const csvData = [
        headers,
        ...filteredTransactions.map(t => [
          t.id,
          t.date,
          t.type,
          t.product,
          t.quantity,
          t.unit,
          formatCurrency(t.amount || 0),
          t.paymentMode,
          t.referenceNo || '-',
          t.status,
          t.type === 'Sale' ? t.customer : t.supplier
        ])
      ];
      
      let csvContent = csvData.map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export to CSV. Please try again.');
    }
  };
  
  // Export to Excel
  const exportToExcel = () => {
    if (!XLSX) {
      alert('Excel export is still loading. Please try again in a moment.');
      return;
    }

    try {
      const ws = XLSX.utils.json_to_sheet(
        filteredTransactions.map(t => ({
          'Transaction ID': t.id,
          'Date': t.date,
          'Type': t.type,
          'Product': t.product,
          'Quantity': t.quantity,
          'Unit': t.unit,
          'Amount': t.amount || 0,
          'Payment Mode': t.paymentMode,
          'Reference No': t.referenceNo || '-',
          'Status': t.status,
          'Customer/Supplier': t.type === 'Sale' ? t.customer : t.supplier
        }))
      );
      
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
      XLSX.writeFile(wb, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    }
  };
  
  // Export to PDF
  const exportToPDF = () => {
    if (!jsPDF) {
      alert('PDF export is still loading. Please try again in a moment.');
      return;
    }

    try {
      const doc = new jsPDF();
      const title = 'Transaction Report';
      const headers = [
        ['ID', 'Date', 'Type', 'Product', 'Qty', 'Amount', 'Status']
      ];
      
      const data = filteredTransactions.map(t => [
        t.id,
        t.date,
        t.type,
        t.product,
        `${t.quantity} ${t.unit}`,
        formatCurrency(t.amount || 0),
        t.status
      ]);
      
      doc.text(title, 14, 15);
      doc.autoTable({
        head: headers,
        body: data,
        startY: 25,
        styles: { fontSize: 8 },
        headStyles: { 
          fillColor: [41, 128, 185], 
          textColor: 255, 
          fontStyle: 'bold' 
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 25 }
      });
      
      doc.save(`transactions_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>💳 Transactions</h1>
          <p>Loading transactions...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>💳 Transactions</h1>
        <p>Manage sales and purchases, track inventory changes</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h3>Add New Transaction</h3>
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Transaction Type</label>
            <select 
              name="type" 
              value={form.type} 
              onChange={handleChange}
              className="form-control"
            >
              <option value="Sale">Sale (Payment In)</option>
              <option value="Purchase">Purchase (Payment Out)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Product</label>
            <select 
              name="productId" 
              value={form.productId} 
              onChange={handleChange}
              className="form-control"
              disabled={products.length === 0}
            >
              <option value="">Select Product</option>
              {products.length > 0 ? (
                products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.stock} {p.unit})
                  </option>
                ))
              ) : (
                <option value="" disabled>No products available</option>
              )}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="form-control"
                min="1"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="form-control"
                disabled={form.type === 'Sale'}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Payment Mode</label>
              <select 
                name="paymentMode" 
                value={form.paymentMode} 
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Reference No.</label>
              <input
                type="text"
                name="referenceNo"
                placeholder={form.type === 'Sale' ? 'Invoice ID' : 'Supplier Bill No'}
                value={form.referenceNo}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          {form.type === "Sale" ? (
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                name="customer"
                placeholder="Enter customer name"
                value={form.customer}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Supplier Name</label>
              <input
                type="text"
                name="supplier"
                placeholder="Enter supplier name"
                value={form.supplier}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary">
            {form.type === 'Sale' ? 'Record Sale' : 'Record Purchase'}
          </button>
        </form>
      </div>

      {/* Stock Table */}
      {products.length > 0 ? (
        <div className="table-section">
          <h2>📦 Current Stock</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Unit</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.stock}</td>
                    <td>{p.unit}</td>
                    <td>{formatCurrency(p.price || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">
          No products available. Please add products first.
        </div>
      )}

      {/* Transaction History */}
      <div className="table-section">
        <div className="table-header">
          <h2>📋 Transaction History</h2>
          {transactions.length > 0 && (
            <div className="export-buttons">
              <button type="button" onClick={exportToCSV} className="btn btn-export">
                <i className="fas fa-file-csv"></i> CSV
              </button>
              <button type="button" onClick={exportToExcel} className="btn btn-export">
                <i className="fas fa-file-excel"></i> Excel
              </button>
              <button type="button" onClick={exportToPDF} className="btn btn-export">
                <i className="fas fa-file-pdf"></i> PDF
              </button>
            </div>
          )}
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          
          <div className="filter-group">
            <label>Payment Mode</label>
            <select 
              name="paymentMode" 
              value={filters.paymentMode}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Status</label>
            <select 
              name="status" 
              value={filters.status}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          
          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          
          <button 
            type="button"
            className="btn btn-clear"
            onClick={() => setFilters({
              date: "",
              paymentMode: "",
              status: "",
              search: ""
            })}
          >
            Clear Filters
          </button>
        </div>

        <div className="table-container">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>{form.type === 'Sale' ? 'Customer' : 'Supplier'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <tr key={t.id}>
                      <td className="monospace">{t.id || 'N/A'}</td>
                      <td>{t.date || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${t.type?.toLowerCase() || ''}`}>
                          {t.type || 'N/A'}
                        </span>
                      </td>
                      <td>{t.product || 'N/A'}</td>
                      <td>{t.quantity} {t.unit || ''}</td>
                      <td className="amount">{formatCurrency(t.amount || 0)}</td>
                      <td>{t.paymentMode || 'N/A'}</td>
                      <td className="reference">{t.referenceNo || '-'}</td>
                      <td>
                        <span className={`status-badge ${t.status?.toLowerCase() || 'pending'}`}>
                          {t.status || 'Pending'}
                        </span>
                      </td>
                      <td>{t.type === 'Sale' ? (t.customer || '-') : (t.supplier || '-')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="no-data">
                      <i className="fas fa-inbox"></i>
                      <p>No transactions found</p>
                      {Object.values(filters).some(Boolean) && (
                        <button 
                          type="button"
                          className="btn-text"
                          onClick={() => setFilters({
                            date: "",
                            paymentMode: "",
                            status: "",
                            search: ""
                          })}
                        >
                          Clear filters to see all transactions
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .page-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 30px;
        }
        
        .page-header h1 {
          margin: 0 0 10px 0;
          color: #333;
        }
        
        .page-header p {
          margin: 0;
          color: #666;
        }
        
        .card {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .card h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .form-row .form-group {
          flex: 1;
          margin-bottom: 0;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #555;
        }
        
        .form-control {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-primary {
          background-color: #4CAF50;
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #45a049;
        }
        
        .btn-export {
          background-color: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
          padding: 8px 12px;
        }
        
        .btn-export:hover {
          background-color: #eee;
        }
        
        .btn-clear {
          background-color: transparent;
          color: #666;
          border: 1px solid #ddd;
          align-self: flex-end;
          padding: 8px 16px;
        }
        
        .btn-clear:hover {
          background-color: #f5f5f5;
        }
        
        .btn-text {
          background: none;
          border: none;
          color: #2196f3;
          cursor: pointer;
          padding: 0;
          font-size: 14px;
          text-decoration: underline;
        }
        
        .btn-text:hover {
          color: #0d8aee;
        }
        
        .alert {
          padding: 12px 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .alert-error {
          background-color: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
        }
        
        .alert-info {
          background-color: #e3f2fd;
          color: #1565c0;
          border: 1px solid #bbdefb;
        }
        
        .table-section {
          margin-top: 30px;
        }
        
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        
        .filter-group {
          flex: 1;
          min-width: 150px;
        }
        
        .search-group {
          position: relative;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .table-responsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        
        .data-table th,
        .data-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .data-table th {
          background-color: #f5f5f5;
          font-weight: 500;
          color: #555;
          white-space: nowrap;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .status-badge.sale,
        .status-badge.success {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-badge.purchase {
          background: #e3f2fd;
          color: #1565c0;
        }
        
        .status-badge.pending {
          background: #fff8e1;
          color: #ff8f00;
        }
        
        .status-badge.failed {
          background: #ffebee;
          color: #c62828;
        }
        
        .amount {
          font-weight: 500;
          font-family: 'Roboto Mono', monospace;
        }
        
        .reference {
          font-family: 'Roboto Mono', monospace;
          font-size: 12px;
          color: #666;
        }
        
        .monospace {
          font-family: 'Roboto Mono', monospace;
          font-size: 12px;
          color: #666;
        }
        
        .no-data {
          text-align: center;
          padding: 40px 20px;
          color: #999;
        }
        
        .no-data i {
          font-size: 40px;
          margin-bottom: 10px;
          opacity: 0.5;
        }
        
        .no-data p {
          margin: 10px 0;
          font-size: 16px;
        }
        
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 0;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #2196f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 15px;
          }
          
          .filters {
            flex-direction: column;
            gap: 15px;
          }
          
          .filter-group {
            width: 100%;
          }
          
          .table-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          
          .export-buttons {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          
          .btn-export {
            flex: 1;
            min-width: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default Transactions;
