/**
 * QuickActions component for Sportify.
 * Displays a set of quick action buttons for user convenience.
 * Actions include quick suggestion, nearby activities, joining groups, and scheduling a game.
 *
 * @component
 */
const QuickActions = () => {
  const actions = [
    { label: 'Quick Suggestion' },
    { label: 'Nearby Activities' },
    { label: 'Join Groups' },
    { label: 'Schedule Game' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className="bg-slate-800 border border-slate-700 hover:border-slate-600 hover:scale-105 p-5 rounded-2xl transition-all duration-200 text-center"
          >
            {/* TODO: Add your icon here (optional) */}
            <div className="font-medium text-sm">{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
