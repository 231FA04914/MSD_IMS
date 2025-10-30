// Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import "./styles/global.css";


const Navbar = () => {
  const { user, logout, isAdmin, hasPermission } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      {/* Left side - Logo */}
      <div className="logo">📦 Inventory</div>

      {/* Center - Navigation Links */}
      <ul className="nav-links">
        <li><Link to="/dashboard">Dashboard</Link></li>

        {hasPermission("products_full") && (
          <li><Link to="/products">Products</Link></li>
        )}

        {hasPermission("products_view") && !hasPermission("products_full") && !isAdmin && user?.role !== 'Customer' && (
          <li><Link to="/products">Products (View)</Link></li>
        )}

        {hasPermission("suppliers_full") && (
          <li><Link to="/suppliers">Suppliers</Link></li>
        )}

        <li><Link to="/orders">Orders</Link></li>
        <li><Link to="/reports">Reports</Link></li>

        {hasPermission("inventory_full") && (
          <li><Link to="/transactions">Transactions</Link></li>
        )}

        {isAdmin && (
          <>
            <li><Link to="/users">User Management</Link></li>
            <li><Link to="/settings">Settings</Link></li>
          </>
        )}
      </ul>

      {/* Right side - User Info + Logout */}
      <div className="user-section">
        {user && (
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">({user?.role})</span>
          </div>
        )}
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
