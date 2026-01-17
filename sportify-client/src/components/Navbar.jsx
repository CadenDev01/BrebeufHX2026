import sportifyLogo from '../assets/sportify_logo.png'
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
            <Link to="/about" className="text-gray-300 hover:text-white transition-colors font-medium">
              About Us
            </Link>
          </div>

          {/* CTA Buttons / User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-gray-300 text-sm">
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
                  className="hidden sm:block px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
