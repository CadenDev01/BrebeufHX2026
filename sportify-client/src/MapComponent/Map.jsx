import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import Navbar from '../components/Navbar';
import ResultTable from "./ResultTable";
import MapPopup from "./MapPopup";
import { useAuth } from '../context/AuthContext';

const defaultPosition = [45.5019, -73.5674]; // Montreal

// Component to dynamically recenter the map
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 12); // zoom 12 or keep previous zoom
  }, [position, map]);
  return null;
};

const Map = () => {
  const { user } = useAuth();
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultPosition);
  const [loading, setLoading] = useState(false);

  const currentUserId = user?._id || null;
  console.log({filteredResults} );

  const handleJoinSuccess = (eventId, attendee) => {
    setFilteredResults(prev => prev.map(r => 
      r._id === eventId 
        ? { ...r, attendees: [...(r.attendees || []), attendee] }
        : r
    ));
  };

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
      const res = await fetch("http://localhost:3000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      console.log('Search results:', data);

      const withCoords = data.filter(item => {
        const lat = Number(item.latitude);
        const lng = Number(item.longitude);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
      });
      console.log('Results with coords:', withCoords.map(i => ({ lat: i.latitude, lng: i.longitude, sport: i.sport })));

      setFilteredResults(withCoords);

      if (withCoords.length > 0) {
        setMapCenter([
          Number(withCoords[0].latitude),
          Number(withCoords[0].longitude)
        ]);
      } else {
        setMapCenter(defaultPosition);
      }

    } catch (err) {
      console.error(err);
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

        <div className="w-full max-w-3xl flex gap-4 mb-8">
          <input
            type="text"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="Search for an activity..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search for a city..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Search for a venue..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-semibold transition
              ${loading ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 text-white"}
            `}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

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

            {loading && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/70">
                  <span className="text-purple-600 font-semibold">Loading map data…</span>
                </div>
              )}

              {!loading && filteredResults.map((mapItem, idx) => (
                <Marker key={idx} position={[mapItem.latitude, mapItem.longitude]}>
                  <MapPopup 
                    item={mapItem} 
                    currentUserId={currentUserId} 
                    onJoinSuccess={handleJoinSuccess} 
                  />
                </Marker>
              ))}
          </MapContainer>
        </div>
        <ResultTable
          results={filteredResults}
          currentUserId={currentUserId}
          onJoinSuccess={handleJoinSuccess}
        />
      </div>
    </>
  );
};

export default Map;