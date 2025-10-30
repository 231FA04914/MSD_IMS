import { createContext, useContext, useState, useEffect } from "react";
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
  const generateInvoiceNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const count = invoices.filter(inv => {
      const invDate = new Date(inv.createdAt);
      return invDate.getFullYear() === year && 
             (invDate.getMonth() + 1) === parseInt(month);
    }).length + 1;
    
    return `INV-${year}${month}-${String(count).padStart(4, '0')}`;
  };

  // Create a new invoice
  const createInvoice = (invoiceData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newInvoice = {
        id: `inv_${uuidv4()}`,
        invoiceNumber: generateInvoiceNumber(),
        customerName: invoiceData.customerName || '',
        customerEmail: invoiceData.customerEmail || '',
        customerPhone: invoiceData.customerPhone || '',
        customerAddress: invoiceData.customerAddress || '',
        items: invoiceData.items || [],
        subtotal: invoiceData.subtotal || 0,
        taxRate: invoiceData.taxRate || 0,
        taxAmount: invoiceData.taxAmount || 0,
        discount: invoiceData.discount || 0,
        totalAmount: invoiceData.totalAmount || 0,
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
      return newInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('Failed to create invoice');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get invoice by ID
  const getInvoiceById = (id) => {
    return invoices.find(invoice => invoice.id === id) || null;
  };

  // Get invoices by order ID
  const getInvoicesByOrderId = (orderId) => {
    return invoices.filter(invoice => invoice.orderId === orderId);
  };

  // Update invoice status
  const updateInvoiceStatus = (id, status) => {
    setInvoices(prevInvoices => 
      prevInvoices.map(invoice => 
        invoice.id === id 
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
  };

  // Delete invoice
  const deleteInvoice = (id) => {
    setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice.id !== id));
  };

  // Get invoice statistics
  const getInvoiceStats = () => {
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
    
    return {
      totalInvoices: recentInvoices.length,
      totalAmount,
      paidInvoices,
      pendingInvoices,
      averageInvoice: recentInvoices.length > 0 
        ? totalAmount / recentInvoices.length 
        : 0
    };
  };

  // Context value
  const value = {
    invoices,
    isLoading,
    error,
    createInvoice,
    getInvoiceById,
    getInvoicesByOrderId,
    updateInvoiceStatus,
    deleteInvoice,
    getInvoiceStats
  };

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
};

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

  const [isLoading, setIsLoading] = useState(false);

  // Generate next invoice number
  const generateInvoiceNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const existingNumbers = invoices
      .map(inv => inv.invoiceNumber)
      .filter(num => num.startsWith(`INV-${year}-`))
      .map(num => parseInt(num.split('-')[2]))
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
          ? { ...item, quantity: parseInt(quantity), price: parseFloat(price), total: parseInt(quantity) * parseFloat(price) }
          : item
      )
    }));
  }, []);

  // Create new invoice
  const createInvoice = useCallback(async (invoiceData) => {
    setIsLoading(true);
    try {
      const invoiceNumber = generateInvoiceNumber();
      const totals = calculateInvoiceTotals(invoiceData.items, invoiceData.taxRate, invoiceData.discount);
      
      const newInvoice = {
        id: `INV-${Date.now()}`,
        invoiceNumber,
        ...invoiceData,
        ...totals,
        status: "pending",
        createdDate: new Date().toISOString().split('T')[0],
        paidDate: null
      };

      setInvoices(prev => [newInvoice, ...prev]);
      
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
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [generateInvoiceNumber, calculateInvoiceTotals]);

  // Update invoice status
  const updateInvoiceStatus = useCallback((invoiceId, status) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { 
            ...invoice, 
            status,
            paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : null
          }
        : invoice
    ));
  }, []);

  // Delete invoice
  const deleteInvoice = useCallback((invoiceId) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
  }, []);

  // Generate PDF invoice
  const generateInvoicePDF = useCallback(async (invoice) => {
    setIsLoading(true);
    try {
      const pdfBlob = await invoiceService.generatePDF(invoice);
      return pdfBlob;
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get invoice statistics
  const getInvoiceStats = useCallback(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
    const overdueInvoices = invoices.filter(inv => {
      if (inv.status !== 'pending') return false;
      const dueDate = new Date(inv.dueDate);
      const today = new Date();
      return dueDate < today;
    }).length;

    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const pendingAmount = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      pendingAmount
    };
  }, [invoices]);

  const value = {
    // State
    invoices,
    currentInvoice,
    isLoading,
    
    // Actions
    setCurrentInvoice,
    addItemToInvoice,
    removeItemFromInvoice,
    updateItemInInvoice,
    createInvoice,
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
