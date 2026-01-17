import { useState } from 'react';

const SportCard = ({ sport, icon, players, distance, difficulty }) => {
  const [isHovered, setIsHovered] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 transform cursor-pointer ${
        isHovered ? 'scale-105 glow-effect' : 'scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/20 p-6 h-full min-h-[200px] relative hover:border-purple-500/40 transition-colors duration-300">
        {/* Animated background circles */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transition-transform duration-500 ${isHovered ? 'scale-150' : 'scale-100'}`} />
        <div className={`absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl transition-transform duration-700 ${isHovered ? 'scale-125' : 'scale-100'}`} />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="text-5xl">{icon}</div>
            <div className={`${difficultyColors[difficulty]} px-3 py-1 rounded-full text-xs font-semibold`}>
              {difficulty.toUpperCase()}
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-3">{sport}</h3>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <span className="font-medium">{players} players nearby</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <span className="font-medium">{distance} away</span>
            </div>
          </div>

          {/* Action button appears on hover */}
          <div className={`mt-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg py-2 px-4 font-semibold transition-colors duration-200">
              Find Game Now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportCard;
