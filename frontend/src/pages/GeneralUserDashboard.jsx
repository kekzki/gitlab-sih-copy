import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { User, Settings, Search, Eye, BarChart } from "lucide-react";

// --- STYLING CONSTANTS (Matching Researcher Dashboard) ---
const TEAL_BASE = "bg-[rgb(45,106,106)]";
const TEAL_TEXT = "text-[rgb(45,106,106)]";
const CARD_STYLE = "bg-white rounded-lg shadow-md p-6 border border-gray-100";
const BUTTON_PRIMARY = `${TEAL_BASE} text-white font-semibold py-2 px-4 rounded-md transition duration-200 hover:bg-[rgb(35,96,96)] flex items-center gap-2`;

function GeneralUserDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  // --- DATA FETCHING (Same logic as Researcher Dashboard, but simplified) ---
  useEffect(() => {
    async function loadProfileData() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch profile details (role, name, phone) from the 'users' table
      const { data: profileData, error } = await supabase
        .from("users") // NOTE: Use your confirmed table name here if not 'users' or 'profiles'
        .select("full_name, role, phone")
        .eq("id", user.id)
        .single();

      if (error || !profileData || profileData.role !== "General User") {
        console.error("Profile or Role Check Failed:", error);
        // Security fallback: Redirect if not authorized
        navigate("/");
        return;
      }

      setProfile({ email: user.email, ...profileData });
      setLoading(false);
    }

    loadProfileData();
  }, [navigate]);

  // --- Quick Link Data ---
  const quickLinks = [
    {
      name: "Explore Database",
      path: "/search",
      icon: Search,
      description: "Find data on species and reports.",
    },
    {
      name: "View Visualizations",
      path: "/visualization",
      icon: Eye,
      description: "See current data trends and charts.",
    },
    {
      name: "Run Analysis",
      path: "/analysis",
      icon: BarChart,
      description: "Access the AI Lab for deep insights.",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className={`${TEAL_TEXT} text-xl`}>Loading User Dashboard...</div>
      </div>
    );
  }

  if (!profile) return <div>Access Denied. Redirecting...</div>;

  // --- RENDERING COMPONENTS ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <h1 className={`text-3xl font-extrabold mb-6 ${TEAL_TEXT}`}>
        General User Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* === COLUMN 1: PROFILE / SETTINGS (Sticky Sidebar) === */}
        <div className="md:col-span-1 space-y-6 sticky top-5 max-h-[85vh] overflow-y-auto">
          {/* 1. Profile Card */}
          <div className={CARD_STYLE}>
            <div className="flex items-center gap-3 mb-4">
              <User className={TEAL_TEXT} size={24} />
              <h3 className="text-lg font-semibold text-gray-800">
                My Profile
              </h3>
            </div>
            <p className="text-lg font-bold mb-1">{profile.full_name}</p>
            <p className="text-sm text-gray-500 mb-4">{profile.role}</p>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <p>
                <strong>Email:</strong> {profile.email}
              </p>
              <p>
                <strong>Phone:</strong> {profile.phone}
              </p>
            </div>
          </div>

          {/* 2. Action Button: Manage Profile */}
          <Link
            to="/settings"
            className={BUTTON_PRIMARY}
            style={{ width: "100%", justifyContent: "center" }}
          >
            <Settings size={20} />
            Manage Profile
          </Link>
        </div>

        {/* === COLUMN 2: QUICK LINKS (Main Content) === */}
        <div className="md:col-span-3">
          <div className={CARD_STYLE}>
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Quick Links & Resources
            </h3>

            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                Welcome! Here are the core actions available to you as a
                **General User**:
              </p>

              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="flex items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <link.icon className={`mr-4 ${TEAL_TEXT}`} size={24} />
                  <div>
                    <h4 className="text-lg font-semibold">{link.name}</h4>
                    <p className="text-sm text-gray-500">{link.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneralUserDashboard;
