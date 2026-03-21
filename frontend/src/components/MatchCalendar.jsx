import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MatchCalendar = ({ onSelectDate }) => {
  const [centerDate, setCenterDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

  // Notify parent when date changes
  useEffect(() => {
    if (onSelectDate) {
      onSelectDate(selectedDate);
    }
  }, [selectedDate, onSelectDate]);
  
  // Generate 7 days with centerDate as middle (3 before, today position, 3 after)
  const getDates = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dates = [];
    
    // Generate from -3 to +3 days relative to centerDate
    for (let i = -3; i <= 3; i++) {
      const d = new Date(centerDate);
      d.setDate(centerDate.getDate() + i);
      
      // Check if this date is today
      const today = new Date();
      const isToday = d.toDateString() === today.toDateString();
      
      dates.push({
        dayStr: isToday ? 'Today' : days[d.getDay()],
        dateNum: d.getDate(),
        month: d.toLocaleString('default', { month: 'short' }),
        fullDate: d.toDateString(),
        isToday,
        isSelected: d.toDateString() === selectedDate
      });
    }
    return dates;
  };

  const dates = getDates();

  // Handle arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [centerDate]);

  const handlePrevious = () => {
    const newDate = new Date(centerDate);
    newDate.setDate(centerDate.getDate() - 1);
    setCenterDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(centerDate);
    newDate.setDate(centerDate.getDate() + 1);
    setCenterDate(newDate);
  };

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Date Navigation Bar */}
      <div className="glass rounded-2xl border border-white/10 p-4">
        {/* Header with date info and arrows */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full hover:bg-white/10 transition-all text-[#00ff87] hover:text-white transform hover:scale-110"
            title="Previous day (← Arrow Key)"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>

          <div className="text-center flex-1">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Selected Date
            </p>
            <p className="text-xl font-black text-white">
              {formatDateDisplay(new Date(selectedDate))}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-white/10 transition-all text-[#00ff87] hover:text-white transform hover:scale-110"
            title="Next day (→ Arrow Key)"
          >
            <ChevronRight size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* 7-Day Strip */}
        <div className="flex items-center justify-between gap-2">
          {dates.map((date, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDate(date.fullDate)}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all transform hover:scale-105 ${
                date.isSelected
                  ? 'bg-[#00ff87] text-black shadow-lg shadow-[#00ff87]/30'
                  : date.isToday
                  ? 'bg-white/10 border-2 border-[#00ff87] text-white hover:bg-white/20'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <span className={`text-[9px] uppercase font-bold tracking-wider mb-1 ${
                date.isSelected ? 'text-black font-black' : 'text-gray-400'
              }`}>
                {date.dayStr}
              </span>
              <span className={`text-lg font-black ${
                date.isSelected ? 'text-black' : ''
              }`}>
                {date.dateNum}
              </span>
              <span className={`text-[8px] font-semibold opacity-70 ${
                date.isSelected ? 'text-black' : ''
              }`}>
                {date.month}
              </span>
            </button>
          ))}
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center mt-3 font-medium">
          Use ← → arrow keys to navigate dates
        </p>
      </div>
    </div>
  );
};


export default MatchCalendar;
