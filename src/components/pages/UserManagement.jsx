import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useAlert } from "../../contexts/AlertContext.jsx";
import "../styles/global.css";

const UserManagement = () => {
  const { hasPermission } = useAuth();
  const { showAlert } = useAlert();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "staff",
    status: "Active"
  });
  const [editingId, setEditingId] = useState(null);

  // Load users from localStorage on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      // Load registered users from signup
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Load manually added users from user management
      const managedUsers = JSON.parse(localStorage.getItem('managedUsers') || '[]');
      
      // Default system users
      const defaultUsers = [
        { 
          id: 'admin-default', 
          name: "System Admin", 
          email: "admin@inventory.com", 
          role: "admin", 
          status: "Active",
          lastLogin: "2025-10-07",
          createdAt: "2025-01-01T00:00:00.000Z",
          source: "system"
        },
        { 
          id: 'staff-default', 
          name: "System Staff", 
          email: "staff@inventory.com", 
          role: "staff", 
          status: "Active",
          lastLogin: "2025-10-06",
          createdAt: "2025-01-01T00:00:00.000Z",
          source: "system"
        }
      ];

      // Format registered users
      const formattedRegisteredUsers = registeredUsers.map(user => ({
        ...user,
        status: user.status || "Active",
        lastLogin: user.lastLogin || "Never",
        source: "signup"
      }));

      // Format managed users
      const formattedManagedUsers = managedUsers.map(user => ({
        ...user,
        source: "manual"
      }));

      // Combine all users
      const allUsers = [...defaultUsers, ...formattedRegisteredUsers, ...formattedManagedUsers];
      
      // Remove duplicates based on email
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.email === user.email)
      );

      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      showAlert('error', 'Error loading users data');
    }
  };

  // Redirect if user doesn't have permission to view users
  if (!hasPermission('view_users')) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>🚫 Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    try {
      const managedUsers = JSON.parse(localStorage.getItem('managedUsers') || '[]');

      if (editingId) {
        // Update existing user
        const updatedManagedUsers = managedUsers.map(u => 
          u.id === editingId 
            ? { ...u, ...form, id: editingId }
            : u
        );
        localStorage.setItem('managedUsers', JSON.stringify(updatedManagedUsers));
        setEditingId(null);
        showAlert('success', 'User updated successfully!');
      } else {
        // Check if email already exists
        const allUsers = [...users];
        if (allUsers.some(u => u.email === form.email)) {
          showAlert('error', 'A user with this email already exists!');
          return;
        }

        // Add new user
        const newUser = { 
          id: Date.now(), 
          ...form, 
          lastLogin: "Never",
          createdAt: new Date().toISOString(),
          source: "manual"
        };
        managedUsers.push(newUser);
        localStorage.setItem('managedUsers', JSON.stringify(managedUsers));
        showAlert('success', 'User added successfully!');
      }
      
      setForm({ name: "", email: "", role: "staff", status: "Active" });
      loadUsers(); // Reload users from localStorage
    } catch (error) {
      console.error('Error saving user:', error);
      showAlert('error', 'Error saving user data');
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setEditingId(user.id);
  };

  const handleDelete = (id) => {
    const userToDelete = users.find(u => u.id === id);
    
    if (userToDelete?.source === 'system') {
      showAlert('error', 'Cannot delete system users!');
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        if (userToDelete?.source === 'manual') {
          // Delete from managed users
          const managedUsers = JSON.parse(localStorage.getItem('managedUsers') || '[]');
          const updatedManagedUsers = managedUsers.filter(u => u.id !== id);
          localStorage.setItem('managedUsers', JSON.stringify(updatedManagedUsers));
        } else if (userToDelete?.source === 'signup') {
          // Delete from registered users
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const updatedRegisteredUsers = registeredUsers.filter(u => u.id !== id);
          localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
        }
        
        loadUsers(); // Reload users
        showAlert('success', 'User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('error', 'Error deleting user');
      }
    }
  };

  const toggleStatus = (id) => {
    const userToUpdate = users.find(u => u.id === id);
    
    if (userToUpdate?.source === 'system') {
      showAlert('error', 'Cannot modify system users!');
      return;
    }

    try {
      const newStatus = userToUpdate.status === "Active" ? "Inactive" : "Active";
      
      if (userToUpdate?.source === 'manual') {
        // Update managed users
        const managedUsers = JSON.parse(localStorage.getItem('managedUsers') || '[]');
        const updatedManagedUsers = managedUsers.map(u => 
          u.id === id ? { ...u, status: newStatus } : u
        );
        localStorage.setItem('managedUsers', JSON.stringify(updatedManagedUsers));
      } else if (userToUpdate?.source === 'signup') {
        // Update registered users
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const updatedRegisteredUsers = registeredUsers.map(u => 
          u.id === id ? { ...u, status: newStatus } : u
        );
        localStorage.setItem('registeredUsers', JSON.stringify(updatedRegisteredUsers));
      }
      
      loadUsers(); // Reload users
      showAlert('success', `User ${newStatus.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      showAlert('error', 'Error updating user status');
    }
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter || user.status.toLowerCase() === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Never") return "Never";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getSourceBadge = (source) => {
    const badges = {
      system: { text: 'System', class: 'source-system' },
      signup: { text: 'Signup', class: 'source-signup' },
      manual: { text: 'Manual', class: 'source-manual' }
    };
    const badge = badges[source] || { text: 'Unknown', class: 'source-unknown' };
    return <span className={`source-badge ${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👥 User Management</h1>
        <p>Manage system users and their permissions</p>
      </div>
      
      <div className="content-grid">
        <div className="summary-card">
          <h3>📊 Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className="summary-card">
          <h3>✅ Active Users</h3>
          <p>{users.filter(u => u.status === "Active").length}</p>
        </div>
        <div className="summary-card">
          <h3>👑 Admin Users</h3>
          <p>{users.filter(u => u.role === "admin").length}</p>
        </div>
        <div className="summary-card">
          <h3>👤 Customers</h3>
          <p>{users.filter(u => u.role === "customer").length}</p>
        </div>
        <div className="summary-card">
          <h3>📝 From Signup</h3>
          <p>{users.filter(u => u.source === "signup").length}</p>
        </div>
        <div className="summary-card">
          <h3>⚙️ System Users</h3>
          <p>{users.filter(u => u.source === "system").length}</p>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="filter-section">
        <div className="filter-controls">
          <div className="filter-group">
            <label>Filter by:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Users</option>
              <option value="admin">Admins</option>
              <option value="staff">Staff</option>
              <option value="customer">Customers</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="search-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
        </select>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button type="submit">
          {editingId ? "Update User" : "Add User"}
        </button>
      </form>

      <div className="table-section">
        <h2>👥 Users List ({filteredUsers.length} of {users.length})</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Source</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    {searchTerm || filter !== 'all' ? 'No users match your search criteria' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role === 'admin' ? '👑 Admin' : 
                         user.role === 'staff' ? '👨‍💼 Staff' : 
                         '👤 Customer'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{getSourceBadge(user.source)}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>{formatDate(user.lastLogin)}</td>
                    <td>
                      {user.source !== 'system' && (
                        <>
                          <button 
                            onClick={() => handleEdit(user)}
                            className="btn btn-sm"
                            title="Edit user"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => toggleStatus(user.id)}
                            className="btn btn-sm"
                            title={user.status === "Active" ? "Deactivate user" : "Activate user"}
                          >
                            {user.status === "Active" ? "🚫 Deactivate" : "✅ Activate"}
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="btn btn-sm btn-error"
                            title="Delete user"
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                      {user.source === 'system' && (
                        <span className="system-user-note">System User</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
