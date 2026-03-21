import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import footballNews from '../data/football_news.json';
import { ArrowUpRight, Search, Filter, TrendingUp, Clock } from 'lucide-react';

const News = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(footballNews.map(news => news.category))];
  
  const filteredNews = footballNews.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         news.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || news.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#0e0e0e] min-h-screen text-white">
      <Navbar />
      
      {/* Search and Filter Section */}
      <section className="border-b border-[#222] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search and Filters */}
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search news, players, teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#00ff87] focus:ring-4 focus:ring-[#00ff87]/5 transition-all placeholder-gray-600"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-white text-black'
                      : 'bg-[#111] border border-[#222] text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((news) => (
              <article 
                key={news.id} 
                className="group bg-[#111] rounded-[24px] border border-[#222] overflow-hidden hover:border-[#444] transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                {news.imageUrl ? (
                  <div className="relative overflow-hidden h-48 bg-[#1a1a1a]">
                    <img 
                      src={news.imageUrl} 
                      alt="News banner" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-[#1a1a1a] to-[#111] flex items-center justify-center border-b border-[#222]">
                    <TrendingUp className="w-12 h-12 text-gray-600" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-gray-300 bg-[#222] border border-[#333] px-3 py-1 rounded-full whitespace-nowrap">
                      {news.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={14} />
                      {news.time}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold text-white mb-3 leading-snug transition-colors line-clamp-2 flex-1">
                    {news.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-sm text-gray-400 line-clamp-3 mb-6">
                    {news.summary}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-400">{news.author}</span>
                      <span className="text-xs text-gray-500">{news.source}</span>
                    </div>
                    <a 
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-[#222] text-gray-400 group-hover:bg-white group-hover:text-black transition-all"
                    >
                      <ArrowUpRight size={18} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <Search size={48} className="text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No news found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default News;
