import React, { useState, useEffect } from "react";
import { Upload, Activity, Dna, CheckCircle, AlertTriangle, FileImage, RefreshCw, Maximize2, Crosshair, Ruler, Layers, Image as ImageIcon } from "lucide-react";

// --- Configuration ---
const API_BASE = "http://localhost:8080";

// NEW: This matches the folder name in your screenshot "batch_results"
// Your backend must serve the files at this endpoint.
const STATIC_FILE_ROUTE = "/batch_results"; 

export default function AIAnalysisLab() {
  const [mode, setMode] = useState("otolith"); // 'otolith' or 'edna'
  
  // --- State for System (Background only) ---
  const [pingStatus, setPingStatus] = useState(null);

  // --- State for Otolith ---
  const [otolithFile, setOtolithFile] = useState(null);
  const [otolithResult, setOtolithResult] = useState(null);
  const [otolithStatus, setOtolithStatus] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // --- State for eDNA ---
  const [ednaSequence, setEdnaSequence] = useState("");
  const [ednaResult, setEdnaResult] = useState(null);
  const [ednaStatus, setEdnaStatus] = useState(null);

  // --- 1. System Connectivity (Background) ---
  async function testConnectivity() {
    try {
      const res = await fetch(`${API_BASE}/api/species`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setPingStatus({ state: "success", message: "Connected" });
    } catch (e) {
      setPingStatus({ state: "error", message: "Connection Failed" });
    }
  }

  useEffect(() => { testConnectivity(); }, []);

  // --- 2. Otolith Logic ---
  const processFile = async (file) => {
    if (!file) return;
    setOtolithFile(file);
    setOtolithStatus({ state: "pending", message: "Analyzing..." });
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
          setOtolithResult(JSON.parse(text));
        } catch {
          setOtolithResult({ raw_text: text }); // Fallback
        }
        setOtolithStatus({ state: "success", message: "Done" });
      } else {
        setOtolithStatus({ state: "error", message: "Server Error" });
      }
    } catch (err) {
      setOtolithStatus({ state: "error", message: "Network Error" });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    processFile(e.target.files[0]);
  };

  const resetOtolith = () => {
    setOtolithFile(null);
    setOtolithResult(null);
    setOtolithStatus(null);
  };

  // --- 3. eDNA Logic ---
  async function handleEdnaBlast() {
    if (!ednaSequence) return alert("Please enter a sequence first.");
    setEdnaStatus({ state: "pending", message: "Running BLAST..." });
    setEdnaResult(null);

    const blob = new Blob([ednaSequence], { type: "text/plain" });
    const formData = new FormData();
    formData.append("fasta", blob, "sequence.fasta");

    try {
      const res = await fetch(`${API_BASE}/api/blast`, { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setEdnaResult(json);
      setEdnaStatus({ state: "success", message: "Complete" });
    } catch (err) {
      setEdnaStatus({ state: "error", message: `Failed: ${err.message}` });
    }
  }

  // --- Helper to render confidence bars ---
  const ConfidenceBar = ({ value }) => {
    const pct = Math.round(value * 100);
    const color = pct > 90 ? "#10b981" : pct > 70 ? "#f59e0b" : "#ef4444";
    return (
      <div style={{ marginTop: "5px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "2px", color: "#6b7280" }}>
          <span>Confidence</span>
          <span>{pct}%</span>
        </div>
        <div style={{ width: "100%", height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.5s ease" }}></div>
        </div>
      </div>
    );
  };

  // --- UPDATED: Helper for Image Source to handle filenames from local path ---
  const getImageSrc = (imgData) => {
    if (!imgData) return "";

    // 1. If it's already a full URL (http/https) or a Blob/Data URL, return as is
    if (imgData.startsWith("http") || imgData.startsWith("blob:") || imgData.startsWith("data:")) {
      return imgData;
    }

    // 2. If it's a filename (e.g., "otolith_001_overlay.png" or "E:\...\file.png")
    // We strip the path to get just the filename, then ask the server for it.
    const filename = imgData.split(/[/\\]/).pop();
    
    // Construct URL: http://localhost:8080/batch_results/filename.png
    const cleanBase = API_BASE.replace(/\/+$/, '');
    const cleanRoute = STATIC_FILE_ROUTE.replace(/\/+$/, '');
    
    return `${cleanBase}${cleanRoute}/${filename}`;
  };

  return (
    <div style={{ padding: "20px 20px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      
      {/* --- Mode Switcher --- */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px", justifyContent: "center" }}>
        <button 
          onClick={() => setMode('otolith')}
          style={pillBtnStyle(mode === 'otolith')}
        >
          <Activity size={18} /> Otolith Analysis
        </button>
        <button 
          onClick={() => setMode('edna')}
          style={pillBtnStyle(mode === 'edna')}
        >
          <Dna size={18} /> eDNA Sequence BLAST
        </button>
      </div>

      {/* --- SCENARIO A: OTOLITH --- */}
      {mode === 'otolith' && (
        <div style={{ animation: "fadeIn 0.3s ease-in-out" }}>
          
          {/* 1. Upload View */}
          {!otolithResult && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: isDragging ? "2px dashed #2d6a6a" : "2px dashed #d1d5db",
                backgroundColor: isDragging ? "#f0fdfa" : "#f9fafb",
                borderRadius: "20px",
                padding: "80px 40px",
                textAlign: "center",
                transition: "all 0.2s",
                cursor: "pointer",
                position: "relative"
              }}
            >
              <input 
                type="file" 
                id="otolith-upload"
                accept="image/*" 
                onChange={handleFileSelect} 
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} 
              />
              <div style={{ pointerEvents: "none" }}>
                <div style={{ background: "#e0f2f1", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                   <Upload size={32} color="#2d6a6a" />
                </div>
                <h3 style={{ margin: "0 0 10px 0", color: "#1f2937" }}>Upload Otolith Image</h3>
                <p style={{ color: "#6b7280", margin: 0 }}>Drag & drop or click to browse</p>
                <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "10px" }}>Supports JPG, PNG</p>
              </div>

              {otolithStatus?.state === 'pending' && (
                 <div style={{ marginTop: "20px", color: "#2d6a6a", fontWeight: "bold" }}>Processing Image...</div>
              )}
              {otolithStatus?.state === 'error' && (
                 <div style={{ marginTop: "20px", color: "#ef4444" }}>{otolithStatus.message}</div>
              )}
            </div>
          )}

          {/* 2. Results View */}
          {otolithResult && (
            <div>
               {/* Controls */}
               <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                  <button onClick={resetOtolith} style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1px solid #d1d5db", padding: "8px 16px", borderRadius: "30px", cursor: "pointer", color: "#4b5563", fontSize: "13px" }}>
                    <RefreshCw size={14}/> Analyze Another
                  </button>
               </div>

               {/* MAIN LAYOUT: Split into Left (Data) and Right (Images) */}
               <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "flex-start" }}>
                  
                  {/* --- LEFT COLUMN: DATA CARDS --- */}
                  <div style={{ flex: "2", minWidth: "300px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    {/* Data Row 1: Species & Age */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                        {/* Species ID */}
                        {otolithResult.species && (
                          <div style={cardStyle}>
                             <div style={cardHeaderStyle}>
                               <Crosshair size={20} color="#2d6a6a" /> 
                               <span style={cardTitleStyle}>Species ID</span>
                             </div>
                             <div style={{ textAlign: "center", padding: "10px 0" }}>
                               <h2 style={{ margin: "0 0 5px 0", color: "#111827", fontSize: "24px" }}>
                                 {otolithResult.species.name}
                               </h2>
                               <ConfidenceBar value={otolithResult.species.confidence} />
                             </div>
                          </div>
                        )}

                        {/* Age Analysis */}
                        {otolithResult.age && (
                          <div style={cardStyle}>
                             <div style={cardHeaderStyle}>
                               <Activity size={20} color="#7c3aed" /> 
                               <span style={cardTitleStyle}>Age Estimation</span>
                             </div>
                             <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginTop: "10px" }}>
                                 <div style={{ textAlign: "center" }}>
                                    <span style={{ display: "block", fontSize: "36px", fontWeight: "bold", color: "#7c3aed" }}>
                                      {otolithResult.age.estimated_age_years}
                                    </span>
                                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Years Old</span>
                                 </div>
                                 <div style={{ height: "40px", width: "1px", background: "#e5e7eb" }}></div>
                                 <div style={{ textAlign: "center" }}>
                                    <span style={{ display: "block", fontSize: "24px", fontWeight: "bold", color: "#374151" }}>
                                      {otolithResult.age.ring_count}
                                    </span>
                                    <span style={{ fontSize: "12px", color: "#6b7280" }}>Rings Detected</span>
                                 </div>
                             </div>
                             <div style={{ marginTop: "15px" }}>
                               <ConfidenceBar value={otolithResult.age.confidence} />
                             </div>
                          </div>
                        )}
                    </div>

                    {/* Data Row 2: Morphometrics (Full Width of Left Column) */}
                    {otolithResult.morphometrics && (
                       <div style={cardStyle}>
                          <div style={cardHeaderStyle}>
                             <Ruler size={20} color="#059669" />
                             <span style={cardTitleStyle}>Morphometrics</span>
                          </div>
                          
                          {/* Fixed 3-column grid to maintain specific order */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginTop: "15px" }}>
                             {/* Row 1 */}
                             <MetricBox label="Area mm²" value={otolithResult.morphometrics.area} />
                             <MetricBox label="Perimeter mm" value={otolithResult.morphometrics.perimeter} />
                             <MetricBox label="Aspect Ratio" value={otolithResult.morphometrics.aspect_ratio} />

                             {/* Row 2 */}
                             <MetricBox label="Length mm" value={otolithResult.morphometrics.length} />
                             <MetricBox label="Width mm" value={otolithResult.morphometrics.width} />
                             <MetricBox label="Circularity" value={otolithResult.morphometrics.circularity} />
                          </div>
                       </div>
                    )}
                  </div>

                  {/* --- RIGHT COLUMN: VISUAL OUTPUTS --- */}
                  {otolithResult.output_files && (
                    <div style={{ flex: "1", minWidth: "300px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        
                        {/* Overlay Image */}
                        {otolithResult.output_files.overlay && (
                           <div style={cardStyle}>
                              <div style={cardHeaderStyle}>
                                 <Layers size={20} color="#ea580c" />
                                 <span style={cardTitleStyle}>Analysis Overlay</span>
                              </div>
                              <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb", background: "#f9fafb" }}>
                                 <img 
                                    src={getImageSrc(otolithResult.output_files.overlay)} 
                                    alt="Analysis Overlay" 
                                    style={{ width: "100%", height: "auto", display: "block" }} 
                                    // UPDATED: Correct onError handler for the Overlay image
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src = "http://localhost:8080/api/images/otoliths/" + otolithResult.output_files.overlay.split(/[/\\]/).pop(); 
                                    }}
                                 />
                              </div>
                              <div style={{fontSize: "11px", color: "#9ca3af", marginTop: "8px", textAlign: "center"}}>
                                 Source: {getImageSrc(otolithResult.output_files.overlay).split('/').pop()}
                              </div>
                           </div>
                        )}

                        {/* Profile Image */}
                        {otolithResult.output_files.profile && (
                           <div style={cardStyle}>
                              <div style={cardHeaderStyle}>
                                 <ImageIcon size={20} color="#2563eb" />
                                 <span style={cardTitleStyle}>Intensity Profile</span>
                              </div>
                              <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb", background: "#f9fafb" }}>
                                 <img 
                                    src={getImageSrc(otolithResult.output_files.profile)} 
                                    alt="Intensity Profile" 
                                    style={{ width: "100%", height: "auto", display: "block" }} 
                                    // UPDATED: Correct onError handler for the Profile image
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src = "http://localhost:8080/api/images/otoliths/" + otolithResult.output_files.profile.split(/[/\\]/).pop(); 
                                    }}
                                 />
                              </div>
                           </div>
                        )}
                    </div>
                  )}

               </div>
            </div>
          )}
        </div>
      )}

      {/* --- SCENARIO B: eDNA --- */}
      {mode === 'edna' && (
         <div style={cardStyle}>
            <textarea 
              placeholder=">Paste FASTA sequence here..."
              value={ednaSequence}
              onChange={(e) => setEdnaSequence(e.target.value)}
              style={{ width: "100%", height: "150px", padding: "15px", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "20px", fontFamily: "monospace", fontSize: "14px", resize: "vertical" }}
            ></textarea>
            
            <button onClick={handleEdnaBlast} disabled={ednaStatus?.state === 'pending'} style={{ ...pillBtnStyle(true), width: "100%", justifyContent: "center" }}>
               {ednaStatus?.state === 'pending' ? 'Analyzing...' : 'Run BLAST Analysis'}
            </button>

            {ednaResult && (
               <div style={{ marginTop: "30px" }}>
                  <h4 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Results</h4>
                  <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", fontSize: "14px", textAlign: "left", borderCollapse: "collapse" }}>
                         <thead>
                            <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                               <th style={{ padding: "10px" }}>Subject ID</th>
                               <th style={{ padding: "10px" }}>Identity</th>
                               <th style={{ padding: "10px" }}>E-Value</th>
                            </tr>
                         </thead>
                         <tbody>
                            {Array.isArray(ednaResult) && ednaResult.map((r, i) => (
                               <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                                  <td style={{ padding: "10px" }}>{r.subject_id}</td>
                                  <td style={{ padding: "10px", color: r.identity > 90 ? "green" : "orange", fontWeight: "bold" }}>{r.identity}%</td>
                                  <td style={{ padding: "10px" }}>{r.evalue}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                  </div>
               </div>
            )}
         </div>
      )}

    </div>
  );
}

// --- Sub-component for Metrics ---
const MetricBox = ({ label, value }) => {
    if (value === undefined || value === null) return null;
    return (
        <div style={{ background: "#f9fafb", padding: "12px", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.5px", marginBottom: "4px" }}>
            {label}
            </div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
            {typeof value === 'number' ? value.toFixed(2) : value}
            </div>
        </div>
    );
};

// --- Styles ---

const pillBtnStyle = (isActive) => ({
  background: isActive ? "#2d6a6a" : "#e5e7eb",
  color: isActive ? "white" : "#4b5563",
  border: "none",
  padding: "12px 24px",
  borderRadius: "9999px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s"
});

const cardStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "25px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  border: "1px solid #f3f4f6",
  height: "fit-content"
};

const cardHeaderStyle = {
  display: "flex", 
  alignItems: "center", 
  gap: "10px", 
  marginBottom: "15px",
  paddingBottom: "10px",
  borderBottom: "1px solid #f3f4f6"
};

const cardTitleStyle = {
  fontWeight: "600",
  color: "#374151",
  fontSize: "16px"
};