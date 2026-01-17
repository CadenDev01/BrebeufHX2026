const QuickActions = () => {
  const actions = [
    { icon: '⚡', label: 'Quick Match', color: 'from-yellow-500 to-orange-500' },
    { icon: '🗺️', label: 'Nearby Courts', color: 'from-blue-500 to-cyan-500' },
    { icon: '👥', label: 'Join Group', color: 'from-purple-500 to-pink-500' },
    { icon: '📅', label: 'Schedule Game', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`bg-gradient-to-br ${action.color} p-6 rounded-2xl hover:scale-105 transition-transform duration-300 group`}
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
