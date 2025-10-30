import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency, getRupeesValue } from "../../utils/currency.js";
import "../styles/global.css";

// Helper function to format quantity with unit
const formatQuantityWithUnit = (quantity, unit) => {
  if (unit === 'kg') {
    return `${quantity} kg`;
  } else {
    return `${quantity}`;
  }
};

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const incrementQuantity = (item) => {
    const increment = item.unit === 'kg' ? 0.5 : 1;
    updateQuantity(item.id, item.quantity + increment);
  };

  const decrementQuantity = (item) => {
    const decrement = item.unit === 'kg' ? 0.5 : 1;
    updateQuantity(item.id, item.quantity - decrement);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (getRupeesValue(item.price) * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // For now, we'll create an order and redirect to orders page
    // In a real application, this would be a checkout process
    const order = {
      id: Date.now().toString(),
      customerEmail: user.email,
      customerName: user.name,
      items: cart,
      total: getTotalPrice(),
      status: 'pending',
      date: new Date().toISOString(),
      orderNumber: `ORD-${Date.now()}`
    };

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    console.log('Cart - Order created:', order);
    console.log('Cart - All orders after save:', orders);

    // Trigger custom event to notify other components about new order
    window.dispatchEvent(new CustomEvent('orderPlaced', { 
      detail: { order, timestamp: new Date().toISOString() } 
    }));

    // Clear cart
    setCart([]);
    localStorage.setItem('cart', JSON.stringify([]));

    alert(`Order placed successfully! Order #${order.orderNumber} has been submitted and will appear in admin/staff order management.`);
    navigate('/my-orders');
  };

  const navigateToProducts = () => {
    navigate("/customer-products");
  };

  const navigateToDashboard = () => {
    navigate("/customer-products");
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page empty-cart">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <div className="header-actions">
            <button className="products-btn" onClick={navigateToProducts}>
              🛍️ Browse Products
            </button>
            <button className="dashboard-btn" onClick={navigateToDashboard}>
              🏠 Dashboard
            </button>
          </div>
        </div>
        
        <div className="empty-cart-content">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products to your cart to get started!</p>
          <button className="browse-products-btn" onClick={navigateToProducts}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Header */}
      <div className="cart-header">
        <h1>Shopping Cart ({getTotalItems()} items)</h1>
        <div className="header-actions">
          <button className="products-btn" onClick={navigateToProducts}>
            🛍️ Continue Shopping
          </button>
          <button className="dashboard-btn" onClick={navigateToDashboard}>
            🏠 Dashboard
          </button>
        </div>
      </div>

      <div className="cart-content">
        {/* Cart Items */}
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="item-placeholder">📦</div>
                )}
              </div>
              
              <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-price">{formatCurrency(item.price)} each</p>
              </div>
              
              <div className="item-quantity">
                <button
                  className="quantity-btn"
                  onClick={() => decrementQuantity(item)}
                >
                  -
                </button>
                <span className="quantity-display">{formatQuantityWithUnit(item.quantity, item.unit)}</span>
                <button
                  className="quantity-btn"
                  onClick={() => incrementQuantity(item)}
                >
                  +
                </button>
              </div>
              
              <div className="item-total">
                ₹{(getRupeesValue(item.price) * item.quantity).toLocaleString('en-IN')}
              </div>
              
              <div className="item-actions">
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          
          <div className="summary-row">
            <span>Subtotal ({getTotalItems()} items)</span>
            <span>₹{getTotalPrice().toLocaleString('en-IN')}</span>
          </div>
          
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          
          <div className="summary-row">
            <span>Tax</span>
            <span>₹0</span>
          </div>
          
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{getTotalPrice().toLocaleString('en-IN')}</span>
          </div>
          
          <button
            className="checkout-btn"
            onClick={proceedToCheckout}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
          
          <button
            className="continue-shopping-btn"
            onClick={navigateToProducts}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
