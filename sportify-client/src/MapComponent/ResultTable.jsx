import { useState } from "react";

const ResultTable = ({ results, onViewOnMap }) => {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  if (!results || results.length === 0) {
    return <div className="text-center mt-8 text-gray-400">No results found.</div>;
  }

  const totalPages = Math.ceil(results.length / rowsPerPage);
  const pageSafe = Math.min(page, totalPages) || 1;
  const start = (pageSafe - 1) * rowsPerPage;
  const visibleRows = results.slice(start, start + rowsPerPage);

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <table className="min-w-full bg-white rounded-lg shadow border border-gray-600">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b border-gray-300 text-black">City</th>
            <th className="px-6 py-3 border-b border-gray-300 text-black">Venue/Location</th>
            <th className="px-6 py-3 border-b border-gray-300 text-black">Activity</th>
            <th className="px-6 py-3 border-b border-gray-300 text-black">Map</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, idx) => {
            return (
              <tr key={idx} className="text-black hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 border-b border-gray-300 text-black">{row.city || "-"}</td>
                <td className="px-6 py-3 border-b border-gray-300 text-black">{row.sport_location || row.venue || "-"}</td>
                <td className="px-6 py-3 border-b border-gray-300 text-black">{row.sport || "-"}</td>
                <td className="px-6 py-3 border-b border-gray-300 text-center">
                  {onViewOnMap ? (
                    <button
                      onClick={() => onViewOnMap(row)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors"
                      title="View on map"
                    >
                      📍 View
                    </button>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-center gap-4 mt-4">
        <button 
          disabled={pageSafe === 1} 
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          className="px-4 py-2 bg-purple-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>
        <span className="py-2 text-white">{pageSafe} / {totalPages}</span>
        <button 
          disabled={pageSafe === totalPages} 
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          className="px-4 py-2 bg-purple-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ResultTable;