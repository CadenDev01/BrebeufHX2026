import { useState } from 'react';

const SportCard = ({ sport, players, distance, difficulty }) => {
  const [isHovered, setIsHovered] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl transition-all duration-200 cursor-pointer ${
        isHovered ? 'shadow-xl scale-105' : 'shadow-md scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-slate-800 border border-slate-700 hover:border-slate-600 p-6 h-full min-h-[220px] transition-colors duration-200">
        <div className="flex items-start justify-between mb-4">
          {/* TODO: Add your sport icon here (e.g., basketball, soccer ball image) */}
          <div className={`${difficultyColors[difficulty]} px-2.5 py-0.5 rounded text-xs font-semibold uppercase`}>
            {difficulty}
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">{sport}</h3>

        <div className="space-y-2.5 text-sm text-gray-400 mb-6">
          <div className="flex items-center gap-2">
            {/* TODO: Add your players/users icon here (16x16px) */}
            <div className="w-4 h-4 bg-gray-600 rounded" />
            <span>{players} players nearby</span>
          </div>
          <div className="flex items-center gap-2">
            {/* TODO: Add your location/pin icon here (16x16px) */}
            <div className="w-4 h-4 bg-gray-600 rounded" />
            <span>{distance} away</span>
          </div>
        </div>

        <button className="w-full bg-purple-600 hover:bg-purple-700 rounded-lg py-2.5 px-4 font-medium text-sm transition-colors duration-200">
          Find Game
        </button>
      </div>
    </div>
  );
};

export default SportCard;
