import { useState, useEffect } from 'react';
import sportifyLogo from '../assets/sportify_logo.png'
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { makeAuthenticatedRequest } from '../utils/api';

/**
 * Navbar component for Sportify.
 * Displays the logo, navigation links, and call-to-action buttons.
 * Uses React Router for navigation.
 *
 * @component
 * @example
 * return (
 *   <Navbar />
 * )
 */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnread = async () => {
        try {
          const res = await makeAuthenticatedRequest('/api/messages/unread/count');
          if (res.ok) {
            const data = await res.json();
            setUnreadCount(data.totalUnread || 0);
          }
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };
      fetchUnread();
      const interval = setInterval(fetchUnread, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/70 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to='/' className="flex items-center gap-3">
            <img src={sportifyLogo} alt="Sportify" className="h-9 w-9 object-contain" />
            <h1 className="text-xl font-bold text-white">
              Sportify
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors font-medium">
              Home
            </Link>
            <Link to="/map" className="text-gray-300 hover:text-white transition-colors font-medium">
              Find Activities
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/friends" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Friends
                </Link>
                <Link to="/messages" className="text-gray-300 hover:text-white transition-colors font-medium relative">
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors font-medium">
              About Us
            </Link>
          </div>

          {/* CTA Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-gray-300 text-sm">
                  Welcome, {user?.firstName || user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/map"
                className="text-gray-300 hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Activities
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/friends"
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Friends
                  </Link>
                  <Link
                    to="/messages"
                    className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              <Link
                to="/about"
                className="text-gray-300 hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>

              {isAuthenticated ? (
                <>
                  <span className="text-gray-300 text-sm">
                    Welcome, {user?.firstName || user?.username}
                  </span>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors duration-200 w-fit"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
