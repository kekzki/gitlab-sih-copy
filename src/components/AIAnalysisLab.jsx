import React, { useState } from 'react';
import { Upload, FileText, Activity, Dna, ArrowRight, ExternalLink } from 'lucide-react';
// Import local images or use placeholders
// Note: Ensure you have these images or replace with valid URLs
import otolithBg from '/Users/ritesh/sih_project/Paradoxx6/src/assets/pexels-francesco-ungaro-3168998.jpg'; // Reusing your turtle or any ocean image
import ednaBg from '/Users/ritesh/sih_project/Paradoxx6/src/assets/pexels-francesco-ungaro-3168998.jpg'; 

const AIAnalysisLab = () => {
  const [mode, setMode] = useState('otolith'); // 'otolith' or 'edna'
  
  // Simulation states
  const [otolithUploaded, setOtolithUploaded] = useState(false);
  const [ednaUploaded, setEdnaUploaded] = useState(false);

  return (
    <div className="ai-lab-wrapper">
      
      {/* 1. Mode Switcher */}
      <div className="mode-switcher">
        <button 
          className={`mode-btn ${mode === 'otolith' ? 'active' : ''}`}
          onClick={() => setMode('otolith')}
        >
          Otolith Analysis
        </button>
        <button 
          className={`mode-btn ${mode === 'edna' ? 'active' : ''}`}
          onClick={() => setMode('edna')}
        >
          eDNA Sequence BLAST
        </button>
      </div>

      {/* --- SCENARIO A: OTOLITH ANALYSIS --- */}
      {mode === 'otolith' && (
        <div className="otolith-container">
          
          {/* Otolith Hero & Upload */}
          <div className="search-hero-box">
            <div className="search-hero-bg-image" style={{ backgroundImage: `url(${otolithBg})` }}></div>
            <div className="search-hero-content">
              <h1 className="search-hero-title">Otolith Analysis</h1>
              <p style={{ opacity: 0.9 }}>Upload an otolith image to extract Age, Growth rates, and Morphometrics.</p>
              
              {!otolithUploaded ? (
                <div className="search-hero-dropzone" onClick={() => setOtolithUploaded(true)}>
                  <Upload size={32} style={{ marginBottom: '10px' }} />
                  <h3>Click to Upload Otolith Image</h3>
                  <small>Supports .jpg, .png (Max 10MB)</small>
                </div>
              ) : (
                <button 
                  className="btn-view" 
                  style={{ background: 'white', color: '#2d6a6a' }}
                  onClick={() => setOtolithUploaded(false)}
                >
                  Upload New Image
                </button>
              )}
            </div>
          </div>

          {/* Otolith Results Dashboard */}
          {otolithUploaded && (
            <div className="otolith-dashboard">
              
              {/* LEFT COLUMN: Visual Proof */}
              <div className="visual-section">
                {/* 3. Visualization: Image Overlay */}
                <div className="image-canvas-container">
                  {/* Simulate the AI Overlay with text/css for now */}
                  <div style={{ position: 'relative', width: '300px', height: '300px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 20px #5dd9c1' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '10px', height: '10px', background: 'red', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100px', height: '100px', border: '2px solid blue', borderRadius: '50%', opacity: 0.6 }}></div>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', border: '2px solid green', borderRadius: '50%', opacity: 0.6 }}></div>
                  </div>
                  <span style={{ position: 'absolute', bottom: '10px', color: '#5dd9c1', background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: '4px' }}>
                    AI Overlay Active
                  </span>
                </div>

                {/* 3. Visualization: Radial Graph */}
                <div className="graph-container">
                  <h4 style={{ color: '#2d6a6a', marginBottom: '10px' }}>Radial Profile Analysis</h4>
                  {/* Placeholder for Recharts/Chart.js */}
                  <div style={{ width: '100%', height: '100%', borderLeft: '2px solid #333', borderBottom: '2px solid #333', position: 'relative' }}>
                    <svg width="100%" height="100%">
                      <polyline points="0,100 20,80 40,90 60,40 80,60 100,20 150,50 200,10" fill="none" stroke="#2d6a6a" strokeWidth="2" />
                      {/* Red X marks for rings */}
                      <text x="60" y="35" fill="red" fontSize="12">X</text>
                      <text x="100" y="15" fill="red" fontSize="12">X</text>
                      <text x="200" y="5" fill="red" fontSize="12">X</text>
                    </svg>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Data */}
              <div className="data-sidebar">
                
                {/* 1. Age & Growth */}
                <div className="data-card">
                  <h3>Age & Growth</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div className="big-metric">3 <span style={{fontSize: '1rem'}}>yrs</span></div>
                      <div className="sub-metric">Estimated Age</div>
                    </div>
                    <div>
                      <div className="big-metric" style={{ color: '#5dd9c1' }}>49.3</div>
                      <div className="sub-metric">Growth Rate</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                    <strong>Ring Count:</strong> 3 Detected
                  </div>
                </div>

                {/* 4. Taxonomy Link */}
                <div className="data-card">
                  <h3>Taxonomy Match</h3>
                  <div className="taxonomy-badge">
                    <strong>Pacific Cod</strong>
                    <span className="confidence-score">98% Match</span>
                  </div>
                  <button className="btn-outline">
                    View Full Taxonomy Card <ExternalLink size={14} style={{ display: 'inline', marginLeft: '5px' }} />
                  </button>
                </div>

                {/* 2. Morphometrics */}
                <div className="data-card">
                  <h3>Morphometrics</h3>
                  <table className="morph-table">
                    <tbody>
                      <tr><td>Area</td><td>12,450 px</td></tr>
                      <tr><td>Perimeter</td><td>450 px</td></tr>
                      <tr><td>Aspect Ratio</td><td>1.2</td></tr>
                      <tr><td>Circularity</td><td>0.89</td></tr>
                      <tr><td>Roundness</td><td>0.92</td></tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SCENARIO B: eDNA ANALYSIS --- */}
      {mode === 'edna' && (
        <div className="edna-container">
          
          {/* eDNA Hero & Input */}
          <div className="search-hero-box">
             <div className="search-hero-bg-image" style={{ backgroundImage: `url(${ednaBg})`, filter: 'hue-rotate(45deg) brightness(0.5)' }}></div>
             <div className="search-hero-content">
                <h1 className="search-hero-title">eDNA Sequence BLAST</h1>
                <p>Paste your FASTA sequence below or upload a .fasta file.</p>
                
                <div className="search-hero-dropzone" style={{ textAlign: 'left', background: 'rgba(255,255,255,0.9)', color: '#333' }}>
                   <textarea 
                      className="edna-textarea"
                      placeholder=">Sequence_1&#10;ATGCGTACGTAGCTAGCTAG..."
                   ></textarea>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <button style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#2d6a6a', fontWeight: 'bold' }}>
                        <Upload size={16}/> Upload .fasta file
                      </button>
                      <button className="btn-view" onClick={() => setEdnaUploaded(true)}>
                        <Dna size={16} style={{ marginRight: '5px', display: 'inline' }}/> Run BLAST
                      </button>
                   </div>
                </div>
             </div>
          </div>

          {/* eDNA Results Table */}
          {ednaUploaded && (
            <div className="edna-results">
               <h3 style={{ color: '#2d6a6a' }}>Sequence Alignment Results</h3>
               <table className="edna-results-table">
                  <thead>
                     <tr>
                        <th>Species Match</th>
                        <th>Confidence</th>
                        <th>E-Value</th>
                        <th>Taxonomy ID</th>
                        <th>Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr>
                        <td style={{ fontWeight: 'bold' }}>Thunnus albacares (Yellowfin Tuna)</td>
                        <td><span className="confidence-score" style={{ background: '#10b981' }}>99.8%</span></td>
                        <td>0.0</td>
                        <td>#88219</td>
                        <td><button className="btn-outline" style={{ width: 'auto', padding: '0.4rem 1rem' }}>View Taxonomy</button></td>
                     </tr>
                     <tr>
                        <td style={{ fontWeight: 'bold' }}>Thunnus obesus (Bigeye Tuna)</td>
                        <td><span className="confidence-score" style={{ background: '#f59e0b' }}>94.2%</span></td>
                        <td>2e-145</td>
                        <td>#88220</td>
                        <td><button className="btn-outline" style={{ width: 'auto', padding: '0.4rem 1rem' }}>View Taxonomy</button></td>
                     </tr>
                  </tbody>
               </table>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AIAnalysisLab;