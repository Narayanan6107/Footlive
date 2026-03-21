import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import footballNews from '../data/football_news.json';

const NewsSidebar = () => {
  // Only take top 4 news for the sidebar
  const recentNews = footballNews.slice(0, 4);

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden hidden xl:block">
      <div className="flex items-center justify-between p-4 border-b border-[#222]">
        <h2 className="text-lg font-bold text-white">Top News</h2>
        <Link to="/news" className="text-sm text-gray-400 hover:text-white transition-colors">
          More <ChevronRight size={16} className="inline pb-0.5" />
        </Link>
      </div>
      
      <div className="divide-y divide-[#222]">
        {recentNews.map((news) => (
          <div key={news.id} className="p-4 flex gap-4 hover:bg-[#151515] transition-colors cursor-pointer group">
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors leading-snug">
                {news.title}
              </h3>
              <div className="flex items-center text-xs text-gray-500 space-x-2">
                <span className="font-medium text-gray-400">{news.source}</span>
                <span>•</span>
                <span>{news.time}</span>
              </div>
            </div>
            {news.imageUrl ? (
               <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#222]">
                 <img src={news.imageUrl} alt="News thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
               </div>
            ) : (
               <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-[#1a1a1a] flex items-center justify-center border border-[#333]">
                 <svg className="w-8 h-8 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
               </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[#222] bg-[#0d0d0d]">
         <Link to="/news" className="w-full py-2 bg-[#1a1a1a] flex justify-center hover:bg-[#222] text-sm text-white font-medium rounded-lg border border-[#333] transition-colors">
            View all news
         </Link>
      </div>
    </div>
  );
};

export default NewsSidebar;
