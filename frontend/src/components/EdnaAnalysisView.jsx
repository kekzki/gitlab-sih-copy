import React from 'react';
import { Dna, Check, ExternalLink } from 'lucide-react';

const mockEdnaResults = [
  {
    id: 1,
    species: 'Thunnus albacares (Yellowfin Tuna)',
    confidence: 99.8,
    eValue: '0.0',
    taxonomyId: '#88219'
  },
  {
    id: 2,
    species: 'Thunnus obesus (Bigeye Tuna)',
    confidence: 94.2,
    eValue: '2e-145',
    taxonomyId: '#88220'
  },
  {
    id: 3,
    species: 'Katsuwonus pelamis (Skipjack Tuna)',
    confidence: 91.5,
    eValue: '8e-132',
    taxonomyId: '#88221'
  }
];

const EdnaAnalysisView = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">eDNA Sequence BLAST Results</h2>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><Check size={14}/> Top Matches</span>
      </div>

      <div className="overflow-x-auto bg-slate-50 rounded-2xl border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs text-slate-500 uppercase">
            <tr>
              <th className="p-4">Species Match</th>
              <th className="p-4 text-center">Confidence</th>
              <th className="p-4 text-center">E-Value</th>
              <th className="p-4 text-center">Taxonomy ID</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockEdnaResults.map(result => (
              <tr key={result.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-100/50">
                <td className="p-4 font-bold text-slate-800">{result.species}</td>
                <td className="p-4 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${result.confidence > 95 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>{result.confidence}%</span></td>
                <td className="p-4 text-center font-mono text-slate-600">{result.eValue}</td>
                <td className="p-4 text-center font-mono text-slate-500">{result.taxonomyId}</td>
                <td className="p-4 text-right"><button className="text-cyan-600 hover:text-cyan-800 font-semibold flex items-center gap-1 ml-auto">View <ExternalLink size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EdnaAnalysisView;