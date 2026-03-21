import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import MatchCalendar from '../components/MatchCalendar';
import MatchList from '../components/MatchList';
import NewsSidebar from '../components/NewsSidebar';
import LeaguesSidebar from '../components/LeaguesSidebar';
import { Zap, TrendingUp, Users, Trophy } from 'lucide-react';

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [selectedLeague, setSelectedLeague] = useState(null);

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white font-sans">
      <Navbar />
      
      
      {/* Main Content */}
      <main className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar: Leagues */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-28 bg-[#111]/50 backdrop-blur-md rounded-3xl border border-white/5 p-2 shadow-2xl">
              <LeaguesSidebar 
                selectedLeague={selectedLeague} 
                onSelectLeague={setSelectedLeague} 
              />
            </div>
          </aside>

          {/* Main Content Area: Calendar + Matches */}
          <div className="flex-1 min-w-0">
            <div className="mb-10 bg-[#111]/30 backdrop-blur-sm rounded-3xl border border-white/5 p-4 shadow-xl">
              <MatchCalendar onSelectDate={setSelectedDate} />
            </div>
            
            <div className="min-h-[600px]">
              <MatchList 
                selectedDate={selectedDate} 
                selectedLeague={selectedLeague} 
              />
            </div>
          </div>

          {/* Right Sidebar: News */}
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-28 bg-[#111]/50 backdrop-blur-md rounded-3xl border border-white/5 p-2 shadow-2xl">
              <NewsSidebar />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16 py-8 bg-black/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#00ff87]">Footlive</h3>
              <p className="text-gray-400 text-sm">Your command center for football intelligence.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-[#00ff87] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#00ff87] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#00ff87] transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-[#00ff87] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#00ff87] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#00ff87] transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-[#00ff87] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#00ff87] transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-[#00ff87] transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; 2026 Footlive. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-[#00ff87] transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-[#00ff87] transition-colors">Discord</a>
              <a href="#" className="text-gray-400 hover:text-[#00ff87] transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
