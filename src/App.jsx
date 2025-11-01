import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth, ROLES } from "./contexts/AuthContext.jsx";
import { AlertProvider } from "./contexts/AlertContext.jsx";
import { InventoryProvider } from "./contexts/InventoryContext.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { BillingProvider } from "./contexts/BillingContext.jsx";
// Initialize any necessary data when the app loads
import Layout from "./components/Layout.jsx";
import Alert from "./components/Alert.jsx";
import RoleGuard from "./components/RoleGuard.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
// import AdminDebug from "./components/AdminDebug.jsx"; // Temporarily removed
// Diagnostic tools removed for production stability
// import DebugInfo from "./components/DebugInfo.jsx";
// import PageDiagnostic from "./components/PageDiagnostic.jsx";
// import NavigationTest from "./components/NavigationTest.jsx";
import LandingPage from "./components/pages/LandingPage.jsx";
import SimpleSignup from "./components/SimpleSignup.jsx";
import Login from "./components/pages/Login.jsx";
import Dashboard from "./components/pages/Dashboard.jsx";
import Products from "./components/pages/Products.jsx";
import Suppliers from "./components/pages/Suppliers.jsx";
import Orders from "./components/pages/Orders.jsx";
import Reports from "./components/pages/Reports.jsx";
import Transactions from "./components/pages/Transactions.jsx";
import UserManagement from "./components/pages/UserManagement.jsx";
import Settings from "./components/pages/Settings.jsx";
import Billing from "./components/pages/Billing.jsx";
import Notifications from "./components/pages/Notifications.jsx";
import SupplierApplication from "./components/pages/SupplierApplication.jsx";
import SupplierApplications from "./components/pages/SupplierApplications.jsx";
import MyOrders from "./components/pages/MyOrders.jsx";
import Cart from "./components/pages/Cart.jsx";
import CustomerProfile from "./components/pages/CustomerProfile.jsx";
import CustomerProducts from "./components/pages/CustomerProducts.jsx";
import CommunicationLogs from "./components/pages/CommunicationLogs.jsx";
import About from "./components/pages/About.jsx";
import Contact from "./components/pages/Contact.jsx";
// All pages restored - complete admin interface

function App() {
  console.log("App component rendering...");
  const { user, hasPermission } = useAuth();
  console.log("App - user:", user, "hasPermission function:", typeof hasPermission);

  // Protected route wrapper
  const ProtectedRoute = ({ children, permission }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    if (permission) {
      // Handle array of permissions (user needs at least one)
      if (Array.isArray(permission)) {
        const hasAnyPermission = permission.some(perm => hasPermission(perm));
        if (!hasAnyPermission) {
          return <Navigate to="/dashboard" replace />;
        }
      } else {
        // Handle single permission
        if (!hasPermission(permission)) {
          return <Navigate to="/dashboard" replace />;
        }
      }
    }
    
    return <Layout>{children}</Layout>;
  };

  return (
    <AlertProvider>
      <InventoryProvider>
        <NotificationProvider>
          <BillingProvider>
          <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/supplier-application" element={<SupplierApplication />} />
      <Route path="/signup" element={<SimpleSignup />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes - ALL ADMIN PAGES RESTORED */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/products" element={
        <ProtectedRoute permission={["products_full", "products_view"]}>
          <Products />
        </ProtectedRoute>
      } />
      
      <Route path="/suppliers" element={
        <ProtectedRoute permission="suppliers_full">
          <Suppliers />
        </ProtectedRoute>
      } />
      
      <Route path="/orders" element={
        <ProtectedRoute permission={["orders_full", "orders_add_incoming"]}>
          <Orders />
        </ProtectedRoute>
      } />
      
      <Route path="/communication-logs" element={
        <ProtectedRoute permission="orders_full">
          <CommunicationLogs />
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute permission={["reports_full", "reports_basic"]}>
          <Reports />
        </ProtectedRoute>
      } />
      
      <Route path="/transactions" element={
        <ProtectedRoute permission="transactions_full">
          <Transactions />
        </ProtectedRoute>
      } />
      
      <Route path="/user-management" element={
        <ProtectedRoute permission="view_users">
          <UserManagement />
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute permission="settings_full">
          <Settings />
        </ProtectedRoute>
      } />
      
      <Route path="/billing" element={
        <ProtectedRoute permission="billing_full">
          <Billing />
        </ProtectedRoute>
      } />
      
      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      } />
      
      <Route path="/supplier-applications" element={
        <ProtectedRoute permission="users_full">
          <SupplierApplications />
        </ProtectedRoute>
      } />

      {/* Customer routes */}
      <Route path="/customer-dashboard" element={
        <Navigate to="/customer-products" replace />
      } />
      <Route path="/customer-products" element={
        <ProtectedRoute permission="products_view">
          <CustomerProducts />
        </ProtectedRoute>
      } />
      <Route path="/my-orders" element={
        <ProtectedRoute permission="orders_customer">
          <MyOrders />
        </ProtectedRoute>
      } />
      <Route path="/cart" element={
        <ProtectedRoute permission="cart_access">
          <Cart />
        </ProtectedRoute>
      } />
      <Route path="/customer-profile" element={
        <ProtectedRoute permission="profile_view">
          <CustomerProfile />
        </ProtectedRoute>
      } />

      {/* Redirect unknown paths */}
      <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Alert />
          {/* AdminDebug temporarily removed */}
          </BillingProvider>
        </NotificationProvider>
      </InventoryProvider>
    </AlertProvider>
  );
}

export default App;
