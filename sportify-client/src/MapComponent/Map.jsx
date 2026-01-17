import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import Navbar from '../components/Navbar';
import ResultTable from "./ResultTable";
import MapPopup from "./MapPopup";
import AutocompleteSearchBar from '../components/SearchBar';
import { makeAuthenticatedRequest } from '../utils/api';

const defaultPosition = [45.5019, -73.5674]; // Montreal

// Component to dynamically recenter the map
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 12);
  }, [position, map]);
  return null;
};

const Map = () => {
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultPosition);
  const [loading, setLoading] = useState(false);

  // Check URL parameters on mount (for "View All" or sport-specific links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fetchAll = params.get('fetchAll') === 'true';
    const sportParam = params.get('sport');
    
    if (fetchAll) {
      handleSearch();
    } else if (sportParam) {
      setActivity(sportParam);
      // Optionally auto-search when coming from sport list
      // setTimeout(() => handleSearch(), 100);
    }
  }, []);

  const handleSearch = async () => {
    setLoading(true);

    const isValid = (str) =>
      typeof str === "string" &&
      str.length <= 100 &&
      /^[\p{L}\d\s\-.,']*$/u.test(str);

    if (![activity, location, venue].every(isValid)) {
      alert("Invalid input detected.");
      setLoading(false);
      return;
    }

    const body = {};
    if (activity) body.sport = activity.toLowerCase();
    if (venue) body.sportLocation = venue.toLowerCase();
    if (location) body.city = location.toLowerCase();

    try {
      const res = await makeAuthenticatedRequest("http://localhost:3000/api/search", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      console.log('Search results:', data);

      // Filter for valid coordinates
      const withCoords = data.filter(item => {
        const lat = Number(item.latitude);
        const lng = Number(item.longitude);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
      });

      console.log('Results with coords:', withCoords.length);
      setFilteredResults(withCoords);

      // Center map on first result
      if (withCoords.length > 0) {
        setMapCenter([
          Number(withCoords[0].latitude),
          Number(withCoords[0].longitude)
        ]);
      } else {
        setMapCenter(defaultPosition);
      }

    } catch (err) {
      console.error('Search error:', err);
      alert("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-8 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-5xl md:text-6xl font-bold mb-8 text-center">
          Activity Map
        </h2>

        {/* Three Separate Search Bars with Autocomplete */}
        <div className="w-full max-w-3xl flex gap-4 mb-8 relative z-[10000]">
          <AutocompleteSearchBar
            value={activity}
            onChange={setActivity}
            placeholder="Search for an activity..."
            searchField="sport"
          />
          <AutocompleteSearchBar
            value={location}
            onChange={setLocation}
            placeholder="Search for a city..."
            searchField="city"
          />
          <AutocompleteSearchBar
            value={venue}
            onChange={setVenue}
            placeholder="Search for a venue..."
            searchField="sportLocation"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              loading 
                ? "bg-purple-300 cursor-not-allowed text-white" 
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Map Container */}
        <div className="w-full max-w-3xl">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: "500px", width: "100%" }}
            className="rounded-lg shadow-lg relative"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap position={mapCenter} />

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/70">
                <span className="text-purple-600 font-semibold">Loading map data…</span>
              </div>
            )}

            {/* Markers */}
            {!loading && filteredResults.map((mapItem, idx) => (
              <Marker key={idx} position={[mapItem.latitude, mapItem.longitude]}>
                <MapPopup item={mapItem} />
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Results Table */}
        <ResultTable results={filteredResults} />
      </div>
    </>
  );
};

export default Map;