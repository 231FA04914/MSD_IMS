import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import RoleGuard from "../RoleGuard";
import communicationService from "../../services/CommunicationService";
import "../styles/global.css";

const CommunicationLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all', // all, email, sms
    status: 'all', // all, sent, failed
    dateRange: '7', // 7, 30, 90, all
    search: ''
  });

  useEffect(() => {
    loadCommunicationLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const loadCommunicationLogs = () => {
    setLoading(true);
    try {
      const communicationLogs = communicationService.getCommunicationLogs();
      const invoiceHistory = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
      
      // Combine communication logs with invoice history
      const combinedLogs = [
        ...communicationLogs,
        ...invoiceHistory.map(invoice => ({
          type: 'invoice',
          recipient: invoice.customerEmail,
          subject: `Invoice ${invoice.invoiceNumber}`,
          status: invoice.communicationStatus || 'generated',
          timestamp: invoice.generatedAt,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount,
          orderId: invoice.orderId
        }))
      ];

      // Sort by timestamp (newest first)
      combinedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setLogs(combinedLogs);
    } catch (error) {
      console.error('Failed to load communication logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(log => log.type === filters.type);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoffDate);
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.recipient?.toLowerCase().includes(searchTerm) ||
        log.subject?.toLowerCase().includes(searchTerm) ||
        log.invoiceNumber?.toLowerCase().includes(searchTerm) ||
        log.orderId?.toString().includes(searchTerm)
      );
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      sent: { class: 'success', icon: '✅', label: 'Sent' },
      failed: { class: 'error', icon: '❌', label: 'Failed' },
      generated: { class: 'info', icon: '📄', label: 'Generated' },
      pending: { class: 'warning', icon: '⏳', label: 'Pending' }
    };

    const config = statusConfig[status] || { class: 'secondary', icon: '❓', label: status };
    
    return (
      <span className={`communication-status ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const typeIcons = {
      email: '📧',
      sms: '📱',
      invoice: '📄'
    };
    return typeIcons[type] || '📋';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return amount ? `₹${amount.toLocaleString('en-IN')}` : '';
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Recipient', 'Subject', 'Status', 'Invoice Number', 'Amount', 'Order ID'].join(','),
      ...filteredLogs.map(log => [
        formatDate(log.timestamp),
        log.type,
        log.recipient || '',
        log.subject || log.message || '',
        log.status,
        log.invoiceNumber || '',
        log.amount || '',
        log.orderId || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `communication-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <RoleGuard permission="orders_full">
      <div className="communication-logs-container">
        <div className="page-header">
          <h1>📞 Communication Logs</h1>
          <p>Track all email and SMS communications sent to customers</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <label>Type:</label>
              <select 
                value={filters.type} 
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="invoice">Invoice</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status:</label>
              <select 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="generated">Generated</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Date Range:</label>
              <select 
                value={filters.dateRange} 
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search recipient, invoice, order..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <button className="btn btn-primary" onClick={exportLogs}>
              📊 Export CSV
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📧</div>
            <div className="stat-content">
              <div className="stat-number">{logs.filter(l => l.type === 'email').length}</div>
              <div className="stat-label">Emails Sent</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📱</div>
            <div className="stat-content">
              <div className="stat-number">{logs.filter(l => l.type === 'sms').length}</div>
              <div className="stat-label">SMS Sent</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <div className="stat-number">{logs.filter(l => l.type === 'invoice').length}</div>
              <div className="stat-label">Invoices Generated</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{logs.filter(l => l.status === 'sent').length}</div>
              <div className="stat-label">Successfully Sent</div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="logs-section">
          <div className="section-header">
            <h2>Communication History ({filteredLogs.length} records)</h2>
            <button className="btn btn-secondary" onClick={loadCommunicationLogs}>
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading communication logs...</div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Type</th>
                    <th>Recipient</th>
                    <th>Subject/Message</th>
                    <th>Status</th>
                    <th>Invoice #</th>
                    <th>Amount</th>
                    <th>Order #</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                        No communication logs found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <tr key={index}>
                        <td>{formatDate(log.timestamp)}</td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {getTypeIcon(log.type)} {log.type}
                          </span>
                        </td>
                        <td>{log.recipient}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {log.subject || log.message || '-'}
                        </td>
                        <td>{getStatusBadge(log.status)}</td>
                        <td>{log.invoiceNumber || '-'}</td>
                        <td>{formatCurrency(log.amount)}</td>
                        <td>{log.orderId || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default CommunicationLogs;
