// Communication Service for Email and SMS Integration
// This service handles sending invoices via email and SMS notifications

class CommunicationService {
  constructor() {
    this.emailConfig = {
      service: 'gmail', // In production, use proper email service
      apiKey: import.meta.env.VITE_EMAIL_API_KEY || 'demo-key',
      fromEmail: 'noreply@ims-company.com',
      fromName: 'Inventory Management System'
    };

    this.smsConfig = {
      service: 'twilio', // In production, use Twilio, AWS SNS, or similar
      apiKey: import.meta.env.VITE_SMS_API_KEY || 'demo-key',
      fromNumber: '+1234567890'
    };
  }

  // Send invoice via email
  async sendInvoiceEmail(invoice, pdfBlob) {
    try {
      console.log('📧 Sending invoice email...');
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real application, you would use a service like:
      // - EmailJS for client-side email sending
      // - SendGrid, Mailgun, or AWS SES for server-side
      // - Nodemailer for Node.js backend

      const emailData = {
        to: invoice.customerEmail,
        subject: `Invoice ${invoice.invoiceNumber} - ${this.emailConfig.fromName}`,
        html: this.generateEmailHTML(invoice),
        attachments: [
          {
            filename: `Invoice_${invoice.invoiceNumber}.pdf`,
            content: pdfBlob
          }
        ]
      };

      // Simulate successful email sending
      console.log('✅ Invoice email sent successfully:', {
        to: emailData.to,
        subject: emailData.subject,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount
      });

      // Store email log in localStorage for demo purposes
      this.logCommunication({
        type: 'email',
        recipient: invoice.customerEmail,
        subject: emailData.subject,
        status: 'sent',
        timestamp: new Date().toISOString(),
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount
      });

      return {
        success: true,
        messageId: `email_${Date.now()}`,
        message: 'Invoice email sent successfully'
      };

    } catch (error) {
      console.error('❌ Failed to send invoice email:', error);
      
      // Log failed attempt
      this.logCommunication({
        type: 'email',
        recipient: invoice.customerEmail,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
        invoiceNumber: invoice.invoiceNumber
      });

      throw new Error('Failed to send invoice email');
    }
  }

  // Send SMS notification
  async sendInvoiceSMS(invoice) {
    try {
      console.log('📱 Sending invoice SMS...');
      
      // Simulate SMS sending delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const smsMessage = this.generateSMSMessage(invoice);
      
      // In a real application, you would use:
      // - Twilio API for SMS sending
      // - AWS SNS for SMS notifications
      // - Other SMS gateway services

      const smsData = {
        to: invoice.customerPhone,
        from: this.smsConfig.fromNumber,
        body: smsMessage
      };

      // Simulate successful SMS sending
      console.log('✅ Invoice SMS sent successfully:', {
        to: smsData.to,
        message: smsMessage,
        invoiceNumber: invoice.invoiceNumber
      });

      // Store SMS log in localStorage for demo purposes
      this.logCommunication({
        type: 'sms',
        recipient: invoice.customerPhone,
        message: smsMessage,
        status: 'sent',
        timestamp: new Date().toISOString(),
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.totalAmount
      });

      return {
        success: true,
        messageId: `sms_${Date.now()}`,
        message: 'Invoice SMS sent successfully'
      };

    } catch (error) {
      console.error('❌ Failed to send invoice SMS:', error);
      
      // Log failed attempt
      this.logCommunication({
        type: 'sms',
        recipient: invoice.customerPhone,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
        invoiceNumber: invoice.invoiceNumber
      });

      throw new Error('Failed to send invoice SMS');
    }
  }

  // Generate email HTML content
  generateEmailHTML(invoice) {
    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;
    
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
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px;
        }
        .invoice-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .amount-highlight {
            background: #e3f2fd;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .amount-highlight .amount {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
        }
        .button {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Invoice Generated</h1>
            <p>Thank you for your business!</p>
        </div>
        
        <div class="content">
            <p>Dear ${invoice.customerName},</p>
            
            <p>Your invoice has been generated and is ready for review. Please find the details below:</p>
            
            <div class="invoice-details">
                <h3>Invoice Details</h3>
                <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> ${new Date(invoice.createdDate).toLocaleDateString('en-IN')}</p>
                <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
                <p><strong>Status:</strong> <span style="color: #007bff; font-weight: bold;">${invoice.status}</span></p>
            </div>
            
            <div class="amount-highlight">
                <p style="margin: 0;">Total Amount Due:</p>
                <div class="amount">${formatCurrency(invoice.totalAmount)}</div>
            </div>
            
            <p>The complete invoice is attached to this email as a PDF document. Please review it and contact us if you have any questions.</p>
            
            <p>If you have any questions about this invoice, please don't hesitate to contact us at:</p>
            <ul>
                <li>Email: info@ims-company.com</li>
                <li>Phone: +1 (555) 123-4567</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>This is an automated message from ${this.emailConfig.fromName}</p>
            <p>Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  // Generate SMS message
  generateSMSMessage(invoice) {
    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;
    
    return `Invoice ${invoice.invoiceNumber} generated! Amount: ${formatCurrency(invoice.totalAmount)}. Due: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}. Check your email for details. - ${this.emailConfig.fromName}`;
  }

  // Log communication attempts
  logCommunication(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('communicationLogs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('communicationLogs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log communication:', error);
    }
  }

  // Get communication logs
  getCommunicationLogs() {
    try {
      return JSON.parse(localStorage.getItem('communicationLogs') || '[]');
    } catch (error) {
      console.error('Failed to get communication logs:', error);
      return [];
    }
  }

  // Send both email and SMS
  async sendInvoiceNotifications(invoice, pdfBlob, options = {}) {
    const results = {
      email: null,
      sms: null,
      success: false,
      errors: []
    };

    try {
      // Send email if enabled and email is available
      if (options.sendEmail !== false && invoice.customerEmail) {
        try {
          results.email = await this.sendInvoiceEmail(invoice, pdfBlob);
        } catch (error) {
          results.errors.push(`Email: ${error.message}`);
        }
      }

      // Send SMS if enabled and phone is available
      if (options.sendSMS !== false && invoice.customerPhone) {
        try {
          results.sms = await this.sendInvoiceSMS(invoice);
        } catch (error) {
          results.errors.push(`SMS: ${error.message}`);
        }
      }

      // Consider successful if at least one method succeeded
      results.success = results.email?.success || results.sms?.success;

      return results;
    } catch (error) {
      console.error('Failed to send invoice notifications:', error);
      results.errors.push(error.message);
      return results;
    }
  }

  // Validate contact information
  validateContactInfo(invoice) {
    const issues = [];

    if (!invoice.customerEmail || !this.isValidEmail(invoice.customerEmail)) {
      issues.push('Invalid or missing customer email');
    }

    if (!invoice.customerPhone || !this.isValidPhone(invoice.customerPhone)) {
      issues.push('Invalid or missing customer phone number');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Phone validation (basic)
  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{3,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }
}

// Create singleton instance
const communicationService = new CommunicationService();

export default communicationService;
