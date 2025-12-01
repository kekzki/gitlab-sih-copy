import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import CustomStatusFilter from "../components/CustomStatusFilter";
import { fetchResearcherDatasets } from "../mockDatasets"; // <-- MOCK DATA IMPORT
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  User,
  UploadCloud,
} from "lucide-react";

// --- STYLING CONSTANTS (Tailwind CSS based on your inputs) ---
const TEAL_BASE = "bg-[rgb(45,106,106)]";
const TEAL_TEXT = "text-[rgb(45,106,106)]";
const CARD_STYLE = "bg-white rounded-lg shadow-md p-6 border border-gray-100";
const BUTTON_PRIMARY = `${TEAL_BASE} text-white font-semibold py-2 px-4 rounded-md transition duration-200 hover:bg-[rgb(35,96,96)] flex items-center gap-2`;
const BADGE_PUBLIC =
  "bg-green-100 text-green-700 px-3 py-1 text-xs font-medium rounded-full";
const BADGE_PRIVATE =
  "bg-red-100 text-red-700 px-3 py-1 text-xs font-medium rounded-full";
const INPUT_BASE =
  "w-full px-4 py-2 border rounded-md focus:ring-1 focus:ring-[rgb(45,106,106)]";

function ResearcherDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const navigate = useNavigate();

  // --- STATE FOR FILTERING & SORTING ---
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState({
    field: "created_at",
    direction: "desc",
  });

  // --- DATA FETCHING (Using Mock Data) ---
  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);

      // 1. Fetch User Profile Info (from Supabase)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch profile details (role, name, phone) from the 'users' table
      const { data: profileData, error } = await supabase
        .from("profiles") // <--- CHANGED FROM 'users' TO 'profiles'
        .select("full_name, role, phone")
        .eq("id", user.id)
        .single();

      if (error || !profileData || profileData.role !== "Researcher") {
        console.error("Profile or Role Check Failed:", error);
        // Security fallback: Redirect if not authorized
        navigate("/");
        return;
      }

      setProfile({ email: user.email, ...profileData });

      // 2. Fetch Datasets (Using Mock Data for now)
      // In a real app: const { data: datasetsData } = await supabase.from('datasets').select('*').eq('uploaded_by_id', user.id);
      const datasetsData = fetchResearcherDatasets(user.id);
      setDatasets(datasetsData);

      setLoading(false);
    }

    loadDashboardData();
  }, [navigate]);

  // --- MEMOIZED FILTERING & SORTING LOGIC ---
  const filteredAndSortedDatasets = useMemo(() => {
    if (!datasets) return [];

    let filtered = datasets;

    // 1. Search Filter (by Title)
    if (searchText) {
      filtered = filtered.filter((d) =>
        d.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 2. Status Filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    // 3. Sorting
    filtered.sort((a, b) => {
      const aVal = a[sortBy.field];
      const bVal = b[sortBy.field];

      let comparison = 0;
      if (aVal > bVal) comparison = 1;
      if (aVal < bVal) comparison = -1;

      return sortBy.direction === "asc" ? comparison : comparison * -1;
    });

    return filtered;
  }, [datasets, searchText, statusFilter, sortBy]);

  // --- STATS CALCULATION ---
  const totalCount = datasets.length;
  const publicCount = datasets.filter((d) => d.status === "Public").length;
  const privateCount = datasets.filter((d) => d.status === "Private").length;

  // --- HANDLERS ---
  const handleSortChange = (field) => {
    setSortBy((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className={`${TEAL_TEXT} text-xl`}>
          Loading Researcher Dashboard...
        </div>
      </div>
    );
  }

  if (!profile) {
    // Should be redirected, but safe fallback
    return <div>Access Denied. Redirecting...</div>;
  }

  // --- RENDERING COMPONENTS ---

  const StatCard = ({ title, count, filterValue }) => (
    <div
      className={`flex-1 ${CARD_STYLE} cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={() => setStatusFilter(filterValue)}
    >
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className={`text-4xl font-bold mt-1 ${TEAL_TEXT}`}>{count}</div>
      <p className="text-xs text-gray-400">
        {filterValue === "All"
          ? "All uploaded records"
          : `${filterValue} records`}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* === COLUMN 1: PROFILE / STATS === */}
        <div className="md:col-span-1 space-y-6 sticky top-5 h-fit">
          {" "}
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
          {/* 2. Upload Button */}
          <Link
            to="/upload-dataset"
            className={BUTTON_PRIMARY}
            style={{ width: "100%", justifyContent: "center" }}
          >
            <UploadCloud size={20} />
            Upload New Dataset
          </Link>
          {/* 3. Stat Cards (Stacked vertically on mobile, full width on desktop) */}
          <StatCard
            title="Total Datasets"
            count={totalCount}
            filterValue="All"
          />
          <StatCard
            title="Published"
            count={publicCount}
            filterValue="Public"
          />
          <StatCard
            title="Private"
            count={privateCount}
            filterValue="Private"
          />
        </div>

        {/* === COLUMN 2: DATASETS LIST (Main Content) === */}
        <div className="md:col-span-3">
          <div className={CARD_STYLE}>
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              {/* Dynamic Title based on the selected filter */}
              {statusFilter === "All"
                ? "All Datasets"
                : `${statusFilter} Datasets`}
              {/* Display the count of the currently filtered results */} (
              {filteredAndSortedDatasets.length})
            </h3>

            {/* --- SEARCH & FILTER BAR --- */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              {/* Search by Title */}
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search by Dataset Title..."
                  className={`pl-10 ${INPUT_BASE}`}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Search
                  size={18}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
              </div>

              {/* Status Filter */}
              <CustomStatusFilter
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            </div>

            {/* --- SORT CONTROLS (Using Buttons) --- */}
            <div className="flex gap-4 mb-6 text-sm">
              <span className="font-medium text-gray-600">Sort By:</span>

              {["created_at", "title"].map((field) => (
                <button
                  key={field}
                  onClick={() => handleSortChange(field)}
                  className={`flex items-center gap-1 transition-colors ${
                    sortBy.field === field
                      ? TEAL_TEXT
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {field === "created_at" ? "Date" : "Title"}
                  {sortBy.field === field ? (
                    sortBy.direction === "asc" ? (
                      <SortAsc size={16} />
                    ) : (
                      <SortDesc size={16} />
                    )
                  ) : (
                    <Filter size={14} className="opacity-50" />
                  )}
                </button>
              ))}
            </div>

            {/* --- DATASET LIST --- */}
            <div className="space-y-4">
              {filteredAndSortedDatasets.length > 0 ? (
                filteredAndSortedDatasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-lg font-semibold">{dataset.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {dataset.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>
                          Uploaded:{" "}
                          {new Date(dataset.created_at).toLocaleDateString()}
                        </span>
                        <span>| {dataset.file_count} files</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={
                          dataset.status === "Public"
                            ? BADGE_PUBLIC
                            : BADGE_PRIVATE
                        }
                      >
                        {dataset.status}
                      </span>
                      <button
                        className={`text-sm py-1 px-3 rounded ${TEAL_BASE} text-white hover:opacity-90`}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-gray-500">
                  No datasets found matching the criteria.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResearcherDashboard;
