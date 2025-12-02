import React from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Login from "./login";

// Define the colors/styles based on your existing code
const TEAL_BUTTON_STYLE =
  "flex items-center gap-1.5 py-[8px] px-4 text-sm rounded-[6px] transition-colors bg-[rgb(45,106,106)] text-white hover:bg-[rgb(35,96,96)] min-w-[140px] justify-center cursor-pointer";

const AuthStatus = () => {
  const {
    isLoggedIn,
    userRole,
    logout,
    showLoginModal,
    openLoginModal,
    closeLoginModal,
  } = useAuth();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Determine dashboard path based on role
  const getDashboardPath = () => {
    switch (userRole) {
      case "Researcher":
        return "/researcher-dashboard";
      case "Administrator":
        return "/admin-dashboard";
      case "General User":
        return "/user-dashboard";
      default:
        return "/";
    }
  };

  if (!isLoggedIn) {
    // --- NOT LOGGED IN: Show Login Button ---
    return (
      <>
        <button onClick={openLoginModal} className={TEAL_BUTTON_STYLE}>
          <LogIn size={16} />
          <span className="nav-text">Login</span>
        </button>

        {/* Render the Login Modal */}
        {showLoginModal && <Login onClose={closeLoginModal} />}
      </>
    );
  } else {
    // --- LOGGED IN: Show Dashboard Button with Logout ---
    return (
      <div className="flex items-center gap-3">
        {/* Dashboard Link (Dynamic based on role) */}
        <button
          onClick={() => navigate(getDashboardPath())}
          className={TEAL_BUTTON_STYLE}
        >
          <User size={16} />
          <span className="nav-text">Dashboard</span>
        </button>

        {/* Standalone Logout Button */}
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1.5 text-sm cursor-pointer"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }
};

export default AuthStatus;
