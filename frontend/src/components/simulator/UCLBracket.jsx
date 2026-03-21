import React, { useState, useEffect } from 'react';
import BracketColumn from './BracketColumn';

const initialUCLState = {
  leftR16: [
    { id: 'l_r16_1', home: 'Arsenal', away: 'FC Porto', winner: null },
    { id: 'l_r16_2', home: 'Barcelona', away: 'Napoli', winner: null },
    { id: 'l_r16_3', home: 'Paris SG', away: 'R. Sociedad', winner: null },
    { id: 'l_r16_4', home: 'Atl. Madrid', away: 'Inter Milan', winner: null },
  ],
  rightR16: [
    { id: 'r_r16_1', home: 'Dortmund', away: 'PSV', winner: null },
    { id: 'r_r16_2', home: 'Bayern', away: 'Lazio', winner: null },
    { id: 'r_r16_3', home: 'Man City', away: 'Copenhagen', winner: null },
    { id: 'r_r16_4', home: 'Real Madrid', away: 'RB Leipzig', winner: null },
  ],
  leftQF: [
    { id: 'l_qf_1', home: null, away: null, winner: null },
    { id: 'l_qf_2', home: null, away: null, winner: null },
  ],
  rightQF: [
    { id: 'r_qf_1', home: null, away: null, winner: null },
    { id: 'r_qf_2', home: null, away: null, winner: null },
  ],
  leftSF: [
    { id: 'l_sf_1', home: null, away: null, winner: null },
  ],
  rightSF: [
    { id: 'r_sf_1', home: null, away: null, winner: null },
  ],
  final: [
    { id: 'final_1', home: null, away: null, winner: null },
  ]
};

const UCLBracket = () => {
  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem('ucl_bracket_v2');
    if (saved) return JSON.parse(saved);
    return JSON.parse(JSON.stringify(initialUCLState));
  });

  useEffect(() => {
    localStorage.setItem('ucl_bracket_v2', JSON.stringify(matches));
  }, [matches]);

  const propagateLogic = (state) => {
    const propagateLink = (source1, source2, target) => {
      target.home = source1.winner;
      target.away = source2.winner;
      if (target.winner && target.winner !== target.home && target.winner !== target.away) {
        target.winner = null;
      }
    };

    // R16 -> QF
    propagateLink(state.leftR16[0], state.leftR16[1], state.leftQF[0]);
    propagateLink(state.leftR16[2], state.leftR16[3], state.leftQF[1]);
    propagateLink(state.rightR16[0], state.rightR16[1], state.rightQF[0]);
    propagateLink(state.rightR16[2], state.rightR16[3], state.rightQF[1]);

    // QF -> SF
    propagateLink(state.leftQF[0], state.leftQF[1], state.leftSF[0]);
    propagateLink(state.rightQF[0], state.rightQF[1], state.rightSF[0]);

    // SF -> Final
    propagateLink(state.leftSF[0], state.rightSF[0], state.final[0]);

    return state;
  };

  const handleSelectWinner = (matchId, winnerTeam) => {
    setMatches(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      for (const category in newState) {
        const m = newState[category].find(x => x.id === matchId);
        if (m) {
          m.winner = winnerTeam;
          break;
        }
      }
      return propagateLogic(newState);
    });
  };

  const handleReset = () => {
    setMatches(JSON.parse(JSON.stringify(initialUCLState)));
  };

  return (
    <div className="flex flex-col h-full mt-4 bg-[#111] rounded-3xl border border-[#222] shadow-xl overflow-hidden pt-8">
      {/* Controls */}
      <div className="flex justify-between items-center mb-8 px-8">
        <div>
           <h2 className="text-2xl font-bold text-white">Champions League Knockouts</h2>
           <p className="text-gray-400 text-sm mt-1">Starting from the Round of 16</p>
        </div>
        <button 
          onClick={handleReset}
          className="px-4 py-2 bg-[#222] text-gray-300 hover:text-white hover:bg-[#333] font-bold rounded-lg border border-[#444] transition-colors"
        >
          Reset Bracket
        </button>
      </div>

      {/* Bracket Canvas */}
      {/* Added more padding and gap spacing to make the tree look spacious and proper */}
      <div className="flex-1 flex justify-between items-stretch overflow-x-auto min-h-[700px] relative mt-4 px-8 pb-12 custom-scrollbar">
        
        {/* Left Side */}
        <div className="flex gap-16">
          <BracketColumn title="Round of 16" matches={matches.leftR16} onSelectWinner={handleSelectWinner} side="left" />
          <BracketColumn title="Quarter Finals" matches={matches.leftQF} onSelectWinner={handleSelectWinner} side="left" />
          <BracketColumn title="Semi Finals" matches={matches.leftSF} onSelectWinner={handleSelectWinner} side="left" />
        </div>

        {/* Center - Final */}
        <div className="flex flex-col justify-center items-center px-12 relative min-w-[250px]">
          <BracketColumn title="The Final" matches={matches.final} onSelectWinner={handleSelectWinner} side="center" />
          
          {/* Champion Display */}
          {matches.final[0].winner && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[120px] flex flex-col items-center animate-slideDown">
               <span className="text-yellow-500 font-bold tracking-widest uppercase text-xs mb-2">Champion</span>
               <div className="text-3xl font-black text-white bg-yellow-500/20 border border-yellow-500/50 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.2)] whitespace-nowrap">
                 {matches.final[0].winner}
               </div>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex gap-16">
          <BracketColumn title="Semi Finals" matches={matches.rightSF} onSelectWinner={handleSelectWinner} side="right" />
          <BracketColumn title="Quarter Finals" matches={matches.rightQF} onSelectWinner={handleSelectWinner} side="right" />
          <BracketColumn title="Round of 16" matches={matches.rightR16} onSelectWinner={handleSelectWinner} side="right" />
        </div>
        
      </div>
    </div>
  );
};

export default UCLBracket;
