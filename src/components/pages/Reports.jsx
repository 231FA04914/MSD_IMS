import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useInventory } from "../../contexts/InventoryContext";
import RoleGuard from "../RoleGuard";
import "../styles/Reports.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Reports = () => {
  const { hasPermission, user } = useAuth();
  const { 
    products = [], 
    getLowStockProducts = () => [], 
    getCriticalStockProducts = () => [],
    getExpiringProducts = () => [],
    getExpiredProducts = () => []
  } = useInventory() || {};

  // Calculate report data
  const lowStockProducts = getLowStockProducts();
  const criticalStockProducts = getCriticalStockProducts();
  const expiringProducts = getExpiringProducts();
  const expiredProducts = getExpiredProducts();

  // Mock data for charts
  const monthlySalesData = [45000, 52000, 48000, 61000, 55000, 67000, 73000, 69000, 71000, 78000, 82000, 120000];
  const supplierData = [
    { name: "ABC Traders", value: 50 },
    { name: "XYZ Supplies", value: 25 },
    { name: "Global Imports", value: 15 },
    { name: "Local Vendors", value: 10 }
  ];

  // Stock Status Pie Chart Data
  const stockStatusData = {
    labels: ['Normal Stock', 'Low Stock', 'Critical Stock'],
    datasets: [
      {
        data: [
          products.length - lowStockProducts.length - criticalStockProducts.length,
          lowStockProducts.length,
          criticalStockProducts.length
        ],
        backgroundColor: [
          '#065F46', // Dark Green
          '#92400E', // Dark Yellow
          '#991B1B', // Dark Red
        ],
        borderColor: [
          '#064E3B',
          '#78350F',
          '#7F1D1D',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Expiry Status Pie Chart Data
  const expiryStatusData = {
    labels: ['Good Stock', 'Expiring Soon', 'Expired'],
    datasets: [
      {
        data: [
          products.length - expiringProducts.length - expiredProducts.length,
          expiringProducts.length,
          expiredProducts.length
        ],
        backgroundColor: [
          '#065F46', // Dark Green
          '#92400E', // Dark Yellow
          '#991B1B', // Dark Red
        ],
        borderColor: [
          '#064E3B',
          '#78350F',
          '#7F1D1D',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Monthly Sales Bar Chart Data
  const monthlySalesChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Sales (₹)',
        data: monthlySalesData,
        backgroundColor: 'rgba(49, 46, 129, 0.8)',
        borderColor: 'rgba(30, 27, 75, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Top Suppliers Pie Chart Data
  const topSuppliersData = {
    labels: supplierData.map(s => s.name),
    datasets: [
      {
        data: supplierData.map(s => s.value),
        backgroundColor: [
          '#312E81', // Dark Indigo
          '#5B21B6', // Dark Purple
          '#831843', // Dark Pink
          '#92400E', // Dark Yellow
        ],
        borderColor: [
          '#1E1B4B',
          '#4C1D95',
          '#500724',
          '#78350F',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Monthly Sales Trend',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">📊 Reports & Insights</h1>
        <p className="reports-subtitle">Visual analytics and comprehensive inventory insights</p>
        {hasPermission("reports_basic") && !hasPermission("reports_full") && (
          <div className="access-level-indicator">
            <span className="badge badge-warning">Staff Access - Basic Reports</span>
          </div>
        )}
      </div>

      {/* Stock Status Charts */}
      <div className="reports-section">
        <h2 className="section-title">🔔 Stock Status Overview</h2>
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3>📦 Stock Status Distribution</h3>
              <div className="chart-stats">
                <div className="stat-item">
                  <span className="stat-label normal">Normal:</span>
                  <span className="stat-value">{products.length - lowStockProducts.length - criticalStockProducts.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label low">Low:</span>
                  <span className="stat-value">{lowStockProducts.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label critical">Critical:</span>
                  <span className="stat-value">{criticalStockProducts.length}</span>
                </div>
              </div>
            </div>
            <div className="chart-container">
              <Pie data={stockStatusData} options={pieChartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>⏰ Expiry Status Overview</h3>
              <div className="chart-stats">
                <div className="stat-item">
                  <span className="stat-label good">Good:</span>
                  <span className="stat-value">{products.length - expiringProducts.length - expiredProducts.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label expiring">Expiring:</span>
                  <span className="stat-value">{expiringProducts.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label expired">Expired:</span>
                  <span className="stat-value">{expiredProducts.length}</span>
                </div>
              </div>
            </div>
            <div className="chart-container">
              <Pie data={expiryStatusData} options={pieChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Admin-only Charts */}
      <RoleGuard permission="reports_full">
        <div className="reports-section">
          <h2 className="section-title">📈 Business Analytics</h2>
          <div className="charts-grid">
            <div className="chart-card large">
              <div className="chart-header">
                <h3>💰 Monthly Sales Trend</h3>
                <div className="chart-summary">
                  <div className="summary-item">
                    <span className="summary-label">Total Sales:</span>
                    <span className="summary-value">₹{monthlySalesData.reduce((a, b) => a + b, 0).toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Average:</span>
                    <span className="summary-value">₹{Math.round(monthlySalesData.reduce((a, b) => a + b, 0) / 12).toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Best Month:</span>
                    <span className="summary-value">Dec (₹{monthlySalesData[11].toLocaleString()})</span>
                  </div>
                </div>
              </div>
              <div className="chart-container large">
                <Bar data={monthlySalesChartData} options={barChartOptions} />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>🏢 Top Suppliers Distribution</h3>
                <div className="chart-stats">
                  {supplierData.map((supplier, index) => (
                    <div key={index} className="stat-item">
                      <span className="stat-label">{supplier.name}:</span>
                      <span className="stat-value">{supplier.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chart-container">
                <Pie data={topSuppliersData} options={pieChartOptions} />
              </div>
            </div>
          </div>
        </div>
      </RoleGuard>

      {/* Alert Summary Cards */}
      <div className="reports-section">
        <h2 className="section-title">🚨 Alert Summary</h2>
        <div className="alert-cards-grid">
          <div className="alert-card warning">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h4>Low Stock Alert</h4>
              <p>{lowStockProducts.length} products below threshold</p>
              <div className="alert-progress">
                <div 
                  className="progress-fill warning" 
                  style={{ width: `${Math.min((lowStockProducts.length / products.length) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="alert-card danger">
            <div className="alert-icon">🚨</div>
            <div className="alert-content">
              <h4>Critical Stock</h4>
              <p>{criticalStockProducts.length} products need immediate attention</p>
              <div className="alert-progress">
                <div 
                  className="progress-fill danger" 
                  style={{ width: `${Math.min((criticalStockProducts.length / products.length) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="alert-card info">
            <div className="alert-icon">⏰</div>
            <div className="alert-content">
              <h4>Expiry Alerts</h4>
              <p>{expiringProducts.length} products expiring soon</p>
              <div className="alert-progress">
                <div 
                  className="progress-fill info" 
                  style={{ width: `${Math.min((expiringProducts.length / products.length) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="alert-card expired">
            <div className="alert-icon">💀</div>
            <div className="alert-content">
              <h4>Expired Products</h4>
              <p>{expiredProducts.length} products have expired</p>
              <div className="alert-progress">
                <div 
                  className="progress-fill expired" 
                  style={{ width: `${Math.min((expiredProducts.length / products.length) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Access Notice */}
      <RoleGuard permission="reports_basic" fallback={null}>
        <RoleGuard permission="reports_full" fallback={null}>
          <div className="info-notice">
            <div className="notice-icon">ℹ️</div>
            <div className="notice-content">
              <h3>Staff Access Level</h3>
              <p>You have access to essential inventory monitoring reports. Contact your administrator for full business analytics access.</p>
            </div>
          </div>
        </RoleGuard>
      </RoleGuard>
    </div>
  );
};

export default Reports;
