import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import your components
import Navbar from './components/Navbar';

// Import your pages
import Home from './pages/Home';
import Taxonomy from './pages/Taxonomy';
import Search from './pages/Search';
import Visualisation from './pages/Visualisation';
import Analysis from './pages/Analysis';
import Login from './pages/Login';
import SpeciesDetail from './pages/SpeciesDetail'; 

const App = () => {
  return (
    <div className="min-h-screen  text-black">
      {/* Navbar appears on all pages */}
      <Navbar />
      
      {/* <main> tag surrounds the main, dynamic content */}
      <main>
        {/* Routes switch the content below the Navbar */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/taxonomy" element={<Taxonomy />} />
          <Route path="/taxonomy/:id" element={<SpeciesDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/visualization" element={<Visualisation />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;