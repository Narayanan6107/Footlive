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
      <div className="bg-[#111] rounded-2xl border border-[#222] p-3">
        {/* Header with date info and arrows */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handlePrevious}
            className="p-1.5 rounded-full hover:bg-white/10 transition-all text-gray-400 hover:text-white transform hover:scale-110"
            title="Previous day (← Arrow Key)"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <div className="text-center flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-0.5">
              Selected Date
            </p>
            <p className="text-base font-bold text-white">
              {formatDateDisplay(new Date(selectedDate))}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-full hover:bg-white/10 transition-all text-gray-400 hover:text-white transform hover:scale-110"
            title="Next day (→ Arrow Key)"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* 7-Day Strip */}
        <div className="flex items-center justify-between gap-1">
          {dates.map((date, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDate(date.fullDate)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all transform hover:scale-105 ${
                date.isSelected
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : date.isToday
                  ? 'bg-white/10 border border-white/30 text-white hover:bg-white/20'
                  : 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`text-[9px] uppercase font-medium tracking-wider mb-0.5 ${
                date.isSelected ? 'text-black font-bold' : ''
              }`}>
                {date.dayStr}
              </span>
              <span className={`text-base font-bold ${
                date.isSelected ? 'text-black' : ''
              }`}>
                {date.dateNum}
              </span>
              <span className={`text-[9px] font-medium opacity-80 ${
                date.isSelected ? 'text-black' : ''
              }`}>
                {date.month}
              </span>
            </button>
          ))}
        </div>


      </div>
    </div>
  );
};


export default MatchCalendar;
