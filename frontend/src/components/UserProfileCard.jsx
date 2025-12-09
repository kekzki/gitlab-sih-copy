import React from "react";
import { User, Settings, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";

// --- STYLING CONSTANTS (Passed from parent, or defined here for modularity) ---
const TEAL_TEXT = "text-[rgb(45,106,106)]";
const CARD_STYLE = "bg-white rounded-lg shadow-md p-6 border border-gray-100";
const BUTTON_PRIMARY =
  "bg-[rgb(45,106,106)] text-white font-semibold py-2 px-4 rounded-md transition duration-200 hover:bg-[rgb(35,96,96)] flex items-center gap-2";

/**
 * Reusable component for displaying the user's profile information.
 * @param {object} props
 * @param {object} props.profile - The profile object { full_name, role, email, phone }
 * @param {string} props.buttonText - Text for the action button (e.g., "Manage Profile", "Upload Dataset")
 * @param {string} props.buttonPath - Path for the action button (e.g., "/settings", "/upload-dataset")
 * @param {object} props.ButtonIcon - Lucide icon for the action button (e.g., Settings, UploadCloud)
 */
function UserProfileCard({ profile, buttonText, buttonPath, ButtonIcon }) {
  return (
    <div className="space-y-6">
      {/* 1. Profile Card Content */}
      <div className={CARD_STYLE}>
        <div className="flex items-center gap-3 mb-4">
          <User className={TEAL_TEXT} size={24} />
          <h3 className="text-lg font-semibold text-gray-800">My Profile</h3>
        </div>
        <p className="text-lg font-bold mb-1">{profile.full_name}</p>
        <p className="text-sm text-gray-500 mb-4">{profile.role}</p>

        <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Phone:</strong> {profile.phone || "N/A"}
          </p>
        </div>
      </div>

      {/* 2. Action Button */}
      <Link
        to={buttonPath}
        className={BUTTON_PRIMARY}
        style={{ width: "100%", justifyContent: "center" }}
      >
        <ButtonIcon size={20} />
        {buttonText}
      </Link>
    </div>
  );
}

export default UserProfileCard;