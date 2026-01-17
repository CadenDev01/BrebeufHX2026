import { useState } from 'react';
import { Popup } from 'react-leaflet';
import { useAuth } from '../context/AuthContext';
import AttendeeModal from '../components/AttendeeModal';
import { makeAuthenticatedRequest } from '../utils/api';

// Helper function to return "N/A" if the value is empty or null
const getDisplayValue = (value) => {
  return value && value.trim() !== "" ? value : "N/A";
};

const MapPopup = ({ item, onJoinSuccess, currentUserId }) => {
  const { isAuthenticated } = useAuth();
  const [showAttendees, setShowAttendees] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  const attendeeCount = item.attendees?.length || 0;
  const alreadyJoined = hasJoined || (currentUserId && item.attendees?.some(a =>
    a.odId === currentUserId || a.odId?.toString() === currentUserId?.toString()
  ));

  const handleJoinEvent = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setJoining(true);
    setJoinMessage('');

    try {
      const res = await makeAuthenticatedRequest('http://localhost:3000/api/addUserToEvent', {
        method: 'POST',
        body: JSON.stringify({ eventId: item._id }),
      });

      const data = await res.json();

      if (res.ok) {
        setJoinMessage(data.alreadyJoined ? 'Already joined!' : 'Joined successfully!');
        setHasJoined(true);
        if (!data.alreadyJoined && onJoinSuccess) {
          onJoinSuccess();
        }
      } else {
        setJoinMessage(data.message || 'Failed to join');
      }
    } catch {
      setJoinMessage('Error joining event');
    } finally {
      setJoining(false);
    }
  };

  // Generate Google Maps directions URL
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

  return (
    <>
      <Popup>
        <strong>Name: {getDisplayValue(item.sport)}</strong><br />
        <em>Type: {getDisplayValue(item.sport_type)}</em><br />
        Venue/Location: {getDisplayValue(item.sport_location)}<br />
        City: {getDisplayValue(item.city)}, Region: {getDisplayValue(item.region)}<br />
        <small>Latitude: {getDisplayValue(item.latitude)}, Longitude: {getDisplayValue(item.longitude)}</small><br />
        <small>Attendees: {attendeeCount}</small><br />

        <div className="flex flex-col gap-2 mt-2">
          {/* Button to open Google Maps directions */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 text-sm text-black font-bold rounded-md shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200 text-center"
          >
            Get Directions
          </a>

          {/* Join Event Button */}
          <button
            onClick={handleJoinEvent}
            disabled={joining || alreadyJoined}
            className={`px-4 py-2 text-sm text-white font-bold rounded-md shadow-md transition-all duration-200 ${
              alreadyJoined
                ? 'bg-green-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300'
            }`}
          >
            {alreadyJoined ? 'Joined' : (joining ? 'Joining...' : (isAuthenticated ? 'Join Event' : 'Login to Join'))}
          </button>

          {/* View Attendees Button */}
          {isAuthenticated && attendeeCount > 0 && (
            <button
              onClick={() => setShowAttendees(true)}
              className="px-4 py-2 text-sm text-white font-bold rounded-md shadow-md bg-green-600 hover:bg-green-700 transition-all duration-200"
            >
              View Attendees ({attendeeCount})
            </button>
          )}

          {joinMessage && (
            <p className="text-xs text-center mt-1">{joinMessage}</p>
          )}
        </div>
      </Popup>

      {showAttendees && (
        <AttendeeModal
          eventId={item._id}
          eventName={item.sport_location || item.sport}
          onClose={() => setShowAttendees(false)}
        />
      )}
    </>
  );
};

export default MapPopup;
