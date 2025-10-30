import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types for TypeScript (optional)
/**
 * @typedef {Object} InvoiceItem
 * @property {string} id - Unique identifier for the item
 * @property {string} name - Name of the item
 * @property {number} quantity - Quantity of the item
 * @property {number} price - Price per unit
 * @property {number} total - Total price (quantity * price)
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id - Unique identifier for the invoice
 * @property {string} invoiceNumber - Formatted invoice number (e.g., INV-2024-001)
 * @property {string} customerName - Name of the customer
 * @property {string} customerEmail - Email of the customer
 * @property {string} customerPhone - Phone number of the customer
 * @property {string} customerAddress - Billing address of the customer
 * @property {InvoiceItem[]} items - Array of items in the invoice
 * @property {number} subtotal - Subtotal before tax and discount
 * @property {number} taxRate - Tax rate in percentage
 * @property {number} taxAmount - Calculated tax amount
 * @property {number} discount - Discount amount
 * @property {number} totalAmount - Final total amount
 * @property {'draft'|'pending'|'paid'|'overdue'|'cancelled'} status - Current status of the invoice
 * @property {string} createdDate - ISO date string when invoice was created
 * @property {string} dueDate - ISO date string when payment is due
 * @property {string|null} paidDate - ISO date string when payment was received, null if not paid
 * @property {string} notes - Additional notes or terms
 * @property {string|null} orderId - Reference to an order if applicable
 * @property {'credit_card'|'bank_transfer'|'cash'|'other'|''} paymentMethod - Method of payment
 * @property {'unpaid'|'partial'|'paid'|'refunded'|'failed'} paymentStatus - Status of payment
 * @property {string} shippingAddress - Shipping address if different from billing
 * @property {string} terms - Payment terms
 * @property {string} createdAt - ISO timestamp when record was created
 * @property {string} updatedAt - ISO timestamp when record was last updated
 */

const BillingContext = createContext();

/**
 * Custom hook to access the billing context
 * @returns {Object} Billing context value
 * @throws Will throw an error if used outside of a BillingProvider
 */
export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};

/**
 * Load invoices from localStorage
 * @returns {Invoice[]} Array of invoices
 */
const loadInvoices = () => {
  try {
    const savedInvoices = localStorage.getItem('invoices');
    return savedInvoices ? JSON.parse(savedInvoices) : [];
  } catch (error) {
    console.error('Error loading invoices from localStorage:', error);
    return [];
  }
};

/**
 * Calculate invoice totals based on items, tax rate, and discount
 * @param {InvoiceItem[]} items - Array of invoice items
 * @param {number} [taxRate=0] - Tax rate in percentage
 * @param {number} [discount=0] - Discount amount
 * @returns {{subtotal: number, taxAmount: number, totalAmount: number}} Calculated amounts
 */
const calculateInvoiceTotals = (items, taxRate = 0, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount - discount;
  
  return {
    subtotal,
    taxAmount,
    totalAmount: Math.max(0, totalAmount)
  };
};

/**
 * Billing provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Billing context provider
 */
export const BillingProvider = ({ children }) => {
  const [invoices, setInvoices] = useState(loadInvoices());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Current invoice being created/edited
  const [currentInvoice, setCurrentInvoice] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [],
    taxRate: 18,
    discount: 0,
    notes: '',
    dueDate: '',
    paymentMethod: '',
    shippingAddress: '',
    terms: 'Payment due within 7 days'
  });

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (error) {
      console.error('Error saving invoices to localStorage:', error);
      setError('Failed to save invoices to local storage');
    }
  }, [invoices]);

  /**
   * Generate a new invoice number based on current date and existing invoices
   * @returns {string} Formatted invoice number (e.g., INV-202412-0001)
   */
  const generateInvoiceNumber = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Count invoices from the current month
    const count = invoices.filter(invoice => {
      const invDate = new Date(invoice.createdAt || invoice.createdDate);
      return invDate.getFullYear() === year && 
             (invDate.getMonth() + 1) === parseInt(month);
    }).length + 1;
    
    return `INV-${year}${month}-${String(count).padStart(4, '0')}`;
  }, [invoices]);

  /**
   * Add an item to the current invoice
   * @param {Object} product - Product to add
   * @param {string} product.id - Product ID
   * @param {string} product.name - Product name
   * @param {number} quantity - Quantity to add
   * @param {number} price - Price per unit
   */
  const addItemToInvoice = useCallback((product, quantity, price) => {
    const newItem = {
      id: product.id || uuidv4(),
      name: product.name,
      quantity: Math.max(1, parseInt(quantity, 10) || 1),
      price: Math.max(0, parseFloat(price) || 0),
      total: 0
    };
    
    newItem.total = newItem.quantity * newItem.price;

    setCurrentInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  }, []);

  /**
   * Remove an item from the current invoice
   * @param {string} itemId - ID of the item to remove
   */
  const removeItemFromInvoice = useCallback((itemId) => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  }, []);

  /**
   * Update an item in the current invoice
   * @param {string} itemId - ID of the item to update
   * @param {number} quantity - New quantity
   * @param {number} price - New price per unit
   */
  const updateItemInInvoice = useCallback((itemId, quantity, price) => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: Math.max(1, parseInt(quantity, 10) || 1), 
              price: Math.max(0, parseFloat(price) || 0),
              total: 0
            }
          : item
      ).map(item => ({
        ...item,
        total: item.quantity * item.price
      }))
    }));
  }, []);

  /**
   * Create a new invoice
   * @param {Partial<Invoice>} invoiceData - Invoice data
   * @returns {Invoice} The created invoice
   */
  const createInvoice = useCallback((invoiceData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate totals
      const { subtotal, taxAmount, totalAmount } = calculateInvoiceTotals(
        invoiceData.items || [],
        invoiceData.taxRate || 0,
        invoiceData.discount || 0
      );

      const now = new Date();
      const dueDate = invoiceData.dueDate || 
        new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const newInvoice = {
        id: `inv_${uuidv4()}`,
        invoiceNumber: generateInvoiceNumber(),
        customerName: invoiceData.customerName || '',
        customerEmail: invoiceData.customerEmail || '',
        customerPhone: invoiceData.customerPhone || '',
        customerAddress: invoiceData.customerAddress || '',
        items: invoiceData.items || [],
        subtotal,
        taxRate: invoiceData.taxRate || 0,
        taxAmount,
        discount: invoiceData.discount || 0,
        totalAmount,
        status: 'pending',
        createdDate: now.toISOString().split('T')[0],
        dueDate,
        paidDate: null,
        notes: invoiceData.notes || '',
        orderId: invoiceData.orderId || null,
        paymentMethod: invoiceData.paymentMethod || '',
        paymentStatus: 'unpaid',
        shippingAddress: invoiceData.shippingAddress || invoiceData.customerAddress || '',
        billingAddress: invoiceData.billingAddress || invoiceData.customerAddress || '',
        terms: invoiceData.terms || 'Payment due within 7 days',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      setInvoices(prevInvoices => [newInvoice, ...prevInvoices]);
      return newInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('Failed to create invoice');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [generateInvoiceNumber]);

  /**
   * Get an invoice by ID
   * @param {string} id - Invoice ID
   * @returns {Invoice|null} The found invoice or null if not found
   */
  const getInvoiceById = useCallback((id) => {
    return invoices.find(invoice => invoice.id === id) || null;
  }, [invoices]);

  /**
   * Get invoices by order ID
   * @param {string} orderId - Order ID
   * @returns {Invoice[]} Array of matching invoices
   */
  const getInvoicesByOrderId = useCallback((orderId) => {
    return invoices.filter(invoice => invoice.orderId === orderId);
  }, [invoices]);

  /**
   * Update an invoice's status
   * @param {string} id - Invoice ID
   * @param {string} status - New status
   */
  const updateInvoiceStatus = useCallback((id, status) => {
    setInvoices(prevInvoices => 
      prevInvoices.map(invoice => {
        if (invoice.id !== id) return invoice;
        
        const updates = {
          status,
          updatedAt: new Date().toISOString()
        };
        
        // If marking as paid and not already paid
        if (status === 'paid' && invoice.paymentStatus !== 'paid') {
          updates.paymentStatus = 'paid';
          updates.paidDate = new Date().toISOString().split('T')[0];
        }
        
        return { ...invoice, ...updates };
      })
    );
  }, []);

  /**
   * Delete an invoice
   * @param {string} id - Invoice ID to delete
   */
  const deleteInvoice = useCallback((id) => {
    setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== id));
  }, []);

  /**
   * Get invoice statistics for the last 30 days
   * @returns {Object} Statistics object
   */
  const getInvoiceStats = useCallback(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const recentInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt || invoice.createdDate);
      return invoiceDate >= thirtyDaysAgo;
    });
    
    const totalAmount = recentInvoices.reduce(
      (sum, invoice) => sum + (invoice.totalAmount || 0), 0
    );
    
    const paidInvoices = recentInvoices.filter(
      invoice => invoice.status === 'paid' || invoice.paymentStatus === 'paid'
    ).length;
    
    const pendingInvoices = recentInvoices.filter(
      invoice => invoice.status === 'pending' || invoice.paymentStatus === 'pending'
    ).length;
    
    return {
      totalInvoices: recentInvoices.length,
      totalAmount,
      paidInvoices,
      pendingInvoices,
      averageInvoice: recentInvoices.length > 0 
        ? totalAmount / recentInvoices.length 
        : 0
    };
  }, [invoices]);

  /**
   * Generate a PDF for an invoice (placeholder implementation)
   * @param {Invoice} invoice - Invoice to generate PDF for
   * @returns {Promise<Blob>} PDF blob
   */
  const generateInvoicePDF = useCallback(async (invoice) => {
    setIsLoading(true);
    try {
      // This is a placeholder - implement actual PDF generation
      // For example, using a library like jspdf or pdfkit
      console.log('Generating PDF for invoice:', invoice.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return a dummy PDF blob
      return new Blob(
        [JSON.stringify(invoice, null, 2)], 
        { type: 'application/pdf' }
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Context value
  const value = {
    // State
    invoices,
    currentInvoice,
    isLoading,
    error,
    
    // Actions
    createInvoice,
    getInvoiceById,
    getInvoicesByOrderId,
    updateInvoiceStatus,
    deleteInvoice,
    getInvoiceStats,
    generateInvoicePDF,
    
    // Current invoice management
    setCurrentInvoice,
    addItemToInvoice,
    removeItemFromInvoice,
    updateItemInInvoice,
    calculateInvoiceTotals
  };

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
};

export default BillingContext;
