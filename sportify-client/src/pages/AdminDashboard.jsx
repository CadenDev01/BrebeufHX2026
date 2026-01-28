import { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '../utils/api';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await makeAuthenticatedRequest('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async (page = 1, search = '') => {
    try {
      const res = await makeAuthenticatedRequest(
        `/api/admin/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`
      );
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setUserPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await makeAuthenticatedRequest('/api/admin/events?limit=10');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchEvents()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    fetchUsers(userPage, userSearch);
  }, [userPage, userSearch]);

  const handleToggleUserActive = async (userId, currentStatus) => {
    try {
      const res = await makeAuthenticatedRequest(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        fetchUsers(userPage, userSearch);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleToggleAdmin = async (userId, currentRoles) => {
    const isAdmin = currentRoles?.includes('admin');
    const newRoles = isAdmin
      ? currentRoles.filter(r => r !== 'admin')
      : [...(currentRoles || ['user']), 'admin'];

    try {
      const res = await makeAuthenticatedRequest(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ roles: newRoles })
      });
      if (res.ok) {
        fetchUsers(userPage, userSearch);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await makeAuthenticatedRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchUsers(userPage, userSearch);
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'purple' }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 bg-${color}-600/20 rounded-lg flex items-center justify-center text-${color}-400`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'events', label: 'Events' },
    { id: 'analytics', label: 'Analytics' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your platform</p>
          </div>
          <button
            onClick={() => { fetchStats(); fetchUsers(); fetchEvents(); }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
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
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={stats.users.total}
                subtitle={`${stats.users.newLast30Days} new this month`}
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m12 5.197v-1a6 6 0 00-3-5.197" /></svg>}
              />
              <StatCard
                title="Total Events"
                value={stats.events.total}
                subtitle={`${stats.events.withAttendees} have attendees`}
                color="green"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              />
              <StatCard
                title="Messages Sent"
                value={stats.messaging.totalMessages}
                subtitle={`${stats.messaging.messagesLast7Days} last 7 days`}
                color="blue"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
              />
              <StatCard
                title="Friendships"
                value={stats.social.friendships}
                subtitle={`${stats.social.follows} follows`}
                color="pink"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
              />
            </div>

            {/* Popular Sports & Cities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Popular Sports</h3>
                <div className="space-y-3">
                  {stats.events.popularSports.map((sport, idx) => (
                    <div key={sport._id || idx} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">{sport._id || 'Unknown'}</span>
                      <span className="text-purple-400 font-medium">{sport.count} events</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Popular Cities</h3>
                <div className="space-y-3">
                  {stats.events.popularCities.map((city, idx) => (
                    <div key={city._id || idx} className="flex items-center justify-between">
                      <span className="text-gray-300 capitalize">{city._id || 'Unknown'}</span>
                      <span className="text-green-400 font-medium">{city.count} events</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversation Stats */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Conversation Breakdown</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{stats.messaging.conversations.dm}</p>
                  <p className="text-gray-400 text-sm">Direct Messages</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{stats.messaging.conversations.group}</p>
                  <p className="text-gray-400 text-sm">Group Chats</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{stats.messaging.conversations.event}</p>
                  <p className="text-gray-400 text-sm">Event Chats</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-4">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                placeholder="Search users..."
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Users Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Joined</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-slate-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-gray-400 text-xs">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.isActive ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.roles?.includes('admin') ? 'bg-purple-600/20 text-purple-400' : 'bg-slate-600/20 text-gray-400'
                        }`}>
                          {user.roles?.includes('admin') ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleToggleUserActive(user._id, user.isActive)}
                            className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleToggleAdmin(user._id, user.roles)}
                            className="px-2 py-1 text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded transition-colors"
                          >
                            {user.roles?.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {userPagination && userPagination.pages > 1 && (
                <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between">
                  <p className="text-gray-400 text-sm">
                    Page {userPagination.page} of {userPagination.pages} ({userPagination.total} users)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUserPage(p => Math.max(1, p - 1))}
                      disabled={userPage === 1}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded text-sm"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setUserPage(p => Math.min(userPagination.pages, p + 1))}
                      disabled={userPage === userPagination.pages}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Sport</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">City</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Attendees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {events.map(event => (
                  <tr key={event._id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-white font-medium capitalize">{event.sport || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{event.sport_location || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm capitalize">{event.city || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm capitalize">{event.sport_type || 'N/A'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.attendeeCount > 0 ? 'bg-green-600/20 text-green-400' : 'bg-slate-600/20 text-gray-400'
                      }`}>
                        {event.attendeeCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">
            {/* User Signups Chart (Simple Text Version) */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">User Signups (Last 7 Days)</h3>
              <div className="space-y-2">
                {stats.users.signupsByDay.length === 0 ? (
                  <p className="text-gray-400">No signups in the last 7 days</p>
                ) : (
                  stats.users.signupsByDay.map(day => (
                    <div key={day._id} className="flex items-center gap-4">
                      <span className="text-gray-400 w-24 text-sm">{day._id}</span>
                      <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, day.count * 20)}%` }}
                        />
                      </div>
                      <span className="text-white font-medium w-8 text-right">{day.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-purple-400">
                  {stats.events.totalAttendees}
                </p>
                <p className="text-gray-400 mt-2">Total Event Attendees</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-green-400">
                  {stats.social.pendingRequests}
                </p>
                <p className="text-gray-400 mt-2">Pending Friend Requests</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-blue-400">
                  {((stats.users.active / stats.users.total) * 100).toFixed(1)}%
                </p>
                <p className="text-gray-400 mt-2">Active User Rate</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
