import React from 'react';
import { Trophy } from 'lucide-react';

const MatchCard = ({ match, roundDesc, onSelectWinner, side, allowDraw = false }) => {
  // side is 'left', 'right', or 'center'
  
  const handleSelect = (teamName) => {
    if (!teamName) return;
    onSelectWinner(match.id, teamName);
  };

  const isHomeWinner = match.winner === match.home && match.home;
  const isAwayWinner = match.winner === match.away && match.away;
  const isDraw = match.winner === 'DRAW';
  const bothKnown = match.home && match.away;

  return (
    <div className={`relative flex flex-col justify-center bg-[#111] border border-[#222] rounded-xl overflow-hidden w-48 shadow-lg transition-all duration-300 ${
      bothKnown ? 'hover:border-[#444] hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]' : 'opacity-70 grayscale-[0.3]'
    }`}>
      {/* Round description (e.g. "Game 1") */}
      {roundDesc && (
        <div className="bg-[#0a0a0a] text-center py-1 border-b border-[#222]">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{roundDesc}</span>
        </div>
      )}

      {/* Teams Container */}
      <div className="flex flex-col relative group">
        
        {/* Home Team */}
        <button 
          disabled={!bothKnown}
          onClick={() => handleSelect(match.home)}
          className={`px-3 py-2 flex items-center justify-between border-b border-[#222] transition-colors ${
            match.winner 
              ? isHomeWinner ? 'bg-blue-600/20 text-white' : 'text-gray-500 grayscale' 
              : bothKnown ? 'hover:bg-[#1a1a1a] text-gray-200' : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <span className={`text-sm font-semibold truncate ${isHomeWinner ? 'text-blue-400' : ''}`}>
            {match.home || 'TBD'}
          </span>
          {isHomeWinner && <Trophy size={14} className="text-blue-500 flex-shrink-0" />}
        </button>

        {/* Away Team */}
        <button 
          disabled={!bothKnown}
          onClick={() => handleSelect(match.away)}
          className={`px-3 py-2 flex items-center justify-between transition-colors ${
            match.winner 
              ? isAwayWinner ? 'bg-emerald-600/20 text-white' : 'text-gray-500 grayscale' 
              : bothKnown ? 'hover:bg-[#1a1a1a] text-gray-200' : 'text-gray-600 cursor-not-allowed'
          }`}
        >
          <span className={`text-sm font-semibold truncate ${isAwayWinner ? 'text-emerald-400' : ''}`}>
            {match.away || 'TBD'}
          </span>
          {isAwayWinner && <Trophy size={14} className="text-emerald-500 flex-shrink-0" />}
        </button>
        
        {/* Subtle center marker or Draw Button */}
        {bothKnown && (
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#111] px-1 border border-[#333] rounded-md transition-opacity z-10 ${
             allowDraw ? (isDraw ? 'border-yellow-500 bg-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'opacity-0 group-hover:opacity-100 hover:bg-[#222]') : 'pointer-events-none opacity-0 group-hover:opacity-100'
          }`}>
             {allowDraw ? (
               <button 
                 onClick={(e) => { e.stopPropagation(); onSelectWinner(match.id, 'DRAW'); }}
                 className={`text-[9px] font-bold px-1 py-0.5 rounded ${isDraw ? 'text-yellow-500' : 'text-gray-400 hover:text-white'}`}
               >
                 DRAW
               </button>
             ) : (
               <span className="text-[9px] font-bold text-gray-400">VS</span>
             )}
          </div>
        )}
      </div>

    </div>
  );
};

export default MatchCard;
