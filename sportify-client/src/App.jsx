import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SportCard from './components/SportCard';
import QuickActions from './components/QuickActions';
import { Routes, Route } from 'react-router-dom';
import Map from './MapComponent/Map';

function Home() {
  const sports = [
    { sport: 'Basketball', icon: '🏀', color: 'orange', players: 12, distance: '0.5 km', difficulty: 'medium' },
    { sport: 'Soccer', icon: '⚽', color: 'green', players: 18, distance: '1.2 km', difficulty: 'easy' },
    { sport: 'Tennis', icon: '🎾', color: 'yellow', players: 6, distance: '0.8 km', difficulty: 'medium' },
    { sport: 'Volleyball', icon: '🏐', color: 'blue', players: 10, distance: '1.5 km', difficulty: 'easy' },
    { sport: 'Baseball', icon: '⚾', color: 'red', players: 14, distance: '2.1 km', difficulty: 'hard' },
    { sport: 'Hockey', icon: '🏒', color: 'purple', players: 8, distance: '3.2 km', difficulty: 'hard' },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Quick Actions */}
      <QuickActions />

      {/* Sports Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Popular Sports Near You</h2>
          <button className="text-purple-400 hover:text-purple-300 font-semibold">
            View All →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sport, index) => (
            <SportCard key={index} {...sport} />
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/20">
          <h2 className="text-4xl font-bold mb-4">
            Stop Waiting. Start Playing.
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of athletes connecting every day.
          </p>
          <button className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 glow-effect-green">
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<Map />} />
    </Routes>
  );
}
export default App;
