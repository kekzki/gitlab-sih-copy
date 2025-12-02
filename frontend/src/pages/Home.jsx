import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  LogIn,
  Database,
  HardDrive,
  Fish,
  Globe,
  TrendingUp,
} from "lucide-react";
import StatsCard from "../components/StatsCard";
import { useAuth } from "../context/AuthContext";
import Login from "../components/login";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole, openLoginModal } = useAuth();
  const [showNotification, setShowNotification] = useState(false);

  const statsData = [
    { icon: Database, value: "1,000+", label: "Total Datasets Unified" },
    { icon: HardDrive, value: "20+ TB", label: "Terabytes of Data" },
    { icon: Fish, value: "80,000+", label: "Identified Species" },
    { icon: Globe, value: "10+", label: "Repositories Integrated" },
    { icon: TrendingUp, value: "68/100", label: "Ecosystem Health Index" },
  ];

  // Handle Upload Data button click
  const handleUploadClick = () => {
    if (!isLoggedIn) {
      // Show inline notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000); // Auto-hide after 3 seconds
    } else if (userRole === "Researcher" || userRole === "Administrator") {
      navigate("/upload-dataset");
    }
  };

  // Handle Login/Sign Up button click
  const handleLoginClick = () => {
    openLoginModal();
  };

  // Handle Dashboard button click
  const handleDashboardClick = () => {
    if (userRole === "Researcher") {
      navigate("/researcher-dashboard");
    } else if (userRole === "Administrator") {
      navigate("/admin-dashboard");
    } else if (userRole === "General User") {
      navigate("/user-dashboard");
    }
  };

  // Determine what to show based on auth status and role
  const shouldShowButtons = !isLoggedIn || userRole !== "General User";
  const isResearcherOrAdmin =
    userRole === "Researcher" || userRole === "Administrator";

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="home-hero-content">
          <h1 className="home-hero-title">
            Unifying the World's Marine Data for Scientific Discovery
          </h1>

          {/* Login Required Notification */}
          {showNotification && (
            <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-out">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 shadow-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <p className="text-amber-800 text-sm font-medium">
                  You need to log in to upload data
                </p>
              </div>
            </div>
          )}

          <div className="hero-buttons">
            {/* Upload Data Button - Only show if not logged in or if researcher/admin */}
            {!isLoggedIn || isResearcherOrAdmin ? (
              <button
                onClick={handleUploadClick}
                className="home-btn home-btn-primary"
                disabled={!isLoggedIn && showNotification}
              >
                <Upload size={20} />
                Upload Data
              </button>
            ) : null}

            {/* Login/Sign Up or Dashboard Button - Only show if not logged in or if not general user */}
            {shouldShowButtons ? (
              <button
                onClick={isLoggedIn ? handleDashboardClick : handleLoginClick}
                className="home-btn home-btn-secondary"
              >
                <LogIn size={20} />
                {isLoggedIn ? "Dashboard" : "Login / Sign Up"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />

      {/* Quick Stats Section */}
      <section className="quick-stats-section">
        <h2 className="stats-heading">Quick Stats</h2>
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
