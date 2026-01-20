import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeAuthenticatedRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AttendeeModal = ({ eventId, eventName, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await makeAuthenticatedRequest(
          `/api/event/${eventId}/attendees`
        );

        if (res.ok) {
          const data = await res.json();
          setAttendees(data.attendees || []);
        } else {
          setError('Failed to load attendees');
        }
      } catch {
        setError('Error fetching attendees');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [eventId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="bg-purple-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Attendees - {eventName}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading attendees...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-4 text-red-500">{error}</div>
          )}

          {!loading && !error && attendees.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No attendees yet. Be the first to join!
            </div>
          )}

          {!loading && !error && attendees.length > 0 && (
            <ul className="divide-y divide-gray-200">
              {attendees.map((attendee, index) => {
                const isMe = attendee.odId === user?._id || attendee.odId?.toString() === user?._id?.toString();
                return (
                  <li key={attendee.odId || index} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                        {attendee.firstName?.[0]}{attendee.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {attendee.firstName} {attendee.lastName} {isMe && <span className="text-purple-600">(You)</span>}
                        </p>
                        {attendee.joinedAt && (
                          <p className="text-sm text-gray-500">
                            Joined {new Date(attendee.joinedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {!isMe && (
                      <button
                        onClick={async () => {
                          try {
                            const res = await makeAuthenticatedRequest('/api/conversations/dm', {
                              method: 'POST',
                              body: JSON.stringify({ recipientId: attendee.odId })
                            });
                            if (res.ok) {
                              const data = await res.json();
                              onClose();
                              navigate(`/messages/${data.conversation._id}`);
                            }
                          } catch (error) {
                            console.error('Error starting DM:', error);
                          }
                        }}
                        className="px-3 py-1 text-xs bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                      >
                        Message
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendeeModal;
