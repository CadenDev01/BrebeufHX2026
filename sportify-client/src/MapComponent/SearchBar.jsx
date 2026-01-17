import { useState, useEffect, useRef } from 'react';
import { makeAuthenticatedRequest } from '../utils/api';

const AutocompleteSearchBar = ({ 
  value, 
  onChange, 
  placeholder, 
  searchField // 'sport', 'city', or 'sportLocation'
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    if (!value || value.trim().length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        
        // Fetch all data
        const res = await makeAuthenticatedRequest("/api/search", {
          method: "POST",
          body: JSON.stringify({}),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Search failed");

        const data = await res.json();
        
        // Filter based on the specific field and query
        const queryLower = value.toLowerCase();
        const matches = new Set();

        data.forEach(item => {
          let fieldValue = '';
          
          if (searchField === 'sport') {
            fieldValue = item.sport;
          } else if (searchField === 'city') {
            fieldValue = item.city;
          } else if (searchField === 'sportLocation') {
            fieldValue = item.sport_location || item.sportLocation || item.venue;
          }

          // Check if field value contains the query
          if (fieldValue && fieldValue.toLowerCase().includes(queryLower)) {
            matches.add(fieldValue);
          }
        });

        // Convert Set to array and sort
        const uniqueSuggestions = Array.from(matches)
          .sort()
          .slice(0, 10); // Limit to 10 suggestions

        setSuggestions(uniqueSuggestions);
        setShowDropdown(uniqueSuggestions.length > 0);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Search error:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce for 300ms

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [value, searchField]);

  const handleSelect = (suggestion) => {
    onChange(suggestion);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setShowDropdown(true);
  };

  return (
    <div className="flex-1 relative" ref={dropdownRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => value && suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 text-white bg-slate-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
        autoComplete="off"
      />
      
      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Dropdown Suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto z-[9999]">
          {suggestions.map((suggestion, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(suggestion)}
              className="px-4 py-2 hover:bg-purple-100 cursor-pointer text-black border-b border-gray-100 last:border-b-0 transition-colors"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteSearchBar;