import { Link } from 'react-router-dom';

const Hero = () => {
  // Smooth scroll handler
  const handleGetStarted = (e) => {
    e.preventDefault();
    const section = document.getElementById("available-sports");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative overflow-hidden py-16 px-4">
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Find Your Next Game in{' '}
            <span className="text-purple-400">Seconds</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Connect with local players, discover nearby venues, and join sports activities happening right now in your area.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a
              href="#available-sports"
              onClick={handleGetStarted}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-base transition-colors duration-200 cursor-pointer"
            >
              Get Started
            </a>
            <Link to='/about' className="px-8 py-3 bg-transparent border border-gray-600 hover:border-gray-500 rounded-lg font-semibold text-base transition-colors duration-200">
              Learn More
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-800">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">1,200+</div>
            <div className="text-sm text-gray-500">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">85</div>
            <div className="text-sm text-gray-500">Games Today</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">40+</div>
            <div className="text-sm text-gray-500">Venues</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;