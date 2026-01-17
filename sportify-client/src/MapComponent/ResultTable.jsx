import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { makeAuthenticatedRequest } from "../utils/api";
import AttendeeModal from "../components/AttendeeModal";

const ResultTable = ({ results, onJoinSuccess, currentUserId }) => {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [joiningId, setJoiningId] = useState(null);
  const [joinMessages, setJoinMessages] = useState({});
  const [joinedEvents, setJoinedEvents] = useState({});
  const [showAttendeesFor, setShowAttendeesFor] = useState(null);
  const rowsPerPage = 10;

  const handleJoinEvent = async (eventId) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setJoiningId(eventId);
    setJoinMessages(prev => ({ ...prev, [eventId]: '' }));

    try {
      const res = await makeAuthenticatedRequest('http://localhost:3000/api/addUserToEvent', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (res.ok) {
        setJoinMessages(prev => ({
          ...prev,
          [eventId]: data.alreadyJoined ? 'Already joined!' : 'Joined!'
        }));
        setJoinedEvents(prev => ({ ...prev, [eventId]: true }));
        if (!data.alreadyJoined && onJoinSuccess) {
          onJoinSuccess(eventId, data.attendee);
        }
      } else {
        setJoinMessages(prev => ({ ...prev, [eventId]: data.message || 'Failed' }));
      }
    } catch {
      setJoinMessages(prev => ({ ...prev, [eventId]: 'Error' }));
    } finally {
      setJoiningId(null);
    }
  };

  if (!results || results.length === 0) {
    return <div className="text-center mt-8 text-gray-400">No results found.</div>;
  }

  const totalPages = Math.ceil(results.length / rowsPerPage);
  const pageSafe = Math.min(page, totalPages) || 1;
  const start = (pageSafe - 1) * rowsPerPage;
  const visibleRows = results.slice(start, start + rowsPerPage);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <table className="min-w-full bg-white rounded-lg shadow border border-gray-600">
        <thead>
          <tr>
            <th className="px-4 py-3 border-b border-gray-300 text-black">City</th>
            <th className="px-4 py-3 border-b border-gray-300 text-black">Venue/Location</th>
            <th className="px-4 py-3 border-b border-gray-300 text-black">Activity</th>
            <th className="px-4 py-3 border-b border-gray-300 text-black">Attendees</th>
            <th className="px-4 py-3 border-b border-gray-300 text-black">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, idx) => {
            const attendeeCount = row.attendees?.length || 0;
            const alreadyJoined = joinedEvents[row._id] || (currentUserId && row.attendees?.some(a =>
              a.odId === currentUserId || a.odId?.toString() === currentUserId?.toString()
            ));
            return (
              <tr key={idx} className="text-black">
                <td className="px-4 py-3 border-b border-gray-300 text-black">{row.city || "-"}</td>
                <td className="px-4 py-3 border-b border-gray-300 text-black">{row.sport_location || row.venue || "-"}</td>
                <td className="px-4 py-3 border-b border-gray-300 text-black">{row.sport || "-"}</td>
                <td className="px-4 py-3 border-b border-gray-300 text-black text-center">
                  {attendeeCount > 0 ? (
                    <button
                      onClick={() => setShowAttendeesFor(row)}
                      className="text-purple-600 hover:text-purple-800 underline"
                    >
                      {attendeeCount}
                    </button>
                  ) : (
                    "0"
                  )}
                </td>
                <td className="px-4 py-3 border-b border-gray-300 text-black">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleJoinEvent(row._id)}
                      disabled={joiningId === row._id || alreadyJoined}
                      className={`px-3 py-1 text-xs text-white font-medium rounded transition-colors ${
                        alreadyJoined
                          ? 'bg-green-600 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300'
                      }`}
                    >
                      {alreadyJoined ? 'Joined' : (joiningId === row._id ? '...' : 'Join')}
                    </button>
                    {joinMessages[row._id] && !alreadyJoined && (
                      <span className="text-xs text-green-600">{joinMessages[row._id]}</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-center gap-4 mt-4">
        <button
          disabled={pageSafe === 1}
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          className="px-4 py-2 bg-purple-600 text-white rounded disabled:bg-gray-300"
        >
          Prev
        </button>
        <span className="py-2">{pageSafe} / {totalPages}</span>
        <button
          disabled={pageSafe === totalPages}
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          className="px-4 py-2 bg-purple-600 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>

      {showAttendeesFor && (
        <AttendeeModal
          eventId={showAttendeesFor._id}
          eventName={showAttendeesFor.sport_location || showAttendeesFor.sport}
          onClose={() => setShowAttendeesFor(null)}
        />
      )}
    </div>
  );
};

export default ResultTable;
