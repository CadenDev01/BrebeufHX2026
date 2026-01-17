import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SportCard from './components/SportCard'
import QuickActions from './components/QuickActions'
import ChatBot from './components/ChatBot'
import Footer from './components/Footer'
import { Routes, Route, Navigate } from 'react-router-dom';
import Map from './MapComponent/Map';
import SportList from './SportCardList/SportList';
import About from "./AboutUs"
import { Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();
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
          <h2 id="available-sports" className="text-2xl font-bold">Available Sports</h2>
          <Link to='/list' className="text-purple-400 hover:text-purple-300 font-medium text-sm">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sport, index) => (
            <SportCard key={index} {...sport} isAuthenticated={isAuthenticated} />
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

      {/* Footer */}
      <Footer />
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Always show the Home page */}
        <Route path="/" element={<Home />} />

        {/* Other routes */}
        <Route path="/list" element={<SportList />} />
        <Route path="/map" element={<Map />} />
        <Route path="/about" element={<About />} />

        {/* Login & Register Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AuthProvider>
  );
}
export default App;