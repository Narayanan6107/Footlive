import React from 'react';
import MatchCard from './MatchCard';

const BracketColumn = ({ title, matches, onSelectWinner, side }) => {
  return (
    <div className={`flex flex-col items-center flex-1 justify-around gap-6 relative z-10 ${
      side === 'left' ? 'pl-2' : side === 'right' ? 'pr-2' : 'px-4'
    }`}>
      {title && (
        <h3 className="absolute -top-10 text-sm font-black text-gray-500 uppercase tracking-widest bg-[#111] px-4 py-1 rounded-full border border-[#222]">
          {title}
        </h3>
      )}
      
      {matches.map((match) => (
        <MatchCard 
          key={match.id} 
          match={match} 
          onSelectWinner={onSelectWinner} 
          side={side} 
        />
      ))}
    </div>
  );
};

export default BracketColumn;
