import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const position = [45.5019, -73.5674]; // Montreal

const Map = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Game Map</h2>
      <MapContainer center={position} zoom={12} style={{ height: "500px", width: "100%" }}>
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
  );
};

export default Map;