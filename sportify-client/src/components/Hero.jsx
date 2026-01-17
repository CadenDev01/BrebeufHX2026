import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative overflow-hidden py-20 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <div className="mb-6 inline-block">
          <span className="bg-gradient-to-r from-purple-400 to-green-400 text-transparent bg-clip-text text-6xl font-black">
            🏀⚽🎾
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
          Ready to{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 text-transparent bg-clip-text animate-pulse">
            Play?
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-2 max-w-2xl mx-auto">
          Find players nearby, discover courts and fields, and join the game in seconds.
        </p>
        <p className="text-sm text-gray-500 mb-8 font-medium">
          Powered by Sportify
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/map" className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 glow-effect">
            <span className="relative z-10">Find Games Near Me</span>
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
          </Link>

          <button className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20">
            Browse All Sports
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
              1,234
            </div>
            <div className="text-sm text-gray-400 mt-1">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
              89
            </div>
            <div className="text-sm text-gray-400 mt-1">Games Today</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black bg-gradient-to-r from-orange-400 to-orange-600 text-transparent bg-clip-text">
              42
            </div>
            <div className="text-sm text-gray-400 mt-1">Venues Nearby</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
