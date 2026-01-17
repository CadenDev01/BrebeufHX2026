const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-slate-900/70 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚡</div>
            <h1 className="text-2xl font-black">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 text-transparent bg-clip-text">
                Sportify
              </span>
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">
              Find Games
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">
              Venues
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">
              Community
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:block px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium">
              Sign In
            </button>
            <button className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105">
              Join Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
