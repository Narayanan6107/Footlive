import React, { useState, useEffect, useMemo } from 'react';
import GroupTable from './GroupTable';
import BracketColumn from './BracketColumn';
import MatchCard from './MatchCard';

const WORLD_CUP_TEAMS = [
  "Argentina", "France", "Brazil", "England", "Belgium", "Croatia", "Netherlands", "Italy", 
  "Portugal", "Spain", "USA", "Mexico", "Uruguay", "Germany", "Colombia", "Senegal", 
  "Japan", "Morocco", "Switzerland", "Denmark", "Iran", "South Korea", "Australia", 
  "Ecuador", "Poland", "Serbia", "Wales", "Cameroon", "Canada", "Costa Rica", "Qatar", 
  "Saudi Arabia", "Ghana", "Tunisia", "Nigeria", "Algeria", "Egypt", "Mali", "Ivory Coast", 
  "Peru", "Chile", "Venezuela", "Jamaica", "Panama", "Iraq", "UAE", "New Zealand", "Sweden"
];

// 12 Groups: A through L
const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const generateGroupMatches = (groupLetter, teams) => {
  return [
    { id: `g${groupLetter}_m1`, home: teams[0], away: teams[1], winner: null },
    { id: `g${groupLetter}_m2`, home: teams[2], away: teams[3], winner: null },
    { id: `g${groupLetter}_m3`, home: teams[0], away: teams[2], winner: null },
    { id: `g${groupLetter}_m4`, home: teams[1], away: teams[3], winner: null },
    { id: `g${groupLetter}_m5`, home: teams[0], away: teams[3], winner: null },
    { id: `g${groupLetter}_m6`, home: teams[1], away: teams[2], winner: null },
  ];
};

const generateInitialState = () => {
  const state = {
    groups: {},
    knockout: {
      leftR32: Array.from({length: 8}, (_,i) => ({ id: `l_r32_${i+1}`, home: null, away: null, winner: null })),
      rightR32: Array.from({length: 8}, (_,i) => ({ id: `r_r32_${i+1}`, home: null, away: null, winner: null })),
      leftR16: Array.from({length: 4}, (_,i) => ({ id: `l_r16_${i+1}`, home: null, away: null, winner: null })),
      rightR16: Array.from({length: 4}, (_,i) => ({ id: `r_r16_${i+1}`, home: null, away: null, winner: null })),
      leftQF: Array.from({length: 2}, (_,i) => ({ id: `l_qf_${i+1}`, home: null, away: null, winner: null })),
      rightQF: Array.from({length: 2}, (_,i) => ({ id: `r_qf_${i+1}`, home: null, away: null, winner: null })),
      leftSF: [{ id: `l_sf_1`, home: null, away: null, winner: null }],
      rightSF: [{ id: `r_sf_1`, home: null, away: null, winner: null }],
      final: [{ id: `final_1`, home: null, away: null, winner: null }]
    }
  };

  // Assign 4 random teams per group initially, to avoid blank slates out of the box
  let teamPool = [...WORLD_CUP_TEAMS];
  GROUP_LETTERS.forEach(letter => {
    const groupTeams = [];
    for (let i = 0; i < 4; i++) {
      if (teamPool.length > 0) {
        groupTeams.push(teamPool.shift());
      } else {
        groupTeams.push(null);
      }
    }
    state.groups[letter] = {
      teams: groupTeams,
      matches: generateGroupMatches(letter, groupTeams)
    };
  });

  return state;
};

const WorldCupSimulator = () => {
  const [activeTab, setActiveTab] = useState('groups');
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('wc_bracket');
    if (saved) return JSON.parse(saved);
    return generateInitialState();
  });

  useEffect(() => {
    localStorage.setItem('wc_bracket', JSON.stringify(state));
  }, [state]);

  const handleGroupTeamChange = (groupLetter, teamIndex, newTeamName) => {
    setState(prev => {
      const newState = { ...prev, groups: { ...prev.groups } };
      const group = { ...newState.groups[groupLetter] };
      const newTeams = [...group.teams];
      
      const oldTeamName = newTeams[teamIndex];
      newTeams[teamIndex] = newTeamName;
      group.teams = newTeams;

      // Update matches replacing the old team name with new one, and reset winner if it was involved
      group.matches = group.matches.map(m => {
        const newMatch = { ...m };
        if (newMatch.home === oldTeamName) newMatch.home = newTeamName;
        if (newMatch.away === oldTeamName) newMatch.away = newTeamName;
        if (newMatch.winner === oldTeamName || newMatch.winner === 'DRAW') newMatch.winner = null;
        return newMatch;
      });

      newState.groups[groupLetter] = group;
      return newState;
    });
  };

  const handleGroupMatchWinner = (groupLetter, matchId, winnerTeam) => {
    setState(prev => {
      const newState = { ...prev, groups: { ...prev.groups } };
      const group = { ...newState.groups[groupLetter] };
      
      group.matches = group.matches.map(m => 
        m.id === matchId ? { ...m, winner: winnerTeam } : m
      );

      newState.groups[groupLetter] = group;
      return newState;
    });
  };

  const propagateKnockout = (koState) => {
    const propagateLink = (source1, source2, target) => {
      target.home = source1.winner && source1.winner !== 'DRAW' ? source1.winner : null;
      target.away = source2.winner && source2.winner !== 'DRAW' ? source2.winner : null;
      if (target.winner && target.winner !== target.home && target.winner !== target.away) {
        target.winner = null;
      }
    };

    // R32 -> R16 Array logic
    for (let i = 0; i < 4; i++) {
        propagateLink(koState.leftR32[i*2], koState.leftR32[i*2+1], koState.leftR16[i]);
        propagateLink(koState.rightR32[i*2], koState.rightR32[i*2+1], koState.rightR16[i]);
    }
    
    // R16 -> QF
    for (let i = 0; i < 2; i++) {
        propagateLink(koState.leftR16[i*2], koState.leftR16[i*2+1], koState.leftQF[i]);
        propagateLink(koState.rightR16[i*2], koState.rightR16[i*2+1], koState.rightQF[i]);
    }

    // QF -> SF
    propagateLink(koState.leftQF[0], koState.leftQF[1], koState.leftSF[0]);
    propagateLink(koState.rightQF[0], koState.rightQF[1], koState.rightSF[0]);

    // SF -> Final
    propagateLink(koState.leftSF[0], koState.rightSF[0], koState.final[0]);

    return koState;
  };

  const handleKnockoutWinner = (matchId, winnerTeam) => {
    setState(prev => {
      const newState = { ...prev };
      const ko = JSON.parse(JSON.stringify(newState.knockout));
      
      for (const round in ko) {
        const match = ko[round].find(m => m.id === matchId);
        if (match) {
          match.winner = winnerTeam;
          break;
        }
      }

      newState.knockout = propagateKnockout(ko);
      return newState;
    });
  };

  const handleReset = () => {
    setState(generateInitialState());
  };

  const handleGenerateKnockouts = () => {
     // A complex logic to auto-populate R32 matches from groups based on points
     alert("Knockout Auto-Generation visually completes. (Functionality simplified for demonstration).");
     // In a real FIFA bracket, you'd calculate the top two of each 12 groups (24) + 8 best thirds.
     // For this interactive builder, we'll let users manually build them or auto-fill random winners!
     
     // Quick auto-populate demo:
     setState(prev => {
        const next = {...prev};
        const ko = JSON.parse(JSON.stringify(next.knockout));
        
        let qualified = [];
        GROUP_LETTERS.forEach(g => {
            const teams = prev.groups[g].teams;
            if(teams[0]) qualified.push(teams[0]);
            if(teams[1]) qualified.push(teams[1]);
        });
        // Pad out to 32 if 24
        qualified = qualified.concat(WORLD_CUP_TEAMS.slice(24, 32));

        for(let i=0; i<8; i++){
            ko.leftR32[i].home = qualified[i*4];
            ko.leftR32[i].away = qualified[i*4+1];
            ko.rightR32[i].home = qualified[i*4+2];
            ko.rightR32[i].away = qualified[i*4+3];
        }

        next.knockout = propagateKnockout(ko);
        setActiveTab('knockout');
        return next;
     });
  };

  return (
    <div className="flex flex-col h-full mt-4">
      <div className="flex justify-between items-center mb-6 px-4">
        <h2 className="text-xl font-bold text-white">FIFA World Cup 2026 Simulator</h2>
        <div className="flex gap-4">
           <button 
              onClick={handleGenerateKnockouts}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg transition-colors text-white"
            >
              Populate Knockouts
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 font-bold rounded-lg border border-[#444] transition-colors"
            >
              Reset All
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#222] mb-8 px-4">
        <button 
          onClick={() => setActiveTab('groups')}
          className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'groups' ? 'text-white border-emerald-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
        >
          Group Stage
        </button>
        <button 
          onClick={() => setActiveTab('knockout')}
          className={`px-6 py-3 font-bold border-b-2 transition-colors ${activeTab === 'knockout' ? 'text-white border-emerald-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
        >
          Knockout Stage (Round of 32)
        </button>
      </div>

      {/* Group Stage Tab */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 overflow-y-auto max-h-[70vh] px-4 custom-scrollbar">
          {GROUP_LETTERS.map(letter => (
            <div key={letter} className="flex flex-col gap-4">
               <GroupTable 
                 groupLetter={letter}
                 teams={state.groups[letter].teams}
                 matches={state.groups[letter].matches}
                 onTeamChange={handleGroupTeamChange}
                 predefinedTeams={WORLD_CUP_TEAMS}
               />
               <div className="flex flex-col gap-2 bg-[#111] p-3 rounded-xl border border-[#222]">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Matches</h4>
                  {state.groups[letter].matches.map(m => (
                     <MatchCard 
                        key={m.id} 
                        match={m} 
                        onSelectWinner={(id, winner) => handleGroupMatchWinner(letter, id, winner)} 
                        allowDraw={true}
                     />
                  ))}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Knockout Stage Tab */}
      {activeTab === 'knockout' && (
        <div className="flex-1 flex justify-between items-stretch overflow-x-auto overflow-y-auto max-h-[70vh] relative custom-scrollbar px-4 pb-20">
            {/* Left Wing */}
            <div className="flex gap-8">
              <BracketColumn title="R32" matches={state.knockout.leftR32} onSelectWinner={handleKnockoutWinner} side="left" />
              <BracketColumn title="R16" matches={state.knockout.leftR16} onSelectWinner={handleKnockoutWinner} side="left" />
              <BracketColumn title="Quarter Finals" matches={state.knockout.leftQF} onSelectWinner={handleKnockoutWinner} side="left" />
              <BracketColumn title="Semi Finals" matches={state.knockout.leftSF} onSelectWinner={handleKnockoutWinner} side="left" />
            </div>

            {/* Center Final */}
            <div className="flex flex-col justify-center items-center px-16 relative">
               <BracketColumn title="WORLD CUP FINAL" matches={state.knockout.final} onSelectWinner={handleKnockoutWinner} side="center" />
               {state.knockout.final[0].winner && state.knockout.final[0].winner !== 'DRAW' && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[150px] flex flex-col items-center animate-slideDown z-20">
                     <span className="text-yellow-500 font-bold tracking-widest uppercase text-[10px] mb-2 drop-shadow-lg text-center leading-tight">
                        2026 World Champion
                     </span>
                     <div className="text-3xl font-black text-white bg-gradient-to-b from-[#b8860b] to-[#8b6508] border border-yellow-500/50 px-8 py-4 rounded-3xl shadow-[0_0_50px_rgba(255,215,0,0.4)] whitespace-nowrap">
                       {state.knockout.final[0].winner}
                     </div>
                  </div>
               )}
            </div>

            {/* Right Wing */}
            <div className="flex gap-8">
              <BracketColumn title="Semi Finals" matches={state.knockout.rightSF} onSelectWinner={handleKnockoutWinner} side="right" />
              <BracketColumn title="Quarter Finals" matches={state.knockout.rightQF} onSelectWinner={handleKnockoutWinner} side="right" />
              <BracketColumn title="R16" matches={state.knockout.rightR16} onSelectWinner={handleKnockoutWinner} side="right" />
              <BracketColumn title="R32" matches={state.knockout.rightR32} onSelectWinner={handleKnockoutWinner} side="right" />
            </div>
        </div>
      )}
    </div>
  );
};

export default WorldCupSimulator;
