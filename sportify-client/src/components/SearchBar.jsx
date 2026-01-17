// import React, { useState, useEffect } from "react";

// /**
//  * SearchBar component for Sportify.
//  * Provides a text input with optional autocomplete suggestions from an API endpoint.
//  * Can be used as a filter/search input with dropdown suggestions and error handling.
//  *
//  * @component
//  * @param {string} value - The current value of the input.
//  * @param {function} onChange - Handler to update the input value.
//  * @param {string} [placeholder="Search..."] - Placeholder text for the input.
//  * @param {boolean} [showButton=true] - Whether to show the search button.
//  * @param {string} [endpoint] - API endpoint for fetching suggestions.
//  * @example
//  * <SearchBar value={value} onChange={setValue} placeholder="Search for a venue..." endpoint="/api/venues?q=" />
//  */
// const SearchBar = ({
//   value,
//   onChange,
//   placeholder = "Search...",
//   showButton = true,
//   // searchFields = ["city"],
//   // getBody = (value) => ({ city: value.toLowerCase(), limit: 20 }),
// }) => {
//   // const [suggestions, setSuggestions] = useState([]);
//   // const [showDropdown, setShowDropdown] = useState(false);
//   // const [loading, setLoading] = useState(false);
//   // const [error, setError] = useState(null);

  
//   // useEffect(() => {
//   //   if (!value || value.trim().length === 0) {
//   //     setSuggestions([]);
//   //     setError(null);
//   //     return;
//   //   }

//   //   const controller = new AbortController();

//   //   const fetchSuggestions = async () => {
//   //     try {
//   //       setLoading(true);
//   //       setError(null);

//   //       const res = await fetch("/search", {
//   //         method: "POST",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //         },
//   //         signal: controller.signal,
//   //         body: JSON.stringify(getBody(value)),
//   //       });

//   //       if (!res.ok) throw new Error("Fetch failed");

//   //       const data = await res.json();

//   //       // 🔍 Match ANY field
//   //       const filtered = Array.isArray(data)
//   //         ? data.filter((item) =>
//   //             searchFields.some((field) => {
//   //               const fieldValue = item?.[field];
//   //               return (
//   //                 typeof fieldValue === "string" &&
//   //                 fieldValue.toLowerCase().includes(value.toLowerCase())
//   //               );
//   //             })
//   //           )
//   //         : [];

//   //       setSuggestions(filtered);
//   //     } catch (err) {
//   //       if (err.name !== "AbortError") {
//   //         setError("Failed to fetch suggestions");
//   //         setSuggestions([]);
//   //       }
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchSuggestions();
//   //   return () => controller.abort();
//   // }, [value, getBody, searchFields]);

//   const handleChange = (e) => {
//     onChange(e.target.value);
//     setShowDropdown(true);
//   };

//   const handleSelect = (item) => {
//     onChange(item.name || item);
//     setShowDropdown(false);
//   };

//   return (
//     <div className="w-full max-w-xs relative">
//       <input
//         type="text"
//         className="w-full px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none"
//         placeholder={placeholder}
//         value={value}
//         onChange={handleChange}
//         onFocus={() => setShowDropdown(true)}
//         autoComplete="off"
//       />
//       {showButton && (
//         <button
//           type="submit"
//           className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition absolute right-0 top-0 h-full"
//         >
//           Search
//         </button>
//       )}
//       {showDropdown && (suggestions.length > 0 || loading || error) && (
//         <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow z-10 max-h-60 overflow-y-auto">
//           {loading && (
//             <li className="px-4 py-2 text-gray-400">Loading...</li>
//           )}
//           {error && (
//             <li className="px-4 py-2 text-red-500">{error}</li>
//           )}
//           {suggestions.map((item, idx) => (
//             <li
//               key={idx}
//               className="px-4 py-2 cursor-pointer hover:bg-purple-100"
//               onMouseDown={() => handleSelect(item.name || item)}
//             >
//               {item.name || item}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default SearchBar;