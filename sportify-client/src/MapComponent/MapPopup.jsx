import { Popup } from 'react-leaflet';

// Helper function to return "N/A" if the value is empty or null
const getDisplayValue = (value) => {
  return value && value.trim() !== "" ? value : "N/A";
};

const MapPopup = ({ item }) => {
  // Generate Google Maps directions URL
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

  return (
    <Popup>
      <strong>Name: {getDisplayValue(item.sport)}</strong><br />
      <em>Type: {getDisplayValue(item.sport_type)}</em><br />
      Venue/Location: {getDisplayValue(item.sport_location)}<br />
      City: {getDisplayValue(item.city)}, Region: {getDisplayValue(item.region)}<br />
      <small>Latitude: {getDisplayValue(item.latitude)}, Longitude: {getDisplayValue(item.longitude)}</small><br />
      
      {/* Button to open Google Maps directions */}
      <a 
        href={googleMapsUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-2 inline-block px-4 py-2 text-sm text-black font-bold rounded-md shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200"
      >
        Get Directions  
      </a>
    </Popup>
  );
};

export default MapPopup;
