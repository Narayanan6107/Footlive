import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowUp, ArrowDown, Zap, Trophy, AlertCircle, Flag } from 'lucide-react';

const Standings = () => {
  const navigate = useNavigate();
  const [selectedCompetition, setSelectedCompetition] = useState('PL');
  const [standings, setStandings] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cacheStatus, setCacheStatus] = useState('');

  // Popular competitions
  const popularComps = [
    { id: 'PL', name: 'Premier League', icon: Flag, country: 'England' },
    { id: 'PD', name: 'La Liga', icon: Flag, country: 'Spain' },
    { id: 'SA', name: 'Serie A', icon: Flag, country: 'Italy' },
    { id: 'BL1', name: 'Bundesliga', icon: Flag, country: 'Germany' },
    { id: 'FL1', name: 'Ligue 1', icon: Flag, country: 'France' },
    { id: 'CL', name: 'UEFA Champions League', icon: Trophy, country: 'Europe' },
  ];

  // Fetch standings when competition changes
  useEffect(() => {
    fetchStandings(selectedCompetition);
  }, [selectedCompetition]);

  const fetchStandings = async (compId) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/football/competitions/${compId}/standings`);
      const result = await response.json();

      if (result.success) {
        setStandings(result.data);
        setCacheStatus(result.cached ? '✅ From Cache' : '📡 Fresh Data');
      } else {
        setError('Failed to fetch standings');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getPositionIndicator = (position, total) => {
    // Champions
    if (position <= 2) return { color: 'text-[#00ff87]', bg: 'bg-[#00ff87]/10', label: 'Champion' };
    // Europa League
    if (position <= 6) return { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Europa' };
    // Playoffs
    if (position <= 8) return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Playoff' };
    // Relegation
    if (position > total - 3) return { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Danger' };
    
    return { color: 'text-gray-400', bg: 'bg-white/5', label: '' };
  };

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white font-sans">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Competition Selector */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {popularComps.map(comp => {
              const IconComponent = comp.icon;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompetition(comp.id)}
                  className={`p-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    selectedCompetition === comp.id
                      ? 'bg-[#00ff87] text-black shadow-lg shadow-[#00ff87]/30'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <IconComponent size={18} />
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold">{comp.name}</span>
                    <span className="text-[10px] opacity-75">{comp.country}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-300 font-semibold">Error</p>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="animate-spin mb-4">
                <Trophy size={32} className="text-[#00ff87]" />
              </div>
              <p className="text-gray-400 font-medium">Loading standings...</p>
            </div>
          </div>
        ) : standings?.standings?.length > 0 ? (
          // Standings Table
          <div className="space-y-6">
            {standings.standings.map((stage, stageIdx) => (
              <div key={stageIdx} className="glass rounded-2xl border border-white/10 overflow-hidden">
                {/* Stage Title */}


                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/30">
                        <th className="text-left px-4 py-3 font-bold text-gray-400 text-xs uppercase tracking-wider">POS</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-400 text-xs uppercase tracking-wider">Team</th>
                        <th className="text-center px-4 py-3 font-bold text-gray-400 text-xs uppercase tracking-wider">P</th>
                        <th className="text-center px-4 py-3 font-bold text-gray-400 text-xs uppercase tracking-wider">W</th>
                        <th className="text-center px-4 py-3 font-bold text-gray-400 text-xs uppercase tracking-wider">D</th>
                        <th className="text-center px-4 py-3 font-bold text-gray-400 text-xs uppercase tracking-wider">L</th>
                        <th className="text-center px-4 py-3 font-bold text-gray-400 text-xs uppercase tracking-wider">GF</th>
                        <th className="text-center px-4 py-3 font-bold text-gray-400 text-xs uppercase tracking-wider">GA</th>
                        <th className="text-center px-4 py-3 font-bold text-[#00ff87] text-xs uppercase tracking-wider font-black">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stage.table.map((entry, idx) => {
                        const indicator = getPositionIndicator(entry.position, stage.table.length);
                        return (
                          <tr
                            key={idx}
                            className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                              indicator.label ? indicator.bg : ''
                            }`}
                          >
                            <td className={`px-4 py-3 font-black text-lg ${indicator.color}`}>
                              {entry.position}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {entry.team.crest && (
                                  <img
                                    src={entry.team.crest}
                                    alt={entry.team.name}
                                    className="w-6 h-6 rounded-full"
                                    onError={(e) => (e.target.style.display = 'none')}
                                  />
                                )}
                                <div>
                                  <p className="font-semibold text-white">{entry.team.name}</p>
                                  <p className="text-xs text-gray-500">{entry.team.shortName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">{entry.playedGames}</td>
                            <td className="px-4 py-3 text-center text-green-400 font-semibold">{entry.won}</td>
                            <td className="px-4 py-3 text-center text-yellow-400 font-semibold">{entry.draw}</td>
                            <td className="px-4 py-3 text-center text-red-400 font-semibold">{entry.lost}</td>
                            <td className="px-4 py-3 text-center">{entry.goalsFor}</td>
                            <td className="px-4 py-3 text-center">{entry.goalsAgainst}</td>
                            <td className="px-4 py-3 text-center font-black text-[#00ff87] text-lg">
                              {entry.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="px-6 py-4 border-t border-white/10 flex flex-wrap gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#00ff87]/20 border border-[#00ff87]"></div>
                    <span className="text-gray-400">Champions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-400"></div>
                    <span className="text-gray-400">Europa League</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-400"></div>
                    <span className="text-gray-400">Playoff</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500/20 border border-red-400"></div>
                    <span className="text-gray-400">Relegation</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 font-medium">No standings available</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Standings;
