import React, { useState, useEffect } from "react";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  showButton = true,
  endpoint,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use the endpoint prop or fallback to a default
  const ENDPOINT = endpoint || "https://your-api.com/search?q=";

  useEffect(() => {
    if (!value) {
      setSuggestions([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${ENDPOINT}${encodeURIComponent(value)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setSuggestions(data.results || []);
        setError(null);
      })
      .catch(() => {
        setSuggestions([]);
        setError("Failed to fetch suggestions.");
      })
      .finally(() => setLoading(false));
  }, [value, ENDPOINT]);

  const handleChange = (e) => {
    onChange(e.target.value);
    setShowDropdown(true);
  };

  const handleSelect = (item) => {
    onChange(item.name || item);
    setShowDropdown(false);
  };

  return (
    <div className="w-full max-w-xs relative">
      <input
        type="text"
        className="w-full px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={() => setShowDropdown(true)}
        autoComplete="off"
      />
      {showButton && (
        <button
          type="submit"
          className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition absolute right-0 top-0 h-full"
        >
          Search
        </button>
      )}
      {showDropdown && (suggestions.length > 0 || loading || error) && (
        <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow z-10 max-h-60 overflow-y-auto">
          {loading && (
            <li className="px-4 py-2 text-gray-400">Loading...</li>
          )}
          {error && (
            <li className="px-4 py-2 text-red-500">{error}</li>
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