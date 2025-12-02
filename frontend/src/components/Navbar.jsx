import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, Search, BarChart, Eye, Upload } from "lucide-react";
import AuthStatus from "./AuthStatus";
import { useAuth } from "../context/AuthContext";

import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Taxonomy", path: "/taxonomy", icon: Compass },
    { name: "Search", path: "/search", icon: Search },
    { name: "Visualisation", path: "/visualization", icon: Eye },
    { name: "Analysis", path: "/analysis", icon: BarChart },
  ];

  // Check if user is Researcher or Administrator
  const isResearcherOrAdmin =
    isLoggedIn && (userRole === "Researcher" || userRole === "Administrator");

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <div className="logo-icon">P</div>
        <span className="logo-text">ParadoxX6</span>
      </Link>

      <div className="navbar-links">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <item.icon size={16} />
              <span className="nav-text">{item.name}</span>
            </Link>
          );
        })}

        {/* Data Upload Button - Only visible to Researcher and Administrator */}
        {isResearcherOrAdmin && (
          <button
            onClick={() => navigate("/upload-dataset")}
            className="nav-item"
            title="Upload Data"
          >
            <Upload size={16} />
            <span className="nav-text">Data Upload</span>
          </button>
        )}

        {/* --- AUTHENTICATION STATUS --- */}
        <AuthStatus />
      </div>
    </nav>
  );
};

export default Navbar;
