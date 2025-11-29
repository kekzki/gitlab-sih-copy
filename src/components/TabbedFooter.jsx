import React, { useState } from 'react';
import { Map, Database, Dna } from 'lucide-react';
import './TabbedFooter.css';

const TabbedFooter = ({ speciesId }) => {
  const [activeTab, setActiveTab] = useState('distribution');

  // Mock data
  const datasets = [
    { title: 'Tuna Survey 2024', author: 'Dr. Ray', date: 'Nov 2024' },
    { title: 'Marine Census Data', author: 'NOAA', date: 'Oct 2024' },
    { title: 'Indian Ocean Study', author: 'Dr. Sharma', date: 'Sep 2024' }
  ];

  const ednaHistory = [
    { date: 'Nov 20, 2024', location: 'Bay of Bengal', confidence: '99.8%' },
    { date: 'Oct 15, 2024', location: 'Arabian Sea', confidence: '98.5%' },
    { date: 'Sep 03, 2024', location: 'Lakshadweep', confidence: '99.2%' }
  ];

  return (
    <div className="tabbed-footer">
      <div className="tab-buttons">
        <button
          className={`tab-button ${activeTab === 'distribution' ? 'active' : ''}`}
          onClick={() => setActiveTab('distribution')}
        >
          <Map size={18} />
          Geographic Distribution
        </button>
        <button
          className={`tab-button ${activeTab === 'datasets' ? 'active' : ''}`}
          onClick={() => setActiveTab('datasets')}
        >
          <Database size={18} />
          Associated Datasets
        </button>
        <button
          className={`tab-button ${activeTab === 'edna' ? 'active' : ''}`}
          onClick={() => setActiveTab('edna')}
        >
          <Dna size={18} />
          eDNA History
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'distribution' && (
          <div className="distribution-tab">
            <div className="map-placeholder">
              <Map size={64} />
              <p>Geographic distribution map will be displayed here</p>
              <p className="map-hint">Showing density heatmap and sighting locations</p>
            </div>
          </div>
        )}

        {activeTab === 'datasets' && (
          <div className="datasets-tab">
            <table className="datasets-table">
              <thead>
                <tr>
                  <th>Dataset Title</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((dataset, index) => (
                  <tr key={index}>
                    <td>{dataset.title}</td>
                    <td>{dataset.author}</td>
                    <td>{dataset.date}</td>
                    <td>
                      <button className="download-btn">Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'edna' && (
          <div className="edna-tab">
            <div className="edna-timeline">
              {ednaHistory.map((event, index) => (
                <div key={index} className="edna-event">
                  <div className="edna-dot"></div>
                  <div className="edna-content">
                    <div className="edna-date">{event.date}</div>
                    <div className="edna-location">{event.location}</div>
                    <div className="edna-confidence">{event.confidence} match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabbedFooter;