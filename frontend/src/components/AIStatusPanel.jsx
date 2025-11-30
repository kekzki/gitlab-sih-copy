import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import './AIStatusPanel.css';

const AIStatusPanel = ({ analysis }) => {
  return (
    <div className="ai-status-panel">
      <h3 className="ai-status-title">🤖 AI Analysis Status</h3>
      
      <div className="ai-status-verified">
        <CheckCircle size={48} className="verified-icon" />
        <span className="verified-text">VERIFIED</span>
      </div>

      <div className="ai-status-list">
        <div className="ai-status-item">
          {analysis.otolithAvailable ? (
            <CheckCircle size={18} className="status-check" />
          ) : (
            <Circle size={18} className="status-unchecked" />
          )}
          <span>Otolith Data Available</span>
        </div>
        
        <div className="ai-status-item">
          {analysis.ednaAvailable ? (
            <CheckCircle size={18} className="status-check" />
          ) : (
            <Circle size={18} className="status-unchecked" />
          )}
          <span>eDNA Sequence on Record</span>
        </div>
        
        <div className="ai-status-item">
          <CheckCircle size={18} className="status-check" />
          <span>{analysis.imagesAnalyzed} Images Analyzed</span>
        </div>
      </div>
    </div>
  );
};

export default AIStatusPanel;