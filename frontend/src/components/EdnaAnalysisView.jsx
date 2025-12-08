import React, { useState } from 'react';
import { Dna, Check, ExternalLink, Search, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const EdnaAnalysisView = () => {
  const [sequence, setSequence] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBlastAnalysis = async () => {
    if (!sequence.trim()) return;
    
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Sending the DNA sequence to the Go backend
      const response = await fetch('/api/blast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sequence: sequence }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data || []); // Assuming backend returns an array of matches
    } catch (err) {
      console.error("BLAST Error:", err);
      setError("Failed to analyze sequence. Please check the backend connection or sequence format.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine badge color based on confidence score
  const getConfidenceBadge = (score) => {
    const val = parseFloat(score);
    if (val >= 98) return 'bg-green-100 text-green-700';
    if (val >= 90) return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & INPUT SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Dna size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">eDNA Sequence BLAST</h2>
              <p className="text-sm text-slate-500">Paste FASTA or raw nucleotide sequence to identify species.</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <textarea
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
            placeholder=">Sequence_1&#10;ATGCGTACGTAGCTAGCTAG..."
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            disabled={loading}
          />
          <div className="absolute bottom-4 right-4">
            <button 
              onClick={handleBlastAnalysis}
              disabled={loading || !sequence}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm text-white shadow-md transition-all
                ${loading || !sequence ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'}`}
            >
              {loading ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>}
              {loading ? 'Analyzing...' : 'Run BLAST'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      {/* RESULTS TABLE */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-slate-800">Analysis Results</h3>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Check size={14}/> {results.length} Matches Found
            </span>
          </div>

          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-bold">Species Match</th>
                  <th className="p-4 text-center font-bold">Identity (%)</th>
                  <th className="p-4 text-center font-bold">E-Value</th>
                  <th className="p-4 text-center font-bold">Accession ID</th>
                  <th className="p-4 text-right font-bold">Details</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{result.species || result.scientific_name || "Unknown Species"}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{result.common_name}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getConfidenceBadge(result.confidence || result.identity)}`}>
                        {result.confidence || result.identity}%
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-xs text-slate-600">
                      {result.e_value || result.eValue || "0.0"}
                    </td>
                    <td className="p-4 text-center font-mono text-xs text-indigo-600 bg-indigo-50/50 rounded mx-auto w-fit px-2 py-1">
                      {result.taxonomy_id || result.accession || "N/A"}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50">
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && results.length === 0 && !error && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Dna size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-slate-500 font-medium">No analysis data yet</h3>
          <p className="text-sm text-slate-400 mt-1">Input a sequence above to see species matches</p>
        </div>
      )}

    </div>
  );
};

export default EdnaAnalysisView;
