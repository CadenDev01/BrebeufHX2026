import React from "react";
import Navbar from "./components/Navbar";

const AboutUs = () => (
  <>
    <Navbar />
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-3xl bg-white bg-opacity-90 rounded-2xl shadow-xl p-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-purple-700">About Sportify</h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8">
          <span className="font-semibold text-purple-600">Sportify</span> is your go-to platform for spontaneous sports fun! Whether you want to play soccer, basketball, tennis, or any other sport, we help you discover the best venues in Quebec and connect with players who share your passion.
        </p>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-purple-700 mb-2">Our Mission</h2>
          <p className="text-gray-700">
            We believe sports should be accessible, social, and exciting. Our mission is to make it easy for you to find where to play and who to play with—so you can have the most fun, anytime you want!
          </p>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-purple-700 mb-2">How It Works</h2>
          <ul className="list-disc list-inside text-left text-gray-700 mx-auto max-w-xl">
            <li>Browse or search for sports activities happening near you.</li>
            <li>Discover venues and see which games are active right now.</li>
            <li>Connect with other players and join a game instantly.</li>
            <li>Schedule your own game and invite others to join.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-purple-700 mb-2">Why Sportify?</h2>
          <p className="text-gray-700">
            No more endless group chats or last-minute scrambling. With Sportify, you always know where to go and who to play with. Get out, get active, and make new friends—all in one place!
          </p>
        </div>
      </div>
    </div>
  </>
);

export default AboutUs;