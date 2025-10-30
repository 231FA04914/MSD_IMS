import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';

const BillingContext = createContext();

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error("useBilling must be used within a BillingProvider");
  }
  return context;
};

// Load invoices from localStorage on initial load
const loadInvoices = () => {
  try {
    const savedInvoices = localStorage.getItem('invoices');
    return savedInvoices ? JSON.parse(savedInvoices) : [];
  } catch (error) {
    console.error('Error loading invoices:', error);
    return [];
  }
};

export const BillingProvider = ({ children }) => {
  const [invoices, setInvoices] = useState(loadInvoices());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentInvoice, setCurrentInvoice] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    items: [],
    taxRate: 18,
    discount: 0,
    notes: "",
    dueDate: ""
  });

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (error) {
      console.error('Error saving invoices:', error);
      setError('Failed to save invoices');
    }
  }, [invoices]);

  // Generate a new invoice number
  const generateInvoiceNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const existingNumbers = invoices
      .map(inv => inv.invoiceNumber)
      .filter(num => num && num.startsWith(`INV-${year}-`))
      .map(num => {
        const parts = num.split('-');
        return parseInt(parts[parts.length - 1]);
      })
      .filter(num => !isNaN(num));
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `INV-${year}-${String(nextNumber).padStart(3, '0')}`;
  }, [invoices]);

  // Calculate invoice totals
  const calculateInvoiceTotals = useCallback((items, taxRate = 18, discount = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount - discount;
    
    return {
      subtotal,
      taxAmount,
      totalAmount: Math.max(0, totalAmount)
    };
  }, []);

  // Add item to current invoice
  const addItemToInvoice = useCallback((product, quantity, price) => {
    const newItem = {
      id: product.id,
      name: product.name,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      total: parseInt(quantity) * parseFloat(price)
    };

    setCurrentInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  }, []);

  // Remove item from current invoice
  const removeItemFromInvoice = useCallback((itemId) => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  }, []);

  // Update item in current invoice
  const updateItemInInvoice = useCallback((itemId, quantity, price) => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: parseInt(quantity), 
              price: parseFloat(price), 
              total: parseInt(quantity) * parseFloat(price) 
            }
          : item
      )
    }));
  }, []);

  // Create a new invoice
  const createInvoice = useCallback(async (invoiceData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const invoiceNumber = generateInvoiceNumber();
      const totals = calculateInvoiceTotals(
        invoiceData.items, 
        invoiceData.taxRate, 
        invoiceData.discount
      );
      
      const newInvoice = {
        id: `inv_${uuidv4()}`,
        invoiceNumber,
        customerName: invoiceData.customerName || '',
        customerEmail: invoiceData.customerEmail || '',
        customerPhone: invoiceData.customerPhone || '',
        customerAddress: invoiceData.customerAddress || '',
        items: invoiceData.items || [],
        ...totals,
        taxRate: invoiceData.taxRate || 18,
        discount: invoiceData.discount || 0,
        status: 'pending',
        createdDate: new Date().toISOString().split('T')[0],
        dueDate: invoiceData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paidDate: null,
        notes: invoiceData.notes || '',
        orderId: invoiceData.orderId || null,
        paymentMethod: invoiceData.paymentMethod || '',
        paymentStatus: 'unpaid',
        shippingAddress: invoiceData.shippingAddress || null,
        billingAddress: invoiceData.billingAddress || null,
        terms: invoiceData.terms || 'Payment due within 7 days',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setInvoices(prevInvoices => [newInvoice, ...prevInvoices]);
      
      // Reset current invoice
      setCurrentInvoice({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        items: [],
        taxRate: 18,
        discount: 0,
        notes: "",
        dueDate: ""
      });

      return newInvoice;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      setError('Failed to create invoice');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [generateInvoiceNumber, calculateInvoiceTotals]);

  // Get invoice by ID
  const getInvoiceById = useCallback((id) => {
    return invoices.find(invoice => invoice.id === id) || null;
  }, [invoices]);

  // Get invoices by order ID
  const getInvoicesByOrderId = useCallback((orderId) => {
    return invoices.filter(invoice => invoice.orderId === orderId);
  }, [invoices]);

  // Update invoice status
  const updateInvoiceStatus = useCallback((invoiceId, status) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === invoiceId 
          ? { 
              ...invoice, 
              status,
              updatedAt: new Date().toISOString(),
              ...(status === 'paid' && !invoice.paidDate 
                ? { 
                    paidDate: new Date().toISOString().split('T')[0],
                    paymentStatus: 'paid'
                  } 
                : {})
            } 
          : invoice
      )
    );
  }, []);

  // Delete invoice
  const deleteInvoice = useCallback((invoiceId) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
  }, []);

  // Generate PDF invoice
  const generateInvoicePDF = useCallback(async (invoice) => {
    setIsLoading(true);
    try {
      // In a real implementation, you would call a PDF generation service
      // For now, we'll return a mock blob
      return new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/pdf' });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      setError('Failed to generate PDF');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get invoice statistics
  const getInvoiceStats = useCallback(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const recentInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
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
    
    const overdueInvoices = recentInvoices.filter(invoice => {
      if (invoice.status !== 'pending') return false;
      const dueDate = new Date(invoice.dueDate);
      return dueDate < now;
    }).length;

    return {
      totalInvoices: recentInvoices.length,
      totalAmount,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      averageInvoice: recentInvoices.length > 0 
        ? totalAmount / recentInvoices.length 
        : 0
    };
  }, [invoices]);

  // Context value
  const value = {
    // State
    invoices,
    currentInvoice,
    isLoading,
    error,
    
    // Actions
    setCurrentInvoice,
    addItemToInvoice,
    removeItemFromInvoice,
    updateItemInInvoice,
    createInvoice,
    getInvoiceById,
    getInvoicesByOrderId,
    updateInvoiceStatus,
    deleteInvoice,
    generateInvoicePDF,
    
    // Utilities
    generateInvoiceNumber,
    calculateInvoiceTotals,
    getInvoiceStats
  };

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
};

export { BillingContext as default };
