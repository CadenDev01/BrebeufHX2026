import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Navbar from '../components/Navbar';
import LocationSearchBar from '../components/SearchBar';

const position = [45.5019, -73.5674]; // Montreal

const Map = () => {
  return (
    <>
      <Navbar />
      <div className="p-8 flex flex-col items-center justify-center min-h-screen ">
        <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight text-center">
          Activity Map
        </h2>
       
        <div className="w-full max-w-3xl flex flex-col items-center gap-4">
          <div className="w-full flex justify-center">
             <LocationSearchBar />
          </div>
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