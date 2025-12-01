import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, User, LogOut } from "lucide-react";
import { supabase } from "../supabaseClient";
import Login from "./login";

// Define the colors/styles based on your existing code
const TEAL_BUTTON_STYLE =
  "flex items-center gap-1.5 py-[8px] px-4 text-sm rounded-[6px] transition-colors bg-[rgb(45,106,106)] text-white hover:bg-[rgb(35,96,96)] min-w-[140px] justify-center";

const AuthStatus = () => {
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listener to update session state when auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Check initial session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Handles user logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/"); // Redirect to home page after logout
  };

  if (!session) {
    // --- NOT LOGGED IN: Show Login Button ---
    return (
      <>
        <button
          onClick={() => setShowLogin(true)}
          className={TEAL_BUTTON_STYLE}
        >
          <LogIn size={16} />
          <span className="nav-text">Login</span>
        </button>

        {/* Render the Login Modal */}
        {showLogin && <Login onClose={() => setShowLogin(false)} />}
      </>
    );
  } else {
    // --- LOGGED IN: Show Dashboard Button with Logout ---
    return (
      <div className="flex items-center gap-3">
        {/* Dashboard Link (Replaces Login Button) */}
        <Link to="/researcher-dashboard" className={TEAL_BUTTON_STYLE}>
          <User size={16} />
          <span className="nav-text">Dashboard</span>
        </Link>

        {/* Standalone Logout Button (or could be in a dropdown) */}
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1.5 text-sm"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }
};

export default AuthStatus;
