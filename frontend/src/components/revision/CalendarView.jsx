import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView = ({ 
  calendarData = {}, 
  onSelectDate 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days grid
  const days = [];
  
  // Empty blocks for offset days before the first day of the month
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }

  // Active days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleDayClick = (day) => {
    if (!day) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelectDate(dateStr);
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm select-none text-xs font-semibold text-[#0F172A] space-y-4">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
          Revision Planner Calendar
        </h3>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 rounded hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-[#64748B]" />
          </button>
          <span className="font-bold font-mono text-[11px] text-[#0F172A] min-w-[90px] text-center">
            {monthNames[month]} {year}
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-1.5 rounded hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-[#64748B]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-bold">
        {/* Days Header */}
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-[10px] text-[#64748B] font-mono py-1">
            {day}
          </div>
        ))}

        {/* Days grid items */}
        {days.map((day, idx) => {
          if (!day) return <div key={idx} className="py-2.5" />;

          // Format check for revision counts
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const count = calendarData[dateStr] || 0;
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

          return (
            <button
              key={idx}
              onClick={() => handleDayClick(day)}
              className={`relative py-2.5 hover:bg-indigo-50/50 hover:text-[#4F46E5] rounded-lg transition-all flex flex-col items-center justify-center border border-transparent ${
                isToday 
                  ? 'border-[#4F46E5] bg-indigo-50/20 text-[#4F46E5]' 
                  : 'text-[#0F172A]'
              }`}
            >
              <span className="font-mono text-[10px]">{day}</span>
              {/* Revision count indicators */}
              {count > 0 && (
                <span className="absolute bottom-1.5 flex gap-0.5">
                  {Array.from({ length: Math.min(3, count) }).map((_, i) => (
                    <span key={i} className="h-1 w-1 bg-[#4F46E5] rounded-full shrink-0" />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
