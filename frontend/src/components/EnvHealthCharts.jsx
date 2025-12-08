import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Bar
} from "recharts";

const CATEGORIES = {
  Biochemical: ["pH Level", "Dissolved Oxygen", "CO2 Concentration", "Total Alkalinity"],
  Ecological: ["Phytoplankton", "Zooplankton", "Chlorophyll-a", "P:Z Ratio", "Phyto vs Nutrients"],
  Human Impact: ["Pollution Index", "Plastic Debris", "Oil Contamination", "Heavy Metals", "Pesticide Residues"],
  Physical Oceanography: ["SST", "Salinity", "Water Depth", "Current Velocity", "Wave Height", "Thermocline Depth", "Upwelling Intensity", "Monsoon Intensity"],
  Climate Change: ["SST Anomaly", "El Nino Index", "Ammonium"],
  Nutrient Dynamics: ["Nitrate", "Phosphate", "Silicate", "N:P Ratio"]
};

const API_BASE = "http://localhost:8080";

export default function EnvHealthCharts({ filters }) {
  const [selectedParams, setSelectedParams] = useState(["pH Level", "SST"]);
  const [timeSeries, setTimeSeries] = useState({});

  // Fetch parameter time-series from backend
  const fetchParam = async (param) => {
    const url = `${API_BASE}/api/oceanographic/data?region=${filters.location}&parameter=${encodeURIComponent(param)}`;
    const resp = await fetch(url);
    const json = await resp.json();
    return json.map((d) => ({
      date: d.timestamp,
      value: d.value,
    }));
  };

  // Fetch whenever filters or selected params change
  useEffect(() => {
    const load = async () => {
      const data = {};
      for (const p of selectedParams) {
        data[p] = await fetchParam(p);
      }
      setTimeSeries(data);
    };
    load();
  }, [filters, selectedParams]);

  const toggleParam = (p) => {
    if (selectedParams.includes(p))
      setSelectedParams(selectedParams.filter((x) => x !== p));
    else if (selectedParams.length < 2)
      setSelectedParams([...selectedParams, p]);
  };

  // Merge timelines into a single dataset for Recharts
  const merged = [];
  const len = Math.max(
    ...(selectedParams.map((p) => timeSeries[p]?.length || 0))
  );

  for (let i = 0; i < len; i++) {
    const row = {};
    for (const p of selectedParams) {
      if (timeSeries[p] && timeSeries[p][i]) {
        row.date = timeSeries[p][i].date;
        row[p] = timeSeries[p][i].value;
      }
    }
    merged.push(row);
  }

  return (
    <div className="space-y-8">

      {/* PARAMETER TIME-SERIES */}
      <div className="flex flex-col lg:flex-row gap-6 h-[700px]">

        {/* Checklist */}
        <div className="w-full lg:w-1/4 bg-white p-6 rounded-3xl border shadow-sm overflow-y-auto">
          <h3 className="font-bold text-slate-900 mb-4">Parameter Checklist</h3>

          {Object.entries(CATEGORIES).map(([cat, items]) => (
            <div key={cat}>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">{cat}</h4>
              {items.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-slate-50 rounded"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      selectedParams.includes(item)
                        ? "bg-cyan-500 border-cyan-500"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedParams.includes(item) && (
                      <span className="text-white text-[10px] font-bold">✓</span>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    onChange={() => toggleParam(item)}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      selectedParams.includes(item)
                        ? "text-cyan-700"
                        : "text-slate-600"
                    }`}
                  >
                    {item}
                  </span>
                </label>
              ))}
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="w-full lg:w-3/4 bg-white p-6 rounded-3xl border shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Parameter Time-Series</h3>
          <p className="text-xs text-slate-500 mb-6">
            Comparing: {selectedParams.join(" vs ")} in {filters.location}
          </p>

          <div className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={merged}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedParams.map((p, i) => (
                  <Line
                    key={p}
                    type="monotone"
                    dataKey={p}
                    strokeWidth={3}
                    stroke={i === 0 ? "#06b6d4" : "#10b981"}
                    name={p}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KEEP OTHER CHARTS (Contaminants, Diversity etc.) – they still work with your backend later */}
    </div>
  );
}


      {/* 2. SPECIFIC ENV HEALTH CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Contaminant Composition */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-80">
          <h4 className="font-bold text-slate-900 mb-4">Contaminant Composition</h4>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={contaminantData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {contaminantData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* HAB Frequency */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-80">
          <h4 className="font-bold text-slate-900 mb-4">HAB Frequency (Count/Year)</h4>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={habData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Bloom Events" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Richness vs Diversity */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-80">
          <h4 className="font-bold text-slate-900 mb-4">Richness (S) vs Diversity (H')</h4>
          <ResponsiveContainer width="100%" height="85%">
            <ComposedChart data={diversityData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
              <Tooltip />
              <Bar yAxisId="left" dataKey="richness" fill="#0ea5e9" barSize={20} radius={[4, 4, 0, 0]} name="Richness (S)" />
              <Line yAxisId="right" type="monotone" dataKey="shannon" stroke="#f59e0b" strokeWidth={2} name="Shannon (H')" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default EnvHealthCharts;
