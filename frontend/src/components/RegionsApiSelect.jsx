import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

const RegionsApiSelect = ({ value, onChange, className, placeholder = "Select Region..." }) => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchRegions() {
      try {
        // Matches main.go: http.HandleFunc("/api/filters/regions", getRegions)
        const res = await fetch("/api/filters/regions");
        
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        
        if (isMounted) {
          // Ensure data is an array before setting
          setRegions(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching regions:", err);
        if (isMounted) {
            setError(true);
            setLoading(false);
        }
      }
    }

    fetchRegions();

    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <select className="w-full opacity-50 cursor-not-allowed bg-slate-100 border border-slate-200 text-slate-500 rounded-lg p-2 appearance-none" disabled>
          <option>Loading regions...</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 size={16} className="animate-spin text-slate-400"/>
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className={`relative ${className}`}>
          <select className="w-full border-red-300 text-red-500 bg-red-50 rounded-lg p-2" disabled>
            <option>Error loading regions</option>
          </select>
          <AlertCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400"/>
        </div>
    );
  }

  return (
    <div className="relative w-full">
      <select
        className={`${className} appearance-none cursor-pointer`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {regions.map((region, idx) => (
          <option key={idx} value={region}>
            {region}
          </option>
        ))}
      </select>
      {/* Custom arrow could go here if you wrapped it in a container, 
          but native select + styling usually works best for forms */}
    </div>
  );
};

export default RegionsApiSelect;
