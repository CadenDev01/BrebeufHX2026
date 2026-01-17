import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SportCard from './components/SportCard'
import QuickActions from './components/QuickActions'
import ChatBot from './components/ChatBot'
import { Routes, Route } from 'react-router-dom';
import Map from './MapComponent/Map';
import About from "./AboutUs"

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
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Available Sports</h2>
          <button className="text-purple-400 hover:text-purple-300 font-medium text-sm">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sport, index) => (
            <SportCard key={index} {...sport} />
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Play?
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join our community and start connecting with players in your area today.
          </p>
          <button className="px-10 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-lg transition-colors duration-200">
            Get Started
          </button>
        </div>
      </div>

      {/* AI ChatBot */}
      <ChatBot />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<Map />} />
      <Route path="/About" element={<About />} /> 
    </Routes>
  );
}
export default App;
