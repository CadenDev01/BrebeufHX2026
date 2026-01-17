import { 
  MapContainer, 
  TileLayer
} from 'react-leaflet';
import MetroMarkers from './MetroMarkers';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import { fetchStations } from './GetStationInBetween.jsx';
import { useEffect, useState } from 'react';

// See https://www.youtube.com/watch?v=jD6813wGdBA if you want to customize the map
// further (optional)

export default function MapExample({startId, endId, setSelectedStationId }) {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!startId || !endId) {
      setStations([]);
      return;
    }
    const getStations = async () => {
      try {
        const data = await fetchStations(startId, endId);
        setStations(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setStations([]);
      }
    };
    getStations();
  }, [startId, endId]);
  if (!startId || !endId) return null;
  if (error) return <p>Error: {error}</p>;

  const attribution = 
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  
  return (
    <div className="ui-container">
      <MapContainer
        center={[45.5, -73.6]}
        zoom={12}
        zoomControl={true}
        updateWhenZooming={false}
        updateWhenIdle={true}
        preferCanvas={true}
        minZoom={10}
        maxZoom={16}
      >
        <TileLayer
          attribution={attribution}
          url={tileUrl}
        />
        <MetroMarkers 
          route={stations}
          setSelectedStationId={setSelectedStationId}/> 
      </MapContainer>
    </div>
  );
}