// src/pages/SpeciesDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Fish } from "lucide-react";
import "./SpeciesDetail.css";

/**
 * SpeciesDetail - fetches /api/species/:id and displays whatever the backend returns.
 *
 * Behavior:
 * - If the response is { species_id, upload_id, data }, we use response.data as the record.
 * - If the response is already a flattened object, we use it directly.
 * - No mock data, no extra buttons, no tabs. Only displays values from backend JSON.
 */

const FieldRow = ({ label, value }) => {
  // Render primitive values directly; objects/arrays as formatted JSON
  const isPrimitive =
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean";

  return (
    <div className="flex justify-between items-start py-2.5 border-b border-slate-100 last:border-0 px-3">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <div className="text-sm text-right">
        {isPrimitive ? (
          <span className="font-bold text-slate-900">{String(value ?? "")}</span>
        ) : (
          <pre className="text-xs p-2 bg-slate-50 rounded-md overflow-auto whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

const SpeciesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null); // the object derived from backend (data or whole response)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: pick image from many possible keys
  const pickImage = (obj) => {
    if (!obj) return null;
    // image_urls (array)
    if (obj.image_urls) {
      if (Array.isArray(obj.image_urls) && obj.image_urls.length > 0) return obj.image_urls[0];
      if (typeof obj.image_urls === "string") {
        try {
          const parsed = JSON.parse(obj.image_urls);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        } catch {
          const parts = obj.image_urls.split(",");
          if (parts.length > 0) return parts[0].trim();
        }
      }
    }
    // other possible fields
    if (obj.image_url) return obj.image_url;
    if (obj.thumbnail_url) return obj.thumbnail_url;
    if (obj.raw_image_url) return obj.raw_image_url;
    if (obj.processed_image_url) return obj.processed_image_url;
    return null;
  };

  // Helper: get common & scientific names from possible keys
  const pickName = (obj) => {
    if (!obj) return { common: "", scientific: "" };
    const common = obj.vernacularName || obj.vernacularname || obj.common_name || obj.commonName || "";
    const scientific = obj.scientific_name || obj.scientificName || obj.scientific || "";
    return { common, scientific };
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/species/${id}`, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        const json = await res.json();

        // If structure is { species_id, upload_id, data }, use data
        // Otherwise use the object returned
        let dataObj = null;
        if (json && (json.data || json.Data)) {
          dataObj = json.data || json.Data;
        } else {
          dataObj = json;
        }

        // Ensure dataObj is an object
        if (typeof dataObj !== "object" || dataObj === null) {
          dataObj = {};
        }

        setRecord(dataObj);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center p-6">Loading species...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="text-red-600 font-semibold">Error: {error}</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen p-6">
        <div className="text-slate-600">No data available for this species.</div>
      </div>
    );
  }

  const { common, scientific } = pickName(record);
  const imageUrl = pickImage(record);

  // Build taxonomy object if available (prefer typical keys)
  const taxonomyKeys = ["kingdom", "phylum", "class", "order", "family", "genus", "species"];
  const taxonomy = {};
  let hasTaxonomy = false;
  taxonomyKeys.forEach((k) => {
    if (record[k]) {
      taxonomy[k] = record[k];
      hasTaxonomy = true;
    } else if (record[k.toLowerCase()]) {
      taxonomy[k] = record[k.toLowerCase()];
      hasTaxonomy = true;
    }
  });

  // Decide leftover keys to display (exclude taxonomy + image + names)
  const excluded = new Set([
    ...taxonomyKeys,
    "image_urls",
    "image_url",
    "thumbnail_url",
    "raw_image_url",
    "processed_image_url",
    "vernacularName",
    "vernacularname",
    "common_name",
    "commonName",
    "scientific_name",
    "scientificName",
  ]);

  const otherKeys = Object.keys(record).filter((k) => !excluded.has(k));

  return (
    <div className="min-h-screen bg-slate-50 pb-12 p-6 font-sans text-slate-800">
      {/* Minimal header with back link */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-cyan-600">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* HERO */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/3">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt={common || scientific || "species image"} className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-400">
                  <Fish size={48} />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{common || scientific || `Species ${id}`}</h1>
            {scientific && <p className="text-sm italic text-slate-500 mt-1">{scientific}</p>}
            {/* Simple description if present */}
            {record.description && <p className="mt-4 text-sm text-slate-700 bg-slate-50 p-3 rounded-md">{record.description}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TAXONOMY */}
        {hasTaxonomy && (
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Classification</h3>
            <div className="space-y-2">
              {Object.entries(taxonomy).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="capitalize text-xs font-bold text-slate-400">{k}</span>
                  <span className="text-sm font-semibold text-slate-800">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OTHER FIELDS */}
        <div className={hasTaxonomy ? "lg:col-span-8" : "lg:col-span-12"}>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Details</h3>

            {otherKeys.length === 0 && <div className="text-sm text-slate-500">No additional fields available.</div>}

            <div className="space-y-2">
              {otherKeys.map((key) => (
                <FieldRow key={key} label={key} value={record[key]} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeciesDetail;
