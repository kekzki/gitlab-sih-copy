import React from "react";
import { Routes, Route } from "react-router-dom";
// Context
import { AuthProvider } from "./context/AuthContext";
// Components
import Navbar from "./components/Navbar";
// Pages
import Home from "./pages/Home";
import Taxonomy from "./pages/Taxonomy";
import Search from "./pages/Search";
import Visualisation from "./pages/Visualisation";
import Analysis from "./pages/Analysis";
import SpeciesDetail from "./pages/SpeciesDetail";
import ResearcherDashboard from "./pages/ResearcherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import UploadDataset from "./pages/UploadDataset";

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen text-black">
        <Navbar />

        <main className="pt-[80px]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/taxonomy" element={<Taxonomy />} />
            <Route path="/taxonomy/:id" element={<SpeciesDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/visualization" element={<Visualisation />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route
              path="/researcher-dashboard"
              element={<ResearcherDashboard />}
            />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/upload-dataset" element={<UploadDataset />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
