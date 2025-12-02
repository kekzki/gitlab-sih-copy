import React, { useState } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const Login = ({ onClose }) => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("General User");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const roles = ["General User", "Researcher", "Administrator"];

  // --- STYLING CONSTANTS ---
  const tealColor = "bg-[rgb(45,106,106)] hover:bg-[rgb(35,96,96)]";
  const tealText = "text-[rgb(45,106,106)]";
  const focusStyle =
    "focus:border-[rgb(45,106,106)] focus:ring-1 focus:ring-[rgb(45,106,106)]";
  const inputBase = `w-full px-4 py-2.5 text-sm rounded-md bg-gray-50 border border-gray-200 outline-none transition-all ${focusStyle}`;

  // --- CLOSE MODAL AFTER SUCCESS ---
  const handleLoginSuccess = () => {
    onClose();
  };

  // --- AUTHENTICATION LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (activeTab === "register") {
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        setLoading(false);
        return;
      }

      // --- SUPABASE SIGN UP LOGIC ---
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phone,
            user_role: role,
          },
        },
      });

      if (error) {
        console.error("[SUPABASE ERROR] Registration failed:", error);
        setLoading(false);
        if (error.message.includes("already registered")) {
          alert(
            "Error: This email is already registered. Please sign in or use a different email."
          );
        } else {
          alert("Registration Error: " + error.message);
        }
        return;
      } else if (data.user) {
        alert(
          "Registration complete! Please check your email for a confirmation link."
        );
        onClose();
      } else {
        console.log(
          "[DEBUG] Supabase returned silent block. Email already exists."
        );
        alert(
          "Error: This email is already registered. Please sign in or use a different email."
        );
        setLoading(false);
        return;
      }
    } else {
      // --- SUPABASE SIGN IN LOGIC ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        console.error("[SUPABASE ERROR] Login failed:", error);
        alert("Login Error: " + error.message);
      } else {
        // SUCCESS PATH: Just close the modal
        handleLoginSuccess();
      }
    }
  };

  // --- RENDER FUNCTION (FIXED Z-INDEX) ---
  return (
    // OVERLAY: Full screen, dark background. Use z-[100] for certainty.
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      {/* POPUP CONTAINER: Adjusted width and added z-[101] to ensure it stacks above the backdrop. */}
      <div className="relative w-full max-w-[450px] bg-white rounded-lg shadow-2xl overflow-hidden z-[101]">
        {/* CLOSE BUTTON (X) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors z-[102]"
        >
          <X size={24} />
        </button>

        <div className="p-8 pt-10">
          <h2 className={`text-3xl font-bold text-center mb-2 ${tealText}`}>
            Access Paradoxx
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            Sign in or register to contribute to marine research.
          </p>

          {/* TAB SWITCHER */}
          <div className="flex mb-6 bg-gray-100 p-1 rounded-md">
            <button
              className={`flex-1 py-2 rounded text-sm font-medium transition-all duration-200 ${
                activeTab === "signin"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("signin")}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 rounded text-sm font-medium transition-all duration-200 ${
                activeTab === "register"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* --- REGISTER FIELDS --- */}
            {activeTab === "register" && (
              <>
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputBase}
                    required
                  />
                </div>

                {/* Grid for Phone and Role */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputBase}
                      required
                    />
                  </div>

                  {/* Custom Dropdown for Role */}
                  <div className="flex-1 relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`${inputBase} flex items-center justify-between text-left ${
                        !role ? "text-gray-400" : "text-gray-900"
                      }`}
                      disabled={loading}
                    >
                      <span className="truncate">{role}</span>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
                        {roles.map((r) => (
                          <button
                            key={r}
                            type="button"
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center justify-between"
                            onClick={() => {
                              setRole(r);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {r}
                            {role === r && (
                              <Check
                                size={14}
                                className="text-[rgb(45,106,106)]"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* --- COMMON FIELDS --- */}
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputBase}
                required
              />
            </div>

            {activeTab === "register" && (
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputBase}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 px-4 mt-2 text-white font-bold rounded-md transition-colors duration-200 ${tealColor}`}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : activeTab === "signin"
                ? "Sign In"
                : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
