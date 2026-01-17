import React, { useState } from "react";

const SearchBar = ({ onSearch, endpoint }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Replace this URL with your actual endpoint
  const ENDPOINT = endpoint || "https://your-api.com/search?q=";

  const fetchSuggestions = async (q) => {
    if (!q) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${ENDPOINT}${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.results || []);
    } catch (e) {
      setSuggestions([]);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true);
    fetchSuggestions(value);
  };

  const handleSelect = (item) => {
    setQuery(item);
    setShowDropdown(false);
    if (onSearch) onSearch(item);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (onSearch) onSearch(query);
  };

  return (
    <div className="w-full max-w-md mx-auto mb-6 relative">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none"
          placeholder="Search for a location or activity..."
          value={query}
          onChange={handleChange}
          onFocus={() => setShowDropdown(true)}
          autoComplete="off"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition"
        >
          Search
        </button>
      </form>
      {showDropdown && (suggestions.length > 0 || loading) && (
        <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow z-10 max-h-60 overflow-y-auto">
          {loading && (
            <li className="px-4 py-2 text-gray-400">Loading...</li>
          )}
          {suggestions.map((item, idx) => (
            <li
              key={idx}
              className="px-4 py-2 cursor-pointer hover:bg-purple-100"
              onMouseDown={() => handleSelect(item.name || item)}
            >
              {item.name || item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;