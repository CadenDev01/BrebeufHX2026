import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';

const position = [45.5019, -73.5674]; // Montreal

const Map = () => {
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [venue, setVenue] = useState('');

  const handleSearch = () => {
    // You can use these values to perform your search
    console.log('Activity:', activity);
    console.log('Location:', location);
    console.log('Venue:', venue);
    // Add your search logic here
  };

  return (
    <>
      <Navbar />
      <div className="p-8 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight text-center">
          Activity Map
        </h2>
        <div className="w-full max-w-3xl flex gap-4 justify-center mb-8">
          <SearchBar
            value={activity}
            onChange={setActivity}
            placeholder="Search for an activity..."
            showButton={false}
          />
          <SearchBar
            value={location}
            onChange={setLocation}
            placeholder="Search for a city..."
            showButton={false}
          />
          <SearchBar
            value={venue}
            onChange={setVenue}
            placeholder="Search for a venue..."
            showButton={false}
          />
          <button
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition h-12 self-stretch"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        <div className="w-full max-w-3xl flex justify-center">
          <MapContainer
            center={position}
            zoom={12}
            style={{ height: "500px", width: "100%" }}
            className="rounded-lg shadow-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                Montreal
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </>
  );
};

export default Map;