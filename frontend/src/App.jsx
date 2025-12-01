import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
// Components
import Navbar from "./components/Navbar";
import LoginModal from "./components/login"; // Import the Modal
// Auth Hook
import useAuthUser from "./useAuthUser"; // Import the custom hook
// Pages
import Home from "./pages/Home";
import Taxonomy from "./pages/Taxonomy";
import Search from "./pages/Search";
import Visualisation from "./pages/Visualisation";
import Analysis from "./pages/Analysis";
import SpeciesDetail from "./pages/SpeciesDetail";

import ResearcherDashboard from "./pages/ResearcherDashboard"; // <-- NEW DASHBOARD
// Placeholder component for the Upload page (to satisfy the route)
const UploadDatasetPlaceholder = () => (
  <div className="p-10 text-center text-xl text-gray-600">
    <h2>Upload Page Under Development</h2>
    <p>The backend API for file uploads is still being built.</p>
  </div>
);
// -------------------

// Note: We no longer route to /login as a page

const App = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Auth State
  const { userSession, isLoading } = useAuthUser();

  // Close modal when user state changes (logs in/out)
  useEffect(() => {
    // If a session is established (user logged in), close the modal
    if (userSession) {
      setShowLoginModal(false);
    }
  }, [userSession]);

  const handleShowLogin = () => {
    setShowLoginModal(true);
  };

  return (
    <div className="min-h-screen text-black">
      {/* Pass the function to Navbar */}
      <Navbar onShowLogin={handleShowLogin} />

      <main className="pt-[80px]">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onShowLogin={handleShowLogin} // Pass the function to Home
                isLoggedIn={!!userSession} // Pass login status
                isLoadingAuth={isLoading} // Pass loading status
              />
            }
          />
          <Route path="/taxonomy" element={<Taxonomy />} />
          <Route path="/taxonomy/:id" element={<SpeciesDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/visualization" element={<Visualisation />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route
            path="/researcher-dashboard"
            element={<ResearcherDashboard />}
          />

          <Route
            path="/upload-dataset"
            element={<UploadDatasetPlaceholder />}
          />

          {/* --- NEW DASHBOARD ROUTES (Required to fix the routing error) --- */}
          {/* 1. Researcher Dashboard Route */}
          <Route
            path="/researcher-dashboard"
            element={<ResearcherDashboard />}
          />

          {/* 2. Upload Placeholder Route (Used by the button on the dashboard) */}
          <Route
            path="/upload-dataset"
            element={<UploadDatasetPlaceholder />}
          />

          {/* Add paths for other roles here later, e.g., /admin-dashboard */}

          {/* REMOVED: <Route path="/login" element={<Login />} /> */}
        </Routes>
      </main>

      {/* Render the Login modal conditionally */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

export default App;
