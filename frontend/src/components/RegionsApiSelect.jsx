import React, { useEffect, useState } from "react";

const RegionsApiSelect = ({ value, onChange, className }) => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegions() {
      try {
        const res = await fetch("/api/filters/regions"); // <-- calls your Go backend
        const data = await res.json();
        setRegions(data);
      } catch (err) {
        console.error("Error fetching regions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRegions();
  }, []);

  if (loading) {
    return (
      <select className={className} disabled>
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <select
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {regions.map((region, idx) => (
        <option key={idx} value={region}>
          {region}
        </option>
      ))}
    </select>
  );
};

export default RegionsApiSelect;
