import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient"; // Adjust path if needed

/**
 * Custom hook to manage the authenticated user's session and profile data.
 */
const useAuthUser = () => {
  const [userSession, setUserSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Session and Listen for Auth Changes
  useEffect(() => {
    // Listener for real-time changes to the auth state (e.g., login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserSession(session);
        if (session) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Initial fetch of the session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch User Profile Data
  const fetchProfile = async (userId) => {
    setIsLoading(true);
    // Query the public.profiles table using the RLS-protected ID
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, role") // Only fetching necessary columns
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error.message);
      // Fallback: Use email as name if profile fetching fails
      const currentAuthUser = supabase.auth.getUser();
      setProfile({
        full_name: currentAuthUser?.email || "User",
        role: "General User",
      });
    } else {
      setProfile(data); // data contains {full_name, role}
    }
    setIsLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { userSession, profile, isLoading, signOut };
};

export default useAuthUser;
