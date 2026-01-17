import React from "react";

const ResultsTable = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 text-center text-gray-400">
        No results found.
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b text-left font-semibold text-gray-700">Location</th>
            <th className="px-6 py-3 border-b text-left font-semibold text-gray-700">Venue</th>
            <th className="px-6 py-3 border-b text-left font-semibold text-gray-700">Activity</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, idx) => (
            <tr key={idx} className="hover:bg-purple-50">
              <td className="px-6 py-3 border-b">{row.location}</td>
              <td className="px-6 py-3 border-b">{row.venue}</td>
              <td className="px-6 py-3 border-b">{row.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;