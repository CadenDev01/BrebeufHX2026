import { useState } from 'react';
import { makeAuthenticatedRequest } from '../../utils/api';

const UserSearchModal = ({ onClose, onAction }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMap, setStatusMap] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.length < 2) return;

    setLoading(true);
    try {
      const res = await makeAuthenticatedRequest(`/api/relationships/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.users || []);

      // Fetch relationship status for each user
      const statuses = {};
      for (const user of data.users || []) {
        const statusRes = await makeAuthenticatedRequest(`/api/relationships/status/${user._id}`);
        const statusData = await statusRes.json();
        statuses[user._id] = statusData;
      }
      setStatusMap(statuses);
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      const res = await makeAuthenticatedRequest('/api/relationships/friend/request', {
        method: 'POST',
        body: JSON.stringify({ recipientId: userId })
      });
      if (res.ok) {
        setStatusMap(prev => ({
          ...prev,
          [userId]: { ...prev[userId], friendRequestPending: true, friendRequestSentByMe: true }
        }));
        onAction?.();
      }
    } catch (error) {
      console.error('Friend request error:', error);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const res = await makeAuthenticatedRequest(`/api/relationships/follow/${userId}`, {
        method: 'POST'
      });
      if (res.ok) {
        setStatusMap(prev => ({
          ...prev,
          [userId]: { ...prev[userId], isFollowing: true }
        }));
        onAction?.();
      }
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const res = await makeAuthenticatedRequest(`/api/relationships/follow/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setStatusMap(prev => ({
          ...prev,
          [userId]: { ...prev[userId], isFollowing: false }
        }));
        onAction?.();
      }
    } catch (error) {
      console.error('Unfollow error:', error);
    }
  };

  const getActionButtons = (user) => {
    const status = statusMap[user._id] || {};

    return (
      <div className="flex gap-2">
        {/* Friend button */}
        {status.isFriend ? (
          <span className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg text-sm">
            Friends
          </span>
        ) : status.friendRequestPending ? (
          <span className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm">
            {status.friendRequestSentByMe ? 'Request Sent' : 'Pending'}
          </span>
        ) : (
          <button
            onClick={() => handleSendFriendRequest(user._id)}
            className="px-3 py-1.5 bg-purple-600 text-white hover:bg-purple-700 rounded-lg text-sm transition-colors"
          >
            Add Friend
          </button>
        )}

        {/* Follow button */}
        {status.isFollowing ? (
          <button
            onClick={() => handleUnfollow(user._id)}
            className="px-3 py-1.5 bg-slate-700 text-gray-300 hover:bg-slate-600 rounded-lg text-sm transition-colors"
          >
            Unfollow
          </button>
        ) : (
          <button
            onClick={() => handleFollow(user._id)}
            className="px-3 py-1.5 bg-slate-700 text-gray-300 hover:bg-purple-600 hover:text-white rounded-lg text-sm transition-colors"
          >
            Follow
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-slate-900 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Find People</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="p-4 border-b border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or username..."
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={query.length < 2 || loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="overflow-y-auto max-h-[50vh] p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : results.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              {query.length >= 2 ? 'No users found' : 'Enter at least 2 characters to search'}
            </p>
          ) : (
            <div className="space-y-3">
              {results.map(user => (
                <div
                  key={user._id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-gray-400 text-xs">@{user.username}</p>
                    </div>
                  </div>
                  {getActionButtons(user)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
