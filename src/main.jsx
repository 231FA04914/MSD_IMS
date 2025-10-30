import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import App from "./App.jsx";
import FallbackApp from "./components/FallbackApp.jsx";
import "./index.css";
import "./components/styles/global.css";

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackApp />;
    }
    return this.props.children;
  }
}

console.log("Main.jsx loading...");

const container = document.getElementById("root");
if (!container) {
  console.error("Root container not found!");
}

const root = createRoot(container);

console.log("About to render React app...");

// Use fallback app first to test if React is working
const USE_FALLBACK = false; // Set to true to test basic React rendering

// Render with error boundary for production stability
if (USE_FALLBACK) {
  root.render(
    <React.StrictMode>
      <FallbackApp />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
