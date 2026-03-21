import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Trophy, Loader, ChevronDown, ChevronUp } from 'lucide-react';

const MatchList = ({ selectedDate, selectedLeague }) => {
  const [allMatches, setAllMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedLeagues, setExpandedLeagues] = useState({});

  // Competitions to fetch matches from
  const COMPETITIONS = ['PL', 'SA', 'PD', 'BL1', 'FL1', 'CL'];

  // Competition info for display
  const COMP_INFO = {
    PL: { name: 'Premier League', country: 'England', color: '#3d195b' },
    SA: { name: 'Serie A', country: 'Italy', color: '#003a70' },
    PD: { name: 'La Liga', country: 'Spain', color: '#ee1a3b' },
    BL1: { name: 'Bundesliga', country: 'Germany', color: '#d20515' },
    FL1: { name: 'Ligue 1', country: 'France', color: '#dae025' },
    CL: { name: 'UEFA Champions League', country: 'Europe', color: '#003399' }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    
    try {
      const today = new Date();
      const dateFrom = new Date(today);
      dateFrom.setDate(dateFrom.getDate() - 3);
      const dateTo = new Date(today);
      dateTo.setDate(dateTo.getDate() + 3);

      const dateFromStr = formatDate(dateFrom);
      const dateToStr = formatDate(dateTo);

      const matchesData = {};

      // Fetch matches from all competitions
      for (const compId of COMPETITIONS) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/football/competitions/${compId}/matches?dateFrom=${dateFromStr}&dateTo=${dateToStr}`
          );
          const result = await response.json();

          if (result.success && result.data.matches) {
            result.data.matches.forEach(match => {
              const matchDate = new Date(match.utcDate).toDateString();

              if (!matchesData[matchDate]) {
                matchesData[matchDate] = [];
              }

              matchesData[matchDate].push({
                ...match,
                competitionId: compId,
                competitionName: COMP_INFO[compId].name,
                competitionColor: COMP_INFO[compId].color
              });
            });
          }
        } catch (err) {
          console.error(`Error fetching matches for ${compId}:`, err);
        }
      }

      // Sort matches within each date by kick-off time
      Object.keys(matchesData).forEach(date => {
        matchesData[date].sort((a, b) => 
          new Date(a.utcDate) - new Date(b.utcDate)
        );
      });

      setAllMatches(matchesData);
      
      // Initially expand all leagues that have matches for the selected date
      const initialExpanded = {};
      const matchesForDate = matchesData[selectedDate] || [];
      matchesForDate.forEach(m => {
        initialExpanded[m.competitionId] = true;
      });
      setExpandedLeagues(initialExpanded);
      
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const toggleLeague = (leagueId) => {
    setExpandedLeagues(prev => ({
      ...prev,
      [leagueId]: !prev[leagueId]
    }));
  };

  const getMatchStatus = (match) => {
    if (match.status === 'FINISHED') return { text: 'FT', color: 'bg-gray-800', textColor: 'text-gray-400' };
    if (match.status === 'LIVE' || match.status === 'IN_PLAY') return { text: 'LIVE', color: 'bg-red-600', textColor: 'text-white pulse' };
    return { 
      text: match.utcDate ? new Date(match.utcDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBD', 
      color: 'bg-emerald-500/10', 
      textColor: 'text-emerald-400' 
    };
  };

  // Filter and group matches for selected date
  const selectedDateMatches = allMatches[selectedDate] || [];
  
  const groupedMatches = selectedDateMatches.reduce((acc, match) => {
    // If a league is selected, skip matches from other leagues
    if (selectedLeague && match.competitionId !== selectedLeague) {
      return acc;
    }

    if (!acc[match.competitionId]) {
      acc[match.competitionId] = {
        id: match.competitionId,
        name: match.competitionName,
        color: match.competitionColor,
        matches: []
      };
    }
    acc[match.competitionId].matches.push(match);
    return acc;
  }, {});

  const sortedLeagues = Object.values(groupedMatches);

  if (loading) {
    return (
      <div className="py-20 text-center bg-[#0a0a0a] rounded-3xl border border-white/5 mx-4">
        <Loader size={40} className="animate-spin mx-auto mb-6 text-[#00ff87]" />
        <p className="text-gray-400 font-medium tracking-wide">Syncing real-time match intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 flex flex-col items-center gap-4 text-center mx-4">
        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-red-300 font-bold text-lg">Connection Issue</h3>
          <p className="text-red-200/60 text-sm max-w-xs">{error}</p>
        </div>
        <button 
          onClick={fetchMatches}
          className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-full text-sm font-bold transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="px-2">
      {sortedLeagues.length === 0 ? (
        <div className="bg-[#111] rounded-3xl border border-white/5 p-12 text-center shadow-2xl">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy size={32} className="text-gray-600" />
          </div>
          <p className="text-gray-300 text-lg font-bold mb-2">No Matches Today</p>
          <p className="text-gray-500 text-sm">Check back later for updates or browse another date.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedLeagues.map((league) => (
            <div key={league.id} className="overflow-hidden">
              {/* League Header */}
              <button 
                onClick={() => toggleLeague(league.id)}
                className="w-full flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.07] rounded-2xl transition-all border border-white/5 group mb-3 shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-1.5 h-8 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)]" 
                    style={{ backgroundColor: league.color, boxShadow: `0 0 15px ${league.color}44` }}
                  ></div>
                  <div className="text-left">
                    <h3 className="text-sm font-black text-white/90 uppercase tracking-[0.2em]">{league.name}</h3>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{league.matches.length} Matches Scheduled</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   {expandedLeagues[league.id] ? (
                    <ChevronUp size={18} className="text-white/20 group-hover:text-[#00ff87] transition-colors" />
                  ) : (
                    <ChevronDown size={18} className="text-white/20 group-hover:text-[#00ff87] transition-colors" />
                  )}
                </div>
              </button>

              {/* Matches List */}
              {expandedLeagues[league.id] && (
                <div className="space-y-3 transition-opacity duration-300">
                  {league.matches.map((match) => {
                    const status = getMatchStatus(match);
                    return (
                      <div
                        key={match.id}
                        className="bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/5 p-4 hover:border-[#00ff87]/30 hover:shadow-[0_0_30px_rgba(0,255,135,0.05)] transition-all cursor-pointer group backdrop-blur-sm"
                      >
                        <div className="flex items-center">
                          {/* Time/Status */}
                          <div className="w-20 flex flex-col items-center justify-center border-r border-white/5 pr-4">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${status.color} ${status.textColor}`}>
                              {status.text}
                            </span>
                          </div>

                          {/* Teams and Score */}
                          <div className="flex-1 px-4 flex items-center justify-between">
                            {/* Home Team */}
                            <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
                              <span className="text-sm font-bold text-white/70 group-hover:text-white truncate text-right transition-colors">
                                {match.homeTeam.shortName || match.homeTeam.name}
                              </span>
                              {match.homeTeam.crest && (
                                <img src={match.homeTeam.crest} alt="" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                              )}
                            </div>

                            {/* Score/VS */}
                            <div className="px-6 flex flex-col items-center">
                              {match.status === 'FINISHED' || match.status === 'IN_PLAY' || match.status === 'LIVE' ? (
                                <div className="text-xl font-black text-[#00ff87] tabular-nums tracking-tighter drop-shadow-[0_0_10px_rgba(0,255,135,0.3)]">
                                  {match.score.fullTime.home} : {match.score.fullTime.away}
                                </div>
                              ) : (
                                <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">VS</div>
                              )}
                            </div>

                            {/* Away Team */}
                            <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
                              {match.awayTeam.crest && (
                                <img src={match.awayTeam.crest} alt="" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                              )}
                              <span className="text-sm font-bold text-white/70 group-hover:text-white truncate transition-colors">
                                {match.awayTeam.shortName || match.awayTeam.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchList;
