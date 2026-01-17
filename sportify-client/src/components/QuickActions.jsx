const QuickActions = () => {
  const actions = [
    { icon: '⚡', label: 'Quick Match' },
    { icon: '🗺️', label: 'Nearby Courts' },
    { icon: '👥', label: 'Join Group' },
    { icon: '📅', label: 'Schedule Game' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/20 p-6 rounded-2xl hover:scale-105 hover:border-purple-500/40 transition-all duration-300 group"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
              {action.icon}
            </div>
            <div className="font-semibold">{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
