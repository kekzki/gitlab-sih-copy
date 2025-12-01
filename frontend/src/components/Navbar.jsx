import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Search, BarChart, Eye, LogIn } from "lucide-react";
import Login from "./login"; // Ensure this path is correct
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Taxonomy", path: "/taxonomy", icon: Compass },
    { name: "Search", path: "/search", icon: Search },
    { name: "Visualisation", path: "/visualization", icon: Eye },
    { name: "Analysis", path: "/analysis", icon: BarChart },
    { name: "Login", path: "/login", icon: LogIn },
  ];

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">P</div>
          <span className="logo-text">ParadoxX6</span>
        </Link>

        <div className="navbar-links">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.name === "Login") {
              return (
                <Link
                  key={item.name}
                  to="#" // Dummy path
                  onClick={(e) => {
                    e.preventDefault(); // Stop the link from navigating
                    setShowLogin(true); // Open the popup
                  }}
                  className={`nav-item ${showLogin ? "active" : ""}`}
                >
                  <item.icon size={16} />
                  <span className="nav-text">{item.name}</span>
                </Link>
              );
            }

            // Normal links
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
        </div>
      </nav>

      {/* Popup Component */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </>
  );
};

export default Navbar;
