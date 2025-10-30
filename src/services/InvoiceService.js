// Invoice Service for PDF generation and invoice management
// This service handles invoice PDF generation and calculations

class InvoiceService {
  constructor() {
    this.companyInfo = {
      name: "Inventory Management System",
      address: "123 Business Street, City, State 12345",
      phone: "+1 (555) 123-4567",
      email: "info@ims-company.com",
      website: "www.ims-company.com",
      taxId: "TAX123456789"
    };
  }

  // Generate PDF invoice (simulated - in real app would use jsPDF or similar)
  async generatePDF(invoice) {
    try {
      // Simulate PDF generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real application, you would use a library like jsPDF or react-pdf
      // For demo purposes, we'll create a downloadable HTML version
      const htmlContent = this.generateInvoiceHTML(invoice);
      
      // Create blob for download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      console.log('📄 PDF Invoice generated successfully:', {
        invoiceNumber: invoice.invoiceNumber,
        customer: invoice.customerName,
        amount: invoice.totalAmount
      });

      return blob;
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error('Failed to generate PDF invoice');
    }
  }

  // Generate HTML content for invoice
  generateInvoiceHTML(invoice) {
    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;
    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .invoice-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
        }
        .company-info h1 {
            color: #007bff;
            margin: 0;
            font-size: 28px;
        }
        .company-info p {
            margin: 5px 0;
            color: #666;
        }
        .invoice-info {
            text-align: right;
        }
        .invoice-number {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin: 0;
        }
        .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .bill-to, .invoice-meta {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        .bill-to h3, .invoice-meta h3 {
            margin-top: 0;
            color: #007bff;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background: #007bff;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #ddd;
        }
        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .items-table tr:hover {
            background: #e3f2fd;
        }
        .text-right {
            text-align: right;
        }
        .totals {
            margin-left: auto;
            width: 300px;
        }
        .totals table {
            width: 100%;
            border-collapse: collapse;
        }
        .totals td {
            padding: 8px 15px;
            border-bottom: 1px solid #ddd;
        }
        .totals .total-row {
            background: #007bff;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
        }
        .status.paid {
            background: #d4edda;
            color: #155724;
        }
        .status.pending {
            background: #fff3cd;
            color: #856404;
        }
        .status.overdue {
            background: #f8d7da;
            color: #721c24;
        }
        .notes {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            border-radius: 4px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        @media print {
            body { background: white; }
            .invoice-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-info">
                <h1>${this.companyInfo.name}</h1>
                <p>${this.companyInfo.address}</p>
                <p>Phone: ${this.companyInfo.phone}</p>
                <p>Email: ${this.companyInfo.email}</p>
                <p>Tax ID: ${this.companyInfo.taxId}</p>
            </div>
            <div class="invoice-info">
                <h2 class="invoice-number">${invoice.invoiceNumber}</h2>
                <p><span class="status ${invoice.status}">${invoice.status}</span></p>
            </div>
        </div>

        <div class="invoice-details">
            <div class="bill-to">
                <h3>Bill To:</h3>
                <p><strong>${invoice.customerName}</strong></p>
                <p>${invoice.customerEmail}</p>
                <p>${invoice.customerPhone}</p>
                <p>${invoice.customerAddress}</p>
            </div>
            <div class="invoice-meta">
                <h3>Invoice Details:</h3>
                <p><strong>Invoice Date:</strong> ${formatDate(invoice.createdDate)}</p>
                <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
                ${invoice.paidDate ? `<p><strong>Paid Date:</strong> ${formatDate(invoice.paidDate)}</p>` : ''}
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">${formatCurrency(item.price)}</td>
                        <td class="text-right">${formatCurrency(item.total)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <table>
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-right">${formatCurrency(invoice.subtotal)}</td>
                </tr>
                <tr>
                    <td>Tax (${invoice.taxRate}%):</td>
                    <td class="text-right">${formatCurrency(invoice.taxAmount)}</td>
                </tr>
                ${invoice.discount > 0 ? `
                <tr>
                    <td>Discount:</td>
                    <td class="text-right">-${formatCurrency(invoice.discount)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                    <td>Total Amount:</td>
                    <td class="text-right">${formatCurrency(invoice.totalAmount)}</td>
                </tr>
            </table>
        </div>

        ${invoice.notes ? `
        <div class="notes">
            <h4>Notes:</h4>
            <p>${invoice.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${formatDate(new Date().toISOString().split('T')[0])} by ${this.companyInfo.name}</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  // Download invoice as HTML file
  downloadInvoice(invoice, blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoice.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Calculate invoice totals
  calculateTotals(items, taxRate = 18, discount = 0) {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount - discount;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(Math.max(0, totalAmount) * 100) / 100
    };
  }

  // Validate invoice data
  validateInvoice(invoiceData) {
    const errors = [];

    if (!invoiceData.customerName?.trim()) {
      errors.push("Customer name is required");
    }

    if (!invoiceData.customerEmail?.trim()) {
      errors.push("Customer email is required");
    }

    if (!invoiceData.items || invoiceData.items.length === 0) {
      errors.push("At least one item is required");
    }

    if (invoiceData.items) {
      invoiceData.items.forEach((item, index) => {
        if (!item.name?.trim()) {
          errors.push(`Item ${index + 1}: Name is required`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Item ${index + 1}: Valid quantity is required`);
        }
        if (!item.price || item.price <= 0) {
          errors.push(`Item ${index + 1}: Valid price is required`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format currency for display
  formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  // Get invoice status color
  getStatusColor(status) {
    switch (status) {
      case 'paid': return '#28a745';
      case 'pending': return '#ffc107';
      case 'overdue': return '#dc3545';
      default: return '#6c757d';
    }
  }

  // Check if invoice is overdue
  isOverdue(invoice) {
    if (!invoice.dueDate || invoice.status === 'paid') return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(invoice.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  }

  // Format currency with Indian Rupee symbol
  formatCurrency(amount) {
    if (amount === undefined || amount === null) return '₹0.00';
    return `₹${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}

// Create singleton instance
const invoiceService = new InvoiceService();

export default invoiceService;
