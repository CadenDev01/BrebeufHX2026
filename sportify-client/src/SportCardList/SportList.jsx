import React, { useEffect, useState } from 'react';

const SportsList = () => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sports data
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch('/api/sports');
        if (!response.ok) {
          throw new Error('Failed to fetch sports');
        }
        const data = await response.json();
        setSports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  if (loading) {
    return <div>Loading sports...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Available Sports</h2>

      <ul className="list-disc pl-5">
        {sports.length > 0 ? (
          sports.map((sport, index) => (
            <li key={index} className="flex justify-between items-center text-lg mb-2">
              <span>{sport}</span>
              {/* Button without any functionality */}
              <button
                className="ml-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 transition-all duration-200"
              >
                Find Community
              </button>
            </li>
          ))
        ) : (
          <li>No sports available</li>
        )}
      </ul>
    </div>
  );
};

export default SportsList;
