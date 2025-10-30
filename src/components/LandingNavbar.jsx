import { useNavigate } from "react-router-dom";
import "./styles/global.css";


export default function LandingNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="landing-navbar">
      <div className="logo">📦 IMS</div>
      <div className="nav-links">
        <button onClick={() => navigate("/")} className="nav-link">Home</button>
        <button onClick={() => navigate("/about")} className="nav-link">About</button>
        <button onClick={() => navigate("/contact")} className="nav-link">Contact</button>
        <button onClick={() => navigate("/login")} className="nav-link">Login</button>
        <button onClick={() => navigate("/signup")} className="nav-link">Sign Up</button>
      </div>
    </nav>
  );
}
