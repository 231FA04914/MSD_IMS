import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "../../contexts/InventoryContext";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { formatCurrency } from "../../utils/currency";
import "../styles/global.css";

const CustomerProducts = () => {
  const navigate = useNavigate();
  const { products = [] } = useInventory();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [quantities, setQuantities] = useState({});

  // Get unique categories from products
  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  // Get quantity options based on category
  const getQuantityOptions = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower === 'electronics') {
      return [
        { value: 1, label: '1 piece' },
        { value: 2, label: '2 pieces' },
        { value: 3, label: '3 pieces' },
        { value: 5, label: '5 pieces' },
        { value: 10, label: '10 pieces' }
      ];
    } else if (categoryLower === 'fruits') {
      return [
        { value: 0.5, label: '0.5 dozen (6 pieces)' },
        { value: 1, label: '1 dozen (12 pieces)' },
        { value: 2, label: '2 dozens (24 pieces)' },
        { value: 3, label: '3 dozens (36 pieces)' },
        { value: 5, label: '5 dozens (60 pieces)' }
      ];
    } else if (categoryLower === 'vegetables') {
      return [
        { value: 0.25, label: '0.25 kg (250g)' },
        { value: 0.5, label: '0.5 kg (500g)' },
        { value: 1, label: '1 kg' },
        { value: 2, label: '2 kg' },
        { value: 5, label: '5 kg' },
        { value: 10, label: '10 kg' }
      ];
    } else if (categoryLower === 'dairy') {
      return [
        { value: 0.5, label: '0.5 liter' },
        { value: 1, label: '1 liter' },
        { value: 2, label: '2 liters' },
        { value: 5, label: '5 liters' }
      ];
    } else if (categoryLower === 'bakery') {
      return [
        { value: 1, label: '1 piece' },
        { value: 2, label: '2 pieces' },
        { value: 5, label: '5 pieces' },
        { value: 10, label: '10 pieces' }
      ];
    } else if (categoryLower === 'grains') {
      return [
        { value: 1, label: '1 kg' },
        { value: 2, label: '2 kg' },
        { value: 5, label: '5 kg' },
        { value: 10, label: '10 kg' },
        { value: 25, label: '25 kg' }
      ];
    } else if (categoryLower === 'meat') {
      return [
        { value: 0.25, label: '0.25 kg (250g)' },
        { value: 0.5, label: '0.5 kg (500g)' },
        { value: 1, label: '1 kg' },
        { value: 2, label: '2 kg' }
      ];
    } else if (categoryLower === 'beverages') {
      return [
        { value: 1, label: '1 bottle/can' },
        { value: 6, label: '6 pack' },
        { value: 12, label: '12 pack' },
        { value: 24, label: '24 pack' }
      ];
    } else {
      // Default for other categories
      return [
        { value: 1, label: '1 unit' },
        { value: 2, label: '2 units' },
        { value: 3, label: '3 units' },
        { value: 5, label: '5 units' },
        { value: 10, label: '10 units' }
      ];
    }
  };

  // Initialize quantity for a product
  const getProductQuantity = (productId, category) => {
    if (!quantities[productId]) {
      const options = getQuantityOptions(category);
      return options[0].value;
    }
    return quantities[productId];
  };

  // Handle quantity change
  const handleQuantityChange = (productId, value) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: parseFloat(value)
    }));
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const inStock = parseInt(product.stock) > 0;
      return matchesSearch && matchesCategory && inStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "stock":
          return parseInt(b.stock) - parseInt(a.stock);
        default:
          return 0;
      }
    });

  const addToCart = (product) => {
    const quantity = getProductQuantity(product.id, product.category);
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showAlert(`Added ${quantity} ${product.unit || 'units'} to cart!`, 'success');
  };

  return (
    <div className="customer-products-page">
      <div className="products-header">
        <div className="header-content">
          <h1>Browse Products</h1>
          <p>Welcome, {user?.name || 'Customer'}! Explore our available products.</p>
        </div>
        <button className="cart-btn" onClick={() => navigate('/cart')}>
          🛒 View Cart
        </button>
      </div>

      <div className="products-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Category:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name (A-Z)</option>
            <option value="price-low">Price (Low to High)</option>
            <option value="price-high">Price (High to Low)</option>
            <option value="stock">Stock Level</option>
          </select>
        </div>
      </div>

      <div className="products-count">
        Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="product-placeholder">📦</div>
                )}
              </div>
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h3 className="product-name">{product.name}</h3>
                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}
                <div className="product-price">{formatCurrency(product.price)}</div>
                <div className="product-meta">
                  <span className="product-stock in-stock">
                    ✓ In Stock ({product.stock} {product.unit || 'units'})
                  </span>
                </div>
              </div>
              <div className="product-actions">
                <div className="quantity-selector">
                  <label htmlFor={`quantity-${product.id}`}>Select Quantity:</label>
                  <select
                    id={`quantity-${product.id}`}
                    value={getProductQuantity(product.id, product.category)}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="quantity-select"
                  >
                    {getQuantityOptions(product.category).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerProducts;
