import React, { useState, useEffect } from "react";
import { Upload, FileText, Activity, Dna, ArrowRight, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";

// --- Configuration ---
const API_BASE = "http://localhost:8080";

export default function AIAnalysisLab() {
  const [mode, setMode] = useState("otolith"); // 'otolith' or 'edna' or 'system'
  
  // --- State for System Health ---
  const [pingStatus, setPingStatus] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [testsRunning, setTestsRunning] = useState(false);

  // --- State for Otolith ---
  const [otolithFile, setOtolithFile] = useState(null);
  const [otolithResult, setOtolithResult] = useState(null);
  const [otolithStatus, setOtolithStatus] = useState(null); // { state: 'pending'|'success'|'error', message: '' }

  // --- State for eDNA ---
  const [ednaSequence, setEdnaSequence] = useState("");
  const [ednaResult, setEdnaResult] = useState(null);
  const [ednaStatus, setEdnaStatus] = useState(null);

  // --- 1. System Connectivity Logic ---
  async function testConnectivity() {
    setPingStatus({ state: "pending", message: "Pinging Backend..." });
    try {
      const res = await fetch(`${API_BASE}/api/species`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setPingStatus({
        state: "success",
        message: `Connected! Found ${data ? data.length : 0} species records.`
      });
    } catch (e) {
      setPingStatus({
        state: "error",
        message: `Connection Failed: ${e.message}. Is Backend running?`
      });
    }
  }

  // Run connectivity check once on mount
  useEffect(() => {
    testConnectivity();
  }, []);

  // --- 2. Otolith Analysis Logic ---
  async function handleOtolithUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setOtolithFile(file);
    setOtolithStatus({ state: "pending", message: "Analyzing image with AI..." });
    setOtolithResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/analyze-image`, {
        method: "POST",
        body: formData,
      });
      const text = await res.text();
      
      if (res.ok) {
        try {
          const json = JSON.parse(text);
          setOtolithResult(json);
        } catch {
          setOtolithResult({ raw_text: text });
        }
        setOtolithStatus({ state: "success", message: "Analysis Complete" });
      } else {
        setOtolithStatus({ state: "error", message: `Server Error: ${text}` });
      }
    } catch (err) {
      setOtolithStatus({ state: "error", message: `Network Error: ${err.message}` });
    }
  }

  // --- 3. eDNA BLAST Logic ---
  async function handleEdnaBlast() {
    if (!ednaSequence) return alert("Please enter a sequence first.");
    setEdnaStatus({ state: "pending", message: "Running BLAST against NCBI..." });
    setEdnaResult(null);

    // Create a file-like object from string to match backend expectation
    const blob = new Blob([ednaSequence], { type: "text/plain" });
    const formData = new FormData();
    formData.append("fasta", blob, "sequence.fasta");

    try {
      const res = await fetch(`${API_BASE}/api/blast`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      const json = await res.json();
      setEdnaResult(json);
      setEdnaStatus({ state: "success", message: "BLAST Complete" });
    } catch (err) {
      setEdnaStatus({ state: "error", message: `BLAST Failed: ${err.message}` });
    }
  }

  return (
    <div className="ai-lab-wrapper" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* --- Header & Status Bar --- */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#2d6a6a" }}>Marine AI Lab</h1>
        
        {/* Connection Status Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
           {pingStatus && (
              <span className={`badge ${pingStatus.state === 'success' ? 'badge-success' : 'badge-fail'}`} 
                    style={{ padding: "8px 16px", borderRadius: "20px", background: pingStatus.state === 'success' ? "#e6fffa" : "#ffe6e6", color: pingStatus.state === 'success' ? "#047857" : "#dc2626", display: "flex", alignItems: "center", gap: "5px" }}>
                 {pingStatus.state === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
                 {pingStatus.message}
              </span>
           )}
           <button onClick={testConnectivity} style={{ fontSize: "12px", textDecoration: "underline", border: "none", background: "none", cursor: "pointer" }}>Retry</button>
        </div>
      </header>

      {/* --- Mode Switcher --- */}
      <div className="mode-switcher" style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        <button 
          className={`mode-btn ${mode === 'otolith' ? 'active' : ''}`}
          onClick={() => setMode('otolith')}
          style={btnStyle(mode === 'otolith')}
        >
          <Activity size={18} /> Otolith Analysis
        </button>
        <button 
          className={`mode-btn ${mode === 'edna' ? 'active' : ''}`}
          onClick={() => setMode('edna')}
          style={btnStyle(mode === 'edna')}
        >
          <Dna size={18} /> eDNA Sequence BLAST
        </button>
      </div>

      {/* --- SCENARIO A: OTOLITH ANALYSIS --- */}
      {mode === 'otolith' && (
        <div className="otolith-container">
          
          <div className="card" style={cardStyle}>
            <div style={{ textAlign: "center", padding: "40px", border: "2px dashed #ccc", borderRadius: "12px", backgroundColor: "#f9fafb" }}>
              <Upload size={48} color="#9ca3af" style={{ marginBottom: "15px" }} />
              <h3>Upload Otolith Image</h3>
              <p style={{ color: "#6b7280", marginBottom: "20px" }}>Supports .jpg, .png</p>
              
              <input 
                type="file" 
                id="otolith-upload"
                accept="image/*" 
                onChange={handleOtolithUpload} 
                style={{ display: "none" }} 
              />
              <label htmlFor="otolith-upload" style={actionBtnStyle}>
                Choose File
              </label>

              {otolithFile && <p style={{ marginTop: "15px", fontWeight: "bold" }}>Selected: {otolithFile.name}</p>}
            </div>

            {/* Status Indicator */}
            {otolithStatus && (
               <div style={{ marginTop: "20px", padding: "15px", borderRadius: "8px", background: otolithStatus.state === "pending" ? "#eff6ff" : otolithStatus.state === "success" ? "#ecfdf5" : "#fef2f2" }}>
                  <strong>Status:</strong> {otolithStatus.message}
               </div>
            )}

            {/* Results Display */}
            {otolithResult && (
              <div className="results-area" style={{ marginTop: "30px" }}>
                <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Analysis Results</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
                   {/* Left: Raw Data Visualized */}
                   <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px" }}>
                      <h4>Metrics</h4>
                      <table style={{ width: "100%", textAlign: "left" }}>
                         <tbody>
                            {/* Dynamically mapping response keys if they exist */}
                            {Object.entries(otolithResult).map(([key, val]) => (
                               typeof val !== 'object' && (
                                  <tr key={key} style={{ borderBottom: "1px solid #ddd" }}>
                                     <td style={{ padding: "8px 0", color: "#555" }}>{key}</td>
                                     <td style={{ padding: "8px 0", fontWeight: "bold" }}>{val}</td>
                                  </tr>
                               )
                            ))}
                         </tbody>
                      </table>
                   </div>
                   
                   {/* Right: JSON Dump for Debugging */}
                   <div style={{ background: "#1f2937", color: "#a5f3fc", padding: "20px", borderRadius: "8px", overflow: "auto", maxHeight: "400px" }}>
                      <pre style={{ margin: 0, fontSize: "12px" }}>{JSON.stringify(otolithResult, null, 2)}</pre>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- SCENARIO B: eDNA ANALYSIS --- */}
      {mode === 'edna' && (
        <div className="edna-container">
           <div className="card" style={cardStyle}>
              <h2 style={{ marginBottom: "15px" }}>Sequence Input</h2>
              <textarea 
                className="edna-textarea"
                placeholder=">Sequence_1&#10;ATGCGTACGTAGCTAGCTAG..."
                value={ednaSequence}
                onChange={(e) => setEdnaSequence(e.target.value)}
                style={{ width: "100%", height: "150px", padding: "15px", fontFamily: "monospace", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "15px" }}
              ></textarea>
              
              <button 
                 onClick={handleEdnaBlast}
                 disabled={ednaStatus?.state === 'pending'}
                 style={actionBtnStyle}
              >
                 {ednaStatus?.state === 'pending' ? 'Running BLAST...' : 'Run BLAST Analysis'}
              </button>

              {/* Status Indicator */}
              {ednaStatus && (
                 <div style={{ marginTop: "20px", padding: "15px", borderRadius: "8px", background: ednaStatus.state === "pending" ? "#eff6ff" : ednaStatus.state === "success" ? "#ecfdf5" : "#fef2f2" }}>
                    <strong>Status:</strong> {ednaStatus.message}
                 </div>
              )}

              {/* Results Table */}
              {ednaResult && Array.isArray(ednaResult) && (
                 <div style={{ marginTop: "30px" }}>
                    <h3>BLAST Results</h3>
                    <div style={{ overflowX: "auto" }}>
                       <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                          <thead style={{ background: "#f3f4f6" }}>
                             <tr>
                                <th style={thStyle}>Query ID</th>
                                <th style={thStyle}>Subject ID</th>
                                <th style={thStyle}>Identity %</th>
                                <th style={thStyle}>E-Value</th>
                             </tr>
                          </thead>
                          <tbody>
                             {ednaResult.map((row, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                                   <td style={tdStyle}>{row.query_id}</td>
                                   <td style={tdStyle}>{row.subject_id}</td>
                                   <td style={tdStyle}>
                                      <span style={{ color: row.identity > 90 ? "green" : "orange", fontWeight: "bold" }}>
                                         {row.identity}%
                                      </span>
                                   </td>
                                   <td style={tdStyle}>{row.evalue}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
}

// --- Inline CSS Styles for Simplicity ---
const btnStyle = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  backgroundColor: active ? "#2d6a6a" : "#e5e7eb",
  color: active ? "white" : "#374151",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "all 0.2s"
});

const actionBtnStyle = {
  backgroundColor: "#2d6a6a",
  color: "white",
  padding: "10px 24px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "16px",
  display: "inline-block"
};

const cardStyle = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  border: "1px solid #f3f4f6"
};

const thStyle = { padding: "12px", textAlign: "left", fontSize: "14px", color: "#6b7280" };
const tdStyle = { padding: "12px", fontSize: "14px" };
