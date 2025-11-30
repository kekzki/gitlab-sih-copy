import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, LogIn, Database, HardDrive, Fish, Globe, TrendingUp } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import './Home.css';

const Home = () => {
  const statsData = [
    { icon: Database, value: '1,000+', label: 'Total Datasets Unified' },
    { icon: HardDrive, value: '20+ TB', label: 'Terabytes of Data' },
    { icon: Fish, value: '80,000+', label: 'Identified Species' },
    { icon: Globe, value: '10+', label: 'Repositories Integrated' },
    { icon: TrendingUp, value: '68/100', label: 'Ecosystem Health Index' }
  ];

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="home-hero-content">
          <h1 className="home-hero-title ">
            Unifying the World's Marine Data for Scientific Discovery
          </h1>
          <div className="hero-buttons">
            <button className="home-btn home-btn-primary">
              <Upload size={20} />
              Upload Data
            </button>
            <Link to="/login" className="home-btn home-btn-secondary">
              <LogIn size={20} />
              Login / Sign Up
            </Link>
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />

      {/* Quick Stats Section */}
      <section className="quick-stats-section">
        <h2 className="stats-heading">Quick Stats</h2>
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;