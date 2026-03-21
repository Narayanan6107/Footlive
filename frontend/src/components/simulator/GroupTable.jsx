import React from 'react';

const GroupTable = ({ groupLetter, teams, matches, onTeamChange, predefinedTeams }) => {
  // teams is an array of team names or null.
  // Calculate standings from matches
  const standings = teams.map((teamName, idx) => ({
    id: `g${groupLetter}_t${idx}`,
    name: teamName,
    p: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0
  })).filter(t => t.name); // only calculate for selected teams

  // Compute standings based on matches array
  matches.forEach(match => {
    if (!match.winner || !match.home || !match.away) return;
    
    const homeTeam = standings.find(t => t.name === match.home);
    const awayTeam = standings.find(t => t.name === match.away);
    
    if (!homeTeam || !awayTeam) return;

    homeTeam.p += 1;
    awayTeam.p += 1;

    if (match.winner === 'DRAW') {
      homeTeam.d += 1;
      homeTeam.pts += 1;
      awayTeam.d += 1;
      awayTeam.pts += 1;
    } else if (match.winner === match.home) {
      homeTeam.w += 1;
      homeTeam.pts += 3;
      // Simulated 1-0 for W, 0-1 for L
      homeTeam.gd += 1;
      awayTeam.l += 1;
      awayTeam.gd -= 1;
    } else if (match.winner === match.away) {
      awayTeam.w += 1;
      awayTeam.pts += 3;
      awayTeam.gd += 1;
      homeTeam.l += 1;
      homeTeam.gd -= 1;
    }
  });

  // Sort standings: Pts descending, then GD descending, then name ascending
  standings.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return a.name.localeCompare(b.name);
  });

  // Fill up to 4 empty slots for UI
  const displayRows = [...standings];
  while (displayRows.length < 4) {
    displayRows.push({ id: Math.random(), name: null, p: 0, w:0, d: 0, l: 0, gd: 0, pts: 0 });
  }

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden w-full max-w-sm flex flex-col shadow-lg">
      <div className="bg-[#1a1a1a] px-4 py-3 flex justify-between items-center border-b border-[#222]">
        <h3 className="text-lg font-bold text-white">Group {groupLetter}</h3>
        <span className="text-xs font-semibold text-gray-500 px-2 py-1 bg-[#222] rounded-md">
          {standings.length}/4 Teams
        </span>
      </div>

      <div className="p-3">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-[#333]">
            <tr>
              <th className="pb-2 font-semibold">Club</th>
              <th className="pb-2 font-semibold text-center w-8">P</th>
              <th className="pb-2 font-semibold text-center w-8">GD</th>
              <th className="pb-2 font-semibold text-center w-8">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]/50">
            {displayRows.map((row, index) => (
              <tr key={row.id || index} className={`${index < 2 ? 'bg-[#1a1a1a]/50' : ''} ${index === 2 ? 'border-t-2 border-[#111]' : ''}`}>
                <td className="py-2.5 font-medium relative">
                  {/* Qualification marker */}
                  {index < 2 && row.name && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[70%] bg-emerald-500 rounded-r-md"></div>
                  )}
                  {index === 2 && row.name && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[70%] bg-yellow-500 rounded-r-md"></div>
                  )}
                  
                  <div className="pl-3">
                    {onTeamChange ? (
                      <select 
                        value={row.name || ""} 
                        onChange={(e) => onTeamChange(groupLetter, index, e.target.value)}
                        className="bg-transparent text-white border border-[#333] rounded px-1 py-0.5 text-xs outline-none focus:border-blue-500 hover:bg-[#222] transition-colors w-full cursor-pointer appearance-none"
                      >
                        <option value="" disabled className="text-gray-500">Select...</option>
                        {predefinedTeams.map(pt => (
                           <option key={pt} value={pt} className="bg-[#111]">{pt}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={row.name ? 'text-gray-200' : 'text-gray-600 italic'}>
                        {row.name || 'Slot ' + (index + 1)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 text-center text-gray-400">{row.p}</td>
                <td className="py-2.5 text-center text-gray-400">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                <td className="py-2.5 text-center font-bold text-white">{row.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupTable;
