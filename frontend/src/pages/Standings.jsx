import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowUp, ArrowDown, Zap, Trophy, AlertCircle, Flag, Globe } from 'lucide-react';

const Standings = () => {
  const navigate = useNavigate();
  const [selectedCompetition, setSelectedCompetition] = useState('WC');
  const [standings, setStandings] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cacheStatus, setCacheStatus] = useState('');

  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Popular competitions
  const popularComps = [
    { id: 'WC', name: 'World Cup', emblem: 'https://crests.football-data.org/FIFA.png', country: '2026 Groups', icon: Globe, isWC: true },
    { id: 'PL', name: 'Premier League', emblem: 'https://crests.football-data.org/PL.png', country: 'England', icon: Flag },
    { id: 'PD', name: 'La Liga', emblem: 'https://crests.football-data.org/PD.png', country: 'Spain', icon: Flag },
    { id: 'SA', name: 'Serie A', emblem: 'https://crests.football-data.org/SA.png', country: 'Italy', icon: Flag },
    { id: 'BL1', name: 'Bundesliga', emblem: 'https://crests.football-data.org/BL1.png', country: 'Germany', icon: Flag },
    { id: 'FL1', name: 'Ligue 1', emblem: 'https://crests.football-data.org/FL1.png', country: 'France', icon: Flag },
    { id: 'CL', name: 'Champions League', emblem: 'https://crests.football-data.org/CL.png', country: 'Europe', icon: Trophy },
  ];

  const isWorldCup = selectedCompetition === 'WC';

  // Fetch standings when competition changes
  useEffect(() => {
    fetchStandings(selectedCompetition);
  }, [selectedCompetition]);

  const fetchStandings = async (compId) => {
    setLoading(true);
    setError('');
    setStandings(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/football/competitions/${compId}/standings`);
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
    if (position <= 2) return { color: 'text-white', bg: 'bg-white/10', label: 'Champion' };
    if (position <= 6) return { color: 'text-gray-300', bg: 'bg-[#222]', label: 'Europa' };
    if (position <= 8) return { color: 'text-gray-400', bg: 'bg-[#1a1a1a]', label: 'Playoff' };
    if (position > total - 3) return { color: 'text-gray-500', bg: 'bg-[#111]', label: 'Danger' };
    return { color: 'text-gray-400', bg: 'bg-transparent', label: '' };
  };

  // For World Cup: top 2 advance, rest are eliminated
  const getWCPositionIndicator = (position, total) => {
    if (position === 1) return { color: 'text-[#c9a84c]', bg: 'bg-[#c9a84c]/10', label: 'Advance', border: 'border-l-2 border-[#c9a84c]' };
    if (position === 2) return { color: 'text-emerald-400', bg: 'bg-emerald-500/5', label: 'Advance', border: 'border-l-2 border-emerald-500' };
    return { color: 'text-gray-500', bg: 'bg-transparent', label: 'Eliminated', border: '' };
  };

  // Extract group letter from group string like "GROUP_A" → "A"
  const getGroupLabel = (group) => {
    if (!group) return '';
    return group.replace('GROUP_', 'Group ');
  };

  // Render a single group table (World Cup style)
  const renderWCGroupTable = (stage, idx) => {
    return (
      <div key={idx} className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
        {/* Group Header */}
        <div className="px-5 py-4 flex items-center gap-3 bg-gradient-to-r from-[#c9a84c]/10 to-transparent border-b border-[#222]">
          <div className="w-8 h-8 rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/30 flex items-center justify-center">
            <span className="text-[#c9a84c] text-xs font-black">
              {stage.group ? stage.group.replace('GROUP_', '') : idx + 1}
            </span>
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest">
              {getGroupLabel(stage.group)}
            </h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">FIFA World Cup 2026</p>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] font-bold text-[#c9a84c]/60 uppercase tracking-widest bg-[#c9a84c]/5 px-2 py-1 rounded-full border border-[#c9a84c]/20">
              {stage.table?.length || 0} Teams
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-[10px] uppercase tracking-wider w-8">#</th>
                <th className="text-left px-4 py-2.5 font-bold text-gray-500 text-[10px] uppercase tracking-wider">Team</th>
                <th className="text-center px-3 py-2.5 font-bold text-gray-500 text-[10px] uppercase tracking-wider">P</th>
                <th className="text-center px-3 py-2.5 font-bold text-gray-500 text-[10px] uppercase tracking-wider">W</th>
                <th className="text-center px-3 py-2.5 font-bold text-gray-500 text-[10px] uppercase tracking-wider">D</th>
                <th className="text-center px-3 py-2.5 font-bold text-gray-500 text-[10px] uppercase tracking-wider">L</th>
                <th className="text-center px-3 py-2.5 font-bold text-gray-500 text-[10px] uppercase tracking-wider">GF</th>
                <th className="text-center px-3 py-2.5 font-bold text-gray-500 text-[10px] uppercase tracking-wider">GA</th>
                <th className="text-center px-3 py-2.5 font-bold text-gray-500 text-[10px] uppercase tracking-wider">GD</th>
                <th className="text-center px-4 py-2.5 font-black text-white text-[10px] uppercase tracking-wider">PTS</th>
              </tr>
            </thead>
            <tbody>
              {stage.table?.map((entry, rowIdx) => {
                const indicator = getWCPositionIndicator(entry.position, stage.table.length);
                const isAdvancing = entry.position <= 2;
                return (
                  <tr
                    key={rowIdx}
                    className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.03] ${indicator.bg} ${indicator.border || ''}`}
                  >
                    <td className={`px-4 py-3 font-black text-sm ${indicator.color}`}>
                      {entry.position}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {entry.team.crest && (
                          <img
                            src={entry.team.crest}
                            alt={entry.team.name}
                            className="w-6 h-6 object-contain"
                            onError={(e) => (e.target.style.display = 'none')}
                          />
                        )}
                        <div>
                          <p className={`font-semibold text-sm ${isAdvancing ? 'text-white' : 'text-gray-400'}`}>
                            {entry.team.shortName || entry.team.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-gray-400 text-sm">{entry.playedGames}</td>
                    <td className="px-3 py-3 text-center text-gray-300 font-semibold text-sm">{entry.won}</td>
                    <td className="px-3 py-3 text-center text-gray-400 text-sm">{entry.draw}</td>
                    <td className="px-3 py-3 text-center text-gray-500 text-sm">{entry.lost}</td>
                    <td className="px-3 py-3 text-center text-gray-400 text-sm">{entry.goalsFor}</td>
                    <td className="px-3 py-3 text-center text-gray-400 text-sm">{entry.goalsAgainst}</td>
                    <td className="px-3 py-3 text-center text-gray-400 text-sm">{entry.goalDifference}</td>
                    <td className={`px-4 py-3 text-center font-black text-sm ${isAdvancing ? 'text-[#c9a84c]' : 'text-gray-500'}`}>
                      {entry.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render regular league standings table
  const renderLeagueTable = (stage, stageIdx) => (
    <div key={stageIdx} className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden">
      {stage.group && (
        <div className="px-5 py-3 border-b border-[#222] bg-black/20">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stage.group}</h3>
        </div>
      )}
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
              <th className="text-center px-4 py-3 font-black text-white text-xs uppercase tracking-wider">PTS</th>
            </tr>
          </thead>
          <tbody>
            {stage.table.map((entry, idx) => {
              const indicator = getPositionIndicator(entry.position, stage.table.length);
              return (
                <tr
                  key={idx}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${indicator.label ? indicator.bg : ''}`}
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
                  <td className="px-4 py-3 text-center text-gray-300 font-semibold">{entry.won}</td>
                  <td className="px-4 py-3 text-center text-gray-400 font-semibold">{entry.draw}</td>
                  <td className="px-4 py-3 text-center text-gray-500 font-semibold">{entry.lost}</td>
                  <td className="px-4 py-3 text-center text-gray-400">{entry.goalsFor}</td>
                  <td className="px-4 py-3 text-center text-gray-400">{entry.goalsAgainst}</td>
                  <td className="px-4 py-3 text-center font-black text-white text-lg">{entry.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-[#222] flex flex-wrap gap-6 text-xs bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-white/20 border border-white"></div>
          <span className="text-gray-400">Champions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#222] border border-gray-400"></div>
          <span className="text-gray-400">Europa League</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#1a1a1a] border border-gray-500"></div>
          <span className="text-gray-400">Playoff</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#111] border border-gray-600"></div>
          <span className="text-gray-400">Relegation</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Competition Selector */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {popularComps.map(comp => {
              const isSelected = selectedCompetition === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompetition(comp.id)}
                  className={`p-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    isSelected && comp.isWC
                      ? 'bg-gradient-to-br from-[#c9a84c] to-[#a8873c] text-black shadow-lg shadow-[#c9a84c]/20'
                      : isSelected
                      ? 'bg-white text-black shadow-lg'
                      : comp.isWC
                      ? 'bg-[#c9a84c]/10 border border-[#c9a84c]/30 text-[#c9a84c] hover:bg-[#c9a84c]/20'
                      : 'bg-[#111] border border-[#222] text-gray-300 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {!imageErrors[comp.id] ? (
                      <img
                        src={comp.emblem}
                        alt={comp.name}
                        className="w-full h-full object-contain"
                        onError={() => handleImageError(comp.id)}
                      />
                    ) : (
                      <comp.icon size={18} />
                    )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold">{comp.name}</span>
                    <span className="text-[10px] opacity-75">{comp.country}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* World Cup Banner */}
        {isWorldCup && !loading && !error && standings && (
          <div className="mb-6 p-4 rounded-2xl border border-[#c9a84c]/20 bg-gradient-to-r from-[#c9a84c]/10 via-transparent to-transparent flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#c9a84c]/15 flex items-center justify-center flex-shrink-0">
              <Trophy size={20} className="text-[#c9a84c]" />
            </div>
            <div>
              <h2 className="text-[#c9a84c] font-black text-sm uppercase tracking-widest">FIFA World Cup 2026</h2>
              <p className="text-gray-400 text-xs">
                Group Stage Tables — Top 2 from each group advance to the Round of 32
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#c9a84c]"></div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">1st</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">2nd</span>
              </div>
            </div>
          </div>
        )}

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
              <div className="animate-spin mb-4 text-center">
                <Trophy size={32} className={isWorldCup ? 'text-[#c9a84c] mx-auto' : 'text-gray-400 mx-auto'} />
              </div>
              <p className="text-gray-400 font-medium">
                {isWorldCup ? 'Loading World Cup group tables...' : 'Loading standings...'}
              </p>
            </div>
          </div>
        ) : standings?.standings?.length > 0 ? (
          isWorldCup ? (
            // World Cup: grid of group tables
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {standings.standings.map((stage, idx) => renderWCGroupTable(stage, idx))}
            </div>
          ) : (
            // Regular league: single table layout
            <div className="space-y-6">
              {standings.standings.map((stage, stageIdx) => renderLeagueTable(stage, stageIdx))}
            </div>
          )
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No standings available</p>
            <p className="text-gray-600 text-sm mt-1">
              {isWorldCup ? 'World Cup group stage may not have started yet.' : 'Check back during the season.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Standings;
