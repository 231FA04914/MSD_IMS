// Currency formatting utility
export const formatCurrency = (amount) => {
  // Convert dollar amount to rupees (assuming 1 USD = 83 INR approximately)
  const rupeesAmount = parseFloat(amount) * 83;
  
  // Format with Indian Rupee symbol and proper comma separation
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(rupeesAmount);
};

// Alternative simple formatting without conversion (if prices are already in rupees)
export const formatRupees = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(parseFloat(amount));
};

// Get numeric value in rupees
export const getRupeesValue = (dollarAmount) => {
  return parseFloat(dollarAmount) * 83;
};
