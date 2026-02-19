import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { makeAuthenticatedRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CreateGroupModal from '../components/messaging/CreateGroupModal';

const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [dmSearch, setDmSearch] = useState('');
  const [dmResults, setDmResults] = useState([]);
  const [dmSearching, setDmSearching] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await makeAuthenticatedRequest('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Fetch messages for active conversation
  const fetchMessages = async (convId) => {
    try {
      const res = await makeAuthenticatedRequest(`/api/messages/${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        // Mark as read
        await makeAuthenticatedRequest(`/api/messages/${convId}/read`, { method: 'PUT' });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchConversations();
      setLoading(false);
    };
    init();

    // Poll for new conversations
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (conversationId) {
      const conv = conversations.find(c => c._id === conversationId);
      setActiveConversation(conv);
      fetchMessages(conversationId);

      // Poll for new messages in active conversation
      const interval = setInterval(() => fetchMessages(conversationId), 3000);
      return () => clearInterval(interval);
    }
  }, [conversationId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || sendingMessage) return;

    setSendingMessage(true);
    try {
      const res = await makeAuthenticatedRequest(`/api/messages/${conversationId}`, {
        method: 'POST',
        body: JSON.stringify({ content: newMessage.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        fetchConversations(); // Update last message in list
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setSendingMessage(false);
  };

  const selectConversation = (conv) => {
    navigate(`/messages/${conv._id}`);
  };

  // Search for users to DM
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setDmResults([]);
      return;
    }
    setDmSearching(true);
    try {
      const res = await makeAuthenticatedRequest(`/api/relationships/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setDmResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
    setDmSearching(false);
  };

  // Start DM with user
  const startDM = async (recipientId) => {
    try {
      const res = await makeAuthenticatedRequest('/api/conversations/dm', {
        method: 'POST',
        body: JSON.stringify({ recipientId })
      });
      if (res.ok) {
        const data = await res.json();
        setShowNewDM(false);
        setDmSearch('');
        setDmResults([]);
        fetchConversations();
        navigate(`/messages/${data.conversation._id}`);
      }
    } catch (error) {
      console.error('Error starting DM:', error);
    }
  };

  const getConversationName = (conv) => {
    if (conv.type === 'group' || conv.type === 'event') {
      return conv.name;
    }
    // DM - show other person's name
    const other = conv.participantDetails?.find(p => p._id !== user?._id);
    return other ? `${other.firstName} ${other.lastName}` : 'Unknown';
  };

  const getConversationAvatar = (conv) => {
    if (conv.type === 'group') return 'G';
    if (conv.type === 'event') return 'E';
    const other = conv.participantDetails?.find(p => p._id !== user?._id);
    return other ? `${other.firstName?.[0]}${other.lastName?.[0]}` : '?';
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-4 h-[calc(100vh-120px)]">
          {/* Conversations List */}
          <div className="w-80 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-white font-semibold">Messages</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewDM(true)}
                  className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
                  title="New Message"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowNewGroup(true)}
                  className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
                  title="New Group"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-gray-400 text-center py-8 px-4 text-sm">
                  No conversations yet. Start a chat from a user profile or create a group!
                </p>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv._id}
                    onClick={() => selectConversation(conv)}
                    className={`p-3 border-b border-slate-700 cursor-pointer transition-colors ${
                      conversationId === conv._id ? 'bg-purple-600/20' : 'hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                        conv.type === 'event' ? 'bg-green-600' : conv.type === 'group' ? 'bg-blue-600' : 'bg-purple-600'
                      }`}>
                        {getConversationAvatar(conv)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium text-sm truncate">
                            {getConversationName(conv)}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-gray-500 text-xs">
                              {formatTime(conv.lastMessage.sentAt)}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-gray-400 text-xs truncate">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
            {conversationId && activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-700 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    activeConversation.type === 'event' ? 'bg-green-600' : activeConversation.type === 'group' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>
                    {getConversationAvatar(activeConversation)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{getConversationName(activeConversation)}</p>
                    <p className="text-gray-400 text-xs">
                      {activeConversation.type === 'dm' ? 'Direct Message' :
                       activeConversation.type === 'group' ? `${activeConversation.participants?.length} members` :
                       'Event Chat'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?._id || msg.sender?._id === user?._id;
                    return (
                      <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                          {!isMe && activeConversation.type !== 'dm' && (
                            <p className="text-xs text-gray-400 mb-1">
                              {msg.sender?.firstName || 'Unknown'}
                            </p>
                          )}
                          <div className={`px-4 py-2 rounded-2xl ${
                            isMe
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-slate-700 text-gray-100'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-gray-400">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showNewGroup && (
        <CreateGroupModal
          onClose={() => setShowNewGroup(false)}
          onCreated={(conv) => {
            setShowNewGroup(false);
            fetchConversations();
            navigate(`/messages/${conv._id}`);
          }}
        />
      )}

      {showNewDM && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-white font-semibold">New Message</h3>
              <button
                onClick={() => { setShowNewDM(false); setDmSearch(''); setDmResults([]); }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={dmSearch}
                onChange={(e) => { setDmSearch(e.target.value); searchUsers(e.target.value); }}
                placeholder="Search by name or username..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                autoFocus
              />
              <div className="mt-3 max-h-64 overflow-y-auto">
                {dmSearching ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  </div>
                ) : dmResults.length > 0 ? (
                  dmResults.map(u => (
                    <div
                      key={u._id}
                      onClick={() => startDM(u._id)}
                      className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium">{u.firstName} {u.lastName}</p>
                        <p className="text-gray-400 text-sm">@{u.username}</p>
                      </div>
                    </div>
                  ))
                ) : dmSearch.trim() ? (
                  <p className="text-gray-400 text-center py-4">No users found</p>
                ) : (
                  <p className="text-gray-400 text-center py-4 text-sm">Type to search for users</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
