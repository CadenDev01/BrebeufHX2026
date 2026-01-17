import sportifyLogo from '../assets/sportify_logo.png'

import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/70 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={sportifyLogo} alt="Sportify" className="h-9 w-9 object-contain" />
            <h1 className="text-xl font-bold text-white">
              Sportify
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/map" className="text-gray-300 hover:text-white transition-colors font-medium">
              Find Games Near Me
            </Link>
            <Link to="/venues" className="text-gray-300 hover:text-white transition-colors font-medium">
              Venues
            </Link>
            <Link to="/community" className="text-gray-300 hover:text-white transition-colors font-medium">
              Community
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:block px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Sign In
            </button>
            <button className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors duration-200">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
