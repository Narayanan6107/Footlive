import React from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Layout, 
  Trophy, 
  UserCircle, 
  Zap, 
  Shirt,
  ArrowRight
} from 'lucide-react';

const ToolCard = ({ icon: Icon, title, description, badge, comingSoon, path }) => {
  const navigate = useNavigate();

  return (
  <div className={`group relative bg-[#111] rounded-3xl border border-[#222] p-8 transition-all duration-300 overflow-hidden ${
    !comingSoon && 'hover:bg-[#1a1a1a] hover:border-[#333] hover:shadow-xl'
  }`}>
    
    <div className={`relative z-10 ${comingSoon ? 'opacity-30 grayscale-[0.8]' : ''}`}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 bg-[#222] text-white">
        <Icon size={32} />
      </div>
      
      {badge && (
        <span className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-300 bg-[#222] rounded-full border border-[#333]">
          {badge}
        </span>
      )}
      
      <h3 className="text-2xl font-bold mb-3 text-white transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-8">
        {description}
      </p>
      
      <button 
        disabled={comingSoon}
        onClick={() => !comingSoon && path && navigate(path)}
        className={`flex items-center gap-2 text-sm font-semibold transition-all ${
          comingSoon 
            ? 'text-gray-600' 
            : 'text-gray-500 group-hover:text-white'
        }`}
      >
        {comingSoon ? 'Under Development' : 'Launch Tool'} 
        {!comingSoon && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
      </button>
    </div>

    {comingSoon && (
      <span className="absolute top-5 right-5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-300 bg-[#222] bg-black/40 backdrop-blur-md rounded-full border border-[#333]/30 shadow-[0_0_15px_rgba(0,255,135,0.1)] z-20">
        Coming Soon
      </span>
    )}
  </div>
  );
};

const Tools = () => {
  const tools = [
    {
      icon: ClipboardList,
      title: "Lineup Predictor",
      description: "Analyze team news, form, and tactical trends to predict starting XIs for upcoming matches.",
      badge: "Popular",
      path: "/tools/lineup"
    },
    {
      icon: Layout,
      title: "Tactics Board",
      description: "Design and visualize your tactical masterclass. Drag and drop players to create complex formations.",
    },
    {
      icon: Trophy,
      title: "Tournament Simulator",
      description: "Simulate UCL or World Cup playoffs. Predict winners and follow custom bracket progressions.",
      badge: "Featured",
      path: "/tools/simulator"
    },
    {
      icon: UserCircle,
      title: "Player Card Creator",
      description: "Create premium-style player cards with custom stats and ratings for your favorite stars.",
      comingSoon: true
    },
    {
      icon: Zap,
      title: "Match Simulator",
      description: "Simulate potential match outcomes based on historical data and user-defined performance metrics.",
      comingSoon: true
    },
    {
      icon: Shirt,
      title: "Jersey Studio",
      description: "Experiment with colorways, patterns, and sponsor placements to design custom team kits.",
      comingSoon: true
    }
  ];

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <ToolCard key={index} {...tool} />
          ))}
        </div>

        {/* Call to action or info section */}
        <div className="mt-24 bg-[#111] rounded-3xl border border-[#222] p-12 text-center">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Have a tool idea?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              We are constantly expanding our toolkit. If you have a suggestion for a utility that would improve your football experience, let us know.
            </p>
            <button className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all duration-300">
              Submit Feedback
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tools;
