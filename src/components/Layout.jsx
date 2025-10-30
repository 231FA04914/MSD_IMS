import Sidebar from "./Sidebar.jsx";
import { useInventory } from "../contexts/InventoryContext.jsx";
import { useLowStockMonitor } from "../hooks/useLowStockMonitor.jsx";
import "./styles/global.css";

const Layout = ({ children }) => {
  // Re-enable inventory context and monitoring with safe defaults
  const { products = [], settings = {} } = useInventory() || {};
  
  // Always call hooks unconditionally (React rule)
  try {
    useLowStockMonitor(products, settings);
  } catch (error) {
    console.warn('Low stock monitoring disabled due to error:', error);
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;
