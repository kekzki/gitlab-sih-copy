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

      <main>
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
