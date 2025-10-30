import { useState } from "react";
import { useInventory } from "../../contexts/InventoryContext";
import { useExpiryMonitor } from "../../hooks/useExpiryMonitor";
import { useAuth } from "../../contexts/AuthContext";
import RoleGuard from "../RoleGuard";
import "../styles/global.css";

const categories = [
  "Electronics",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Grains",
  "Meat",
  "Beverages",
];

const units = ["kg", "liters", "packets", "pieces", "dozen", "loaves", "cups", "containers", "bottles", "cans", "boxes"];

const Products = () => {
  const { hasPermission, isAdmin, user } = useAuth();
  
  // Use global inventory context with safe defaults
  const { 
    products = [], 
    settings = {}, 
    getLowStockProducts = () => [], 
    getCriticalStockProducts = () => [],
    getExpiringProducts = () => [],
    getCriticalExpiryProducts = () => [],
    getExpiredProducts = () => [],
    getDaysUntilExpiry = () => 0,
    addProduct = () => {}, 
    updateProduct = () => {}, 
    deleteProduct = () => {} 
  } = useInventory() || {};

  // Debug: Log products count
  console.log('Products page - products count:', products.length);

  // Enable expiry monitoring
  const { getExpiryStatus = () => ({ status: 'normal', daysUntilExpiry: 0 }), getExpiryStatusClass = () => 'expiry-normal' } = useExpiryMonitor(products, settings) || {};

  // Function to get stock status class
  const getStockStatusClass = (product) => {
    const stock = parseInt(product.stock);
    const threshold = settings.lowStockThreshold || 10; // Default threshold
    const criticalThreshold = Math.floor(threshold / 2);
    
    if (stock <= criticalThreshold) return 'stock-critical';
    if (stock <= threshold) return 'stock-low';
    return 'stock-normal';
  };

  const [form, setForm] = useState({
    name: "",
    category: "",
    stock: "",
    unit: "",
    expiryDate: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ Handle input change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Add / Update product
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.stock || !form.unit) return;

    if (editingId) {
      updateProduct(editingId, {
        name: form.name,
        category: form.category,
        stock: form.stock,
        unit: form.unit,
        expiryDate: form.expiryDate || null
      });
      setEditingId(null);
    } else {
      addProduct({
        name: form.name,
        category: form.category,
        stock: form.stock,
        unit: form.unit,
        expiryDate: form.expiryDate || null,
      });
    }
    setForm({ name: "", category: "", stock: "", unit: "", expiryDate: "" });
  };

  // ✅ Edit product
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      stock: product.stock,
      unit: product.unit,
      expiryDate: product.expiryDate || "",
    });
    setEditingId(product.id);
  };

  // ✅ Delete product
  const handleDelete = (id) => deleteProduct(id);

  // ✅ Update stock only (for staff users)
  const handleStockUpdate = (product) => {
    const newStock = prompt(`Update stock for ${product.name}:`, product.stock);
    if (newStock !== null && newStock !== "" && !isNaN(newStock)) {
      updateProduct(product.id, {
        ...product,
        stock: parseInt(newStock)
      });
    }
  };

  // ✅ Search filter with low stock and expiry filtering
  const filteredProducts = products.filter((p) => {
    const threshold = settings.lowStockThreshold || 10; // Default threshold
    
    // Handle special filters
    if (search === "low-stock-filter") {
      return parseInt(p.stock) <= threshold;
    }
    if (search === "critical-stock-filter") {
      return parseInt(p.stock) <= Math.floor(threshold / 2);
    }
    if (search === "expiring-filter") {
      return getExpiringProducts().some(ep => ep.id === p.id);
    }
    if (search === "critical-expiry-filter") {
      return getCriticalExpiryProducts().some(ep => ep.id === p.id);
    }
    if (search === "expired-filter") {
      return getExpiredProducts().some(ep => ep.id === p.id);
    }
    
    // Regular search
    if (search === "") return true;
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  // ✅ Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📦 Product Management</h1>
        <p>Manage your inventory products and stock levels</p>
      </div>

      {/* User Role Display */}
      <div className="role-display">
        <span className="user-info">Logged in as: <strong>{user?.name}</strong> ({user?.role})</span>
        {hasPermission("products_view") && !hasPermission("products_full") && (
          <span className="access-level">View Only Access - Can Update Stock</span>
        )}
      </div>

      {/* ✅ Product Form (Only Admin can add/edit products) */}
      <RoleGuard permission="products_full">
        <form className="product-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
          />
          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
          >
            <option value="">Select Unit</option>
            {units.map((u, i) => (
              <option key={i} value={u}>
                {u}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="expiryDate"
            placeholder="Expiry Date (Optional)"
            value={form.expiryDate}
            onChange={handleChange}
            title="Leave empty for non-perishable items"
          />
          <button type="submit">
            {editingId ? "Update" : "Add"} Product
          </button>
        </form>
      </RoleGuard>

      {/* ✅ Search and Filters */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Stock and Expiry Filters */}
      <div className="filter">
        <label>Stock Filters:</label>
        <button 
          onClick={() => setSearch("")}
          className={search === "" ? "active" : ""}
        >
          All Products
        </button>
        <button 
          onClick={() => {
            setSearch("low-stock-filter");
            setCurrentPage(1);
          }}
          className={search === "low-stock-filter" ? "active" : ""}
        >
          Low Stock ({getLowStockProducts().length})
        </button>
        <button 
          onClick={() => {
            setSearch("critical-stock-filter");
            setCurrentPage(1);
          }}
          className={search === "critical-stock-filter" ? "active" : ""}
        >
          Critical Stock ({getCriticalStockProducts().length})
        </button>
      </div>

      {/* Expiry Filters */}
      <div className="filter">
        <label>Expiry Filters:</label>
        <button 
          onClick={() => {
            setSearch("expiring-filter");
            setCurrentPage(1);
          }}
          className={search === "expiring-filter" ? "active" : ""}
        >
          ⚠️ Expiring Soon ({getExpiringProducts().length})
        </button>
        <button 
          onClick={() => {
            setSearch("critical-expiry-filter");
            setCurrentPage(1);
          }}
          className={search === "critical-expiry-filter" ? "active" : ""}
        >
          🚨 Critical Expiry ({getCriticalExpiryProducts().length})
        </button>
        <button 
          onClick={() => {
            setSearch("expired-filter");
            setCurrentPage(1);
          }}
          className={search === "expired-filter" ? "active" : ""}
        >
          💀 Expired ({getExpiredProducts().length})
        </button>
      </div>

      {/* ✅ Product Table */}
      <table className="products-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Unit</th>
            <th>Expiry Date</th>
            <th>Expiry Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((p) => {
              const expiryStatus = getExpiryStatus(p);
              const daysUntilExpiry = getDaysUntilExpiry(p.expiryDate);
              
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td className={getStockStatusClass(p)}>
                    {p.stock}
                    {parseInt(p.stock) <= (settings.lowStockThreshold || 10) && (
                      <span style={{marginLeft: '0.5rem', fontSize: '0.8rem'}}>
                        {parseInt(p.stock) <= Math.floor((settings.lowStockThreshold || 10) / 2) ? '🚨' : '⚠️'}
                      </span>
                    )}
                  </td>
                  <td>{p.unit}</td>
                  <td>
                    {p.expiryDate ? (
                      <span className={getExpiryStatusClass(p)}>
                        {new Date(p.expiryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span style={{color: '#666', fontStyle: 'italic'}}>No expiry</span>
                    )}
                  </td>
                  <td className={getExpiryStatusClass(p)}>
                    {p.expiryDate ? (
                      <>
                        {expiryStatus.status === 'expired' && (
                          <span>💀 Expired ({Math.abs(daysUntilExpiry)} days ago)</span>
                        )}
                        {expiryStatus.status === 'critical' && (
                          <span>🚨 Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}</span>
                        )}
                        {expiryStatus.status === 'warning' && (
                          <span>⚠️ Expires in {daysUntilExpiry} days</span>
                        )}
                        {expiryStatus.status === 'normal' && (
                          <span>✅ {daysUntilExpiry} days left</span>
                        )}
                      </>
                    ) : (
                      <span style={{color: '#666'}}>N/A</span>
                    )}
                  </td>
                  <td>
                    <RoleGuard permission="products_full">
                      <button onClick={() => handleEdit(p)}>✏️ Edit</button>
                      <button onClick={() => handleDelete(p.id)}>🗑️ Delete</button>
                    </RoleGuard>
                    <RoleGuard permission="products_update_stock">
                      <button onClick={() => handleStockUpdate(p)}>📊 Update Stock</button>
                    </RoleGuard>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            ◀ Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
