function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center text-gray-400 space-y-3">
          <p className="text-sm">
            Created by Ryan Bui, Philip Radoynovski, and Caden Ho
          </p>
          <p className="text-sm">
            Data provided by{' '}
            <a 
              href="https://www.donneesquebec.ca/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Données Québec
            </a>
            {' '}and{' '}
            <a 
              href="https://donnees.montreal.ca/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Ville de Montréal
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
