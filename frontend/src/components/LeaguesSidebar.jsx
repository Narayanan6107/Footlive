import React from 'react';
import { Trophy, Star, Target, Zap, Globe, Award } from 'lucide-react';

const TOP_LEAGUES = [
  { id: 'PL', name: "Premier League", icon: <Target className="text-purple-500" size={18} /> },
  { id: 'CL', name: "Champions League", icon: <Star className="text-blue-400" size={18} /> },
  { id: 'PD', name: "LaLiga", icon: <Zap className="text-orange-500" size={18} /> },
  { id: 'BL1', name: "Bundesliga", icon: <Target className="text-red-500" size={18} /> },
  { id: 'SA', name: "Serie A", icon: <Target className="text-blue-600" size={18} /> },
  { id: 'FL1', name: "Ligue 1", icon: <Target className="text-yellow-600" size={18} /> },
  { id: 'EL', name: "Europa League", icon: <Award className="text-orange-400" size={18} /> },
  { id: 'ISL', name: "Indian Super League", icon: <Globe className="text-blue-500" size={18} /> },
  { id: 'FAC', name: "FA Cup", icon: <Trophy className="text-red-400" size={18} /> },
  { id: 'WC', name: "FIFA World Cup", icon: <Trophy className="text-yellow-500" size={18} /> },
];

const LeaguesSidebar = ({ selectedLeague, onSelectLeague }) => {
  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] p-4 text-white">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-lg font-bold">Top leagues</h2>
        {selectedLeague && (
          <button 
            onClick={() => onSelectLeague(null)}
            className="text-[10px] font-black text-[#00ff87] uppercase tracking-widest hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="space-y-1">
        <button
          onClick={() => onSelectLeague(null)}
          className={`w-full flex items-center space-x-4 px-3 py-3 rounded-xl transition-all text-left group ${
            selectedLeague === null ? 'bg-[#1a1a1a] ring-1 ring-white/10' : 'hover:bg-[#1a1a1a]'
          }`}
        >
          <div className="flex-shrink-0">
            <Globe className={selectedLeague === null ? 'text-[#00ff87]' : 'text-gray-400'} size={18} />
          </div>
          <span className={`text-sm font-medium transition-colors ${
            selectedLeague === null ? 'text-white' : 'text-gray-300 group-hover:text-white'
          }`}>
            All Leagues
          </span>
        </button>

        {TOP_LEAGUES.map((league) => (
          <button
            key={league.id}
            onClick={() => onSelectLeague(league.id)}
            className={`w-full flex items-center space-x-4 px-3 py-3 rounded-xl transition-all text-left group ${
              selectedLeague === league.id ? 'bg-[#1a1a1a] ring-1 ring-white/10' : 'hover:bg-[#1a1a1a]'
            }`}
          >
            <div className="flex-shrink-0">
              {league.icon}
            </div>
            <span className={`text-sm font-medium transition-colors ${
              selectedLeague === league.id ? 'text-white' : 'text-gray-300 group-hover:text-white'
            }`}>
              {league.name}
            </span>
            {selectedLeague === league.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff87] shadow-[0_0_8px_#00ff87]"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LeaguesSidebar;
