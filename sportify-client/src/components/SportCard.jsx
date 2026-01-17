import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

/**
 * @typedef {Object} SportCardProps
 * @property {string} sport - Name of the sport (e.g., "Basketball")
 * @property {number} players - Number of nearby players
 * @property {string} distance - Distance to the nearest game (e.g., "2 km")
 * @property {'easy' | 'medium' | 'hard'} difficulty - Difficulty level of the sport
 * @property {boolean} isAuthenticated - Whether the user is logged in
 */

/**
 * Displays a card with sport information including difficulty,
 * nearby players, and distance, with hover effects.
 *
 * @param {SportCardProps} props - Props for the SportCard component
 * @returns {JSX.Element} Rendered sport card
 */
const SportCard = ({ sport, players, distance, difficulty, isAuthenticated }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();  // Hook to navigate programmatically

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  };

  // Handle the button click to either navigate to login or continue
  const handleButtonClick = () => {
    if (!isAuthenticated) {
      // Redirect the user to the login page if they are not authenticated
      navigate('/login');
    } else {
      // Logic for when the user is authenticated
      console.log(`Finding community for ${sport}`);
    }
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

        <button
          onClick={handleButtonClick}  // Handle the button click
          className={`w-full ${isAuthenticated ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'} rounded-lg py-2.5 px-4 font-medium text-sm transition-colors duration-200`}
          disabled={!isAuthenticated}  // Disable button if not authenticated
        >
          {isAuthenticated ? 'Find Community' : 'Log in to Join'}
        </button>
      </div>
    </div>
  );
};

export default SportCard;
