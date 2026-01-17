import { useState } from 'react';
/**
 * @typedef {Object} SportCardProps
 * @property {string} sport - Name of the sport (e.g., "Basketball")
 * @property {number} players - Number of nearby players
 * @property {string} distance - Distance to the nearest game (e.g., "2 km")
 * @property {'easy' | 'medium' | 'hard'} difficulty - Difficulty level of the sport
 */

/**
 * Displays a card with sport information including difficulty,
 * nearby players, and distance, with hover effects.
 *
 * @param {SportCardProps} props - Props for the SportCard component
 * @returns {JSX.Element} Rendered sport card
 */
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
          <div className={`${difficultyColors[difficulty]} px-2.5 py-0.5 rounded text-xs font-semibold uppercase`}>
            {difficulty}
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">{sport}</h3>

        <div className="space-y-2.5 text-sm text-gray-400 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded" />
            <span>{players} players nearby</span>
          </div>
          <div className="flex items-center gap-2">
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
