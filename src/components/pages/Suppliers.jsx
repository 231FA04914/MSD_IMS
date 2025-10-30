import { useState, useEffect } from "react";
import "../styles/global.css";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    // Load suppliers from localStorage (includes approved applications)
    const storedSuppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
    
    // If no suppliers in localStorage, add default ones
    if (storedSuppliers.length === 0) {
      const defaultSuppliers = [
        { id: 1, name: "ABC Traders", contact: "9876543210", email: "abc@gmail.com", status: "active" },
        { id: 2, name: "XYZ Suppliers", contact: "9123456789", email: "xyz@yahoo.com", status: "active" },
      ];
      localStorage.setItem('suppliers', JSON.stringify(defaultSuppliers));
      setSuppliers(defaultSuppliers);
    } else {
      setSuppliers(storedSuppliers);
    }
  };

  const [form, setForm] = useState({ name: "", contact: "", email: "" });
  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.contact || !form.email) return;

    let updatedSuppliers;
    if (editingId) {
      updatedSuppliers = suppliers.map((s) =>
        s.id === editingId ? { ...s, ...form, id: editingId } : s
      );
      setEditingId(null);
    } else {
      const newSupplier = { 
        id: Date.now(), 
        ...form, 
        status: "active",
        addedDate: new Date().toISOString(),
        addedBy: "Admin"
      };
      updatedSuppliers = [...suppliers, newSupplier];
    }
    
    setSuppliers(updatedSuppliers);
    localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
    setForm({ name: "", contact: "", email: "" });
  };

  const handleEdit = (s) => {
    setForm({ name: s.name, contact: s.contact, email: s.email });
    setEditingId(s.id);
  };

  const handleDelete = (id) => {
    const updatedSuppliers = suppliers.filter((s) => s.id !== id);
    setSuppliers(updatedSuppliers);
    localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🏢 Supplier Management</h1>
        <p>Manage your suppliers and their contact information</p>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Supplier Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="contact"
          placeholder="Contact Number"
          value={form.contact}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <button type="submit">
          {editingId ? "Update Supplier" : "Add Supplier"}
        </button>
      </form>

      <div className="table-section">
        <h2>🏢 Suppliers List</h2>
        <div className="table-container">
          <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.contact}</td>
              <td>{s.email}</td>
              <td>
                <button onClick={() => handleEdit(s)}>✏️ Edit</button>
                <button onClick={() => handleDelete(s.id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
