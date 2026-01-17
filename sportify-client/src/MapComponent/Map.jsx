import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Navbar from '../components/Navbar';
import ResultsTable from "./ResultTable";

const position = [45.5019, -73.5674]; // Montreal

const Map = () => {
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);

  const handleSearch = async () => {
    const isValid = (str) =>
      typeof str === "string" &&
      str.length <= 100 &&
      /^[\w\s\-.,']*$/i.test(str);

    if (![activity, location, venue].every(isValid)) {
      alert("Invalid input detected.");
      return;
    }

    const body = {};
    if (activity) body.sport = activity.toLowerCase();
    if (venue) body.sportLocation = venue.toLowerCase();
    if (location) body.city = location.toLowerCase();

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setFilteredResults(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch results");
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
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Search
          </button>
        </div>

        <div className="w-full max-w-3xl">
          <MapContainer
            center={position}
            zoom={12}
            style={{ height: "500px", width: "100%" }}
            className="rounded-lg shadow-lg"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredResults.map((item, idx) => (
              <Marker key={idx} position={[item.latitude, item.longitude]}>
                <Popup>
                  <strong>{item.sport}</strong><br />
                  {item.venue}<br />
                  {item.city}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <ResultsTable results={filteredResults} />
      </div>
    </>
  );
};

export default Map;
