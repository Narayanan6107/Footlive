import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import UCLBracket from '../components/simulator/UCLBracket';
import WorldCupSimulator from '../components/simulator/WorldCupSimulator';
import { Trophy, Globe2 } from 'lucide-react';

const Simulator = () => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('tournament_mode') || 'UCL';
  });

  useEffect(() => {
    localStorage.setItem('tournament_mode', mode);
  }, [mode]);

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Header & Mode Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-[#111] p-6 rounded-3xl border border-[#222]">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} />
              Tournament Simulator
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl">
              Map out custom bracket progressions and simulate match outcomes to predict the ultimate champion. Your progress is automatically saved to your browser.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#0a0a0a] p-1.5 rounded-2xl border border-[#333]">
            <button
              onClick={() => setMode('UCL')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                mode === 'UCL' 
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Trophy size={18} />
              UCL Mode
            </button>
            <button
              onClick={() => setMode('WC')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                mode === 'WC' 
                  ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Globe2 size={18} />
              World Cup Mode
            </button>
          </div>
        </div>

        {/* Dynamic Simulator Content */}
        <div className="flex-1 min-h-0 flex flex-col">
          {mode === 'UCL' ? <UCLBracket /> : <WorldCupSimulator />}
        </div>
      </main>
    </div>
  );
};

export default Simulator;
