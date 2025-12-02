import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch user role from profiles table
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }
      return data?.role || null;
    } catch (err) {
      console.error("Error in fetchUserRole:", err);
      return null;
    }
  };

  // Initialize auth listener
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check initial session
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession) {
          setSession(initialSession);
          const role = await fetchUserRole(initialSession.user.id);
          setUserRole(role);
        }

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            setSession(newSession);
            if (newSession) {
              const role = await fetchUserRole(newSession.user.id);
              setUserRole(role);
            } else {
              setUserRole(null);
            }
          }
        );

        setIsLoading(false);
        return () => authListener.subscription.unsubscribe();
      } catch (err) {
        console.error("Error initializing auth:", err);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
  };

  const value = {
    session,
    userRole,
    isLoading,
    isLoggedIn: !!session,
    showLoginModal,
    openLoginModal,
    closeLoginModal,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
