import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const options = ["All", "Public", "Private"];
const TEAL_BASE = "bg-[rgb(45,106,106)]";
const TEAL_TEXT = "text-[rgb(45,106,106)]";
const INPUT_BASE =
  "w-full px-4 py-2 border rounded-md focus:ring-1 focus:ring-[rgb(45,106,106)]";

function CustomStatusFilter({ statusFilter, setStatusFilter }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleSelect = (option) => {
    setStatusFilter(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full md:w-auto" ref={dropdownRef}>
      {/* --- Custom Dropdown Button (mimics the input field) --- */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${INPUT_BASE} flex items-center justify-between text-left transition-shadow ${
          isOpen ? "shadow-md ring-1 ring-[rgb(45,106,106)]" : ""
        }`}
      >
        <span>Status: {statusFilter}</span>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* --- Dropdown Menu --- */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                statusFilter === option
                  ? `${TEAL_BASE} text-white font-semibold`
                  : "text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => handleSelect(option)}
            >
              Status: {option}
              {statusFilter === option && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomStatusFilter;
