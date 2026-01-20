import { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '../../utils/api';

const CreateGroupModal = ({ onClose, onCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await makeAuthenticatedRequest('/api/relationships/friends');
        if (res.ok) {
          const data = await res.json();
          setFriends(data.friends || []);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
      setLoading(false);
    };
    fetchFriends();
  }, []);

  const toggleFriend = (friendId) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedFriends.length === 0 || creating) return;

    setCreating(true);
    try {
      const res = await makeAuthenticatedRequest('/api/conversations/group', {
        method: 'POST',
        body: JSON.stringify({
          name: groupName.trim(),
          participantIds: selectedFriends
        })
      });

      if (res.ok) {
        const data = await res.json();
        onCreated(data.conversation);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-slate-900 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="bg-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Group Chat</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-4">
          {/* Group Name */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Friends Selection */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">
              Select Friends ({selectedFriends.length} selected)
            </label>
            <div className="max-h-60 overflow-y-auto bg-slate-800 rounded-lg border border-slate-600">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : friends.length === 0 ? (
                <p className="text-gray-400 text-center py-4 text-sm">
                  No friends to add. Add friends first!
                </p>
              ) : (
                friends.map(friend => (
                  <div
                    key={friend._id}
                    onClick={() => toggleFriend(friend._id)}
                    className={`p-3 flex items-center gap-3 cursor-pointer border-b border-slate-700 last:border-0 transition-colors ${
                      selectedFriends.includes(friend._id) ? 'bg-purple-600/20' : 'hover:bg-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      selectedFriends.includes(friend._id)
                        ? 'bg-purple-600 border-purple-600'
                        : 'border-slate-500'
                    }`}>
                      {selectedFriends.includes(friend._id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {friend.firstName?.[0]}{friend.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-white text-sm">{friend.firstName} {friend.lastName}</p>
                      <p className="text-gray-400 text-xs">@{friend.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Create Button */}
          <button
            type="submit"
            disabled={!groupName.trim() || selectedFriends.length === 0 || creating}
            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-medium"
          >
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
