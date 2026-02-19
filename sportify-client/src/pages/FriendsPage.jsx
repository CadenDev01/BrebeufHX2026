import { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '../utils/api';
import Navbar from '../components/Navbar';
import UserSearchModal from '../components/social/UserSearchModal';

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [friendsRes, followersRes, followingRes, requestsRes] = await Promise.all([
        makeAuthenticatedRequest('/api/relationships/friends'),
        makeAuthenticatedRequest('/api/relationships/followers'),
        makeAuthenticatedRequest('/api/relationships/following'),
        makeAuthenticatedRequest('/api/relationships/requests')
      ]);

      const friendsData = await friendsRes.json();
      const followersData = await followersRes.json();
      const followingData = await followingRes.json();
      const requestsData = await requestsRes.json();

      setFriends(friendsData.friends || []);
      setFollowers(followersData.followers || []);
      setFollowing(followingData.following || []);
      setRequests(requestsData.requests || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptRequest = async (requesterId) => {
    try {
      const res = await makeAuthenticatedRequest('/api/relationships/friend/respond', {
        method: 'POST',
        body: JSON.stringify({ requesterId, accept: true })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleDeclineRequest = async (requesterId) => {
    try {
      const res = await makeAuthenticatedRequest('/api/relationships/friend/respond', {
        method: 'POST',
        body: JSON.stringify({ requesterId, accept: false })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleRemoveFriend = async (userId) => {
    try {
      const res = await makeAuthenticatedRequest(`/api/relationships/friend/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const res = await makeAuthenticatedRequest(`/api/relationships/follow/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error unfollowing:', error);
    }
  };

  const tabs = [
    { id: 'friends', label: 'Friends', count: friends.length },
    { id: 'followers', label: 'Followers', count: followers.length },
    { id: 'following', label: 'Following', count: following.length },
    { id: 'requests', label: 'Requests', count: requests.length }
  ];

  const UserCard = ({ user, actions }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
        <div>
          <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
          <p className="text-gray-400 text-sm">@{user.username}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {actions}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Social</h1>
          <button
            onClick={() => setShowSearch(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            Find People
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-slate-700 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTab === 'friends' && (
              friends.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No friends yet. Find people to connect with!</p>
              ) : (
                friends.map(friend => (
                  <UserCard
                    key={friend._id}
                    user={friend}
                    actions={
                      <button
                        onClick={() => handleRemoveFriend(friend._id)}
                        className="px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg text-sm transition-colors"
                      >
                        Remove
                      </button>
                    }
                  />
                ))
              )
            )}

            {activeTab === 'followers' && (
              followers.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No followers yet.</p>
              ) : (
                followers.map(follower => (
                  <UserCard
                    key={follower._id}
                    user={follower}
                    actions={null}
                  />
                ))
              )
            )}

            {activeTab === 'following' && (
              following.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Not following anyone yet.</p>
              ) : (
                following.map(user => (
                  <UserCard
                    key={user._id}
                    user={user}
                    actions={
                      <button
                        onClick={() => handleUnfollow(user._id)}
                        className="px-3 py-1.5 bg-slate-700 text-gray-300 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                      >
                        Unfollow
                      </button>
                    }
                  />
                ))
              )
            )}

            {activeTab === 'requests' && (
              requests.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No pending friend requests.</p>
              ) : (
                requests.map(request => (
                  <UserCard
                    key={request._id}
                    user={request.requesterInfo}
                    actions={
                      <>
                        <button
                          onClick={() => handleAcceptRequest(request.requester)}
                          className="px-3 py-1.5 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.requester)}
                          className="px-3 py-1.5 bg-slate-700 text-gray-300 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    }
                  />
                ))
              )
            )}
          </div>
        )}
      </div>

      {showSearch && (
        <UserSearchModal
          onClose={() => setShowSearch(false)}
          onAction={fetchData}
        />
      )}
    </div>
  );
};

export default FriendsPage;
