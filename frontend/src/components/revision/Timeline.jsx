import React from 'react';
import { CalendarRange, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Timeline = ({ upcoming = [] }) => {
  // Sort upcoming list into bins
  const today = [];
  const tomorrow = [];
  const thisWeek = [];
  const nextWeek = [];

  upcoming.forEach((item) => {
    if (!item.next_revision_at) return;
    const diffTime = new Date(item.next_revision_at) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      today.push(item);
    } else if (diffDays === 1) {
      tomorrow.push(item);
    } else if (diffDays <= 7) {
      thisWeek.push(item);
    } else {
      nextWeek.push(item);
    }
  });

  const renderSection = (title, items) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider font-bold">
          {title} ({items.length})
        </div>
        <div className="flex flex-col gap-2 border-l border-[#E2E8F0] pl-3 ml-1.5">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs hover:border-indigo-100 transition-all">
              <div className="min-w-0">
                <Link to={`/workspace/${item.question_id}`} className="font-bold text-[#0F172A] hover:text-[#4F46E5] transition-colors truncate block">
                  {item.question_title}
                </Link>
                <div className="flex items-center gap-2 mt-0.5 text-[9px] text-[#64748B] font-mono">
                  <span className="capitalize">{item.difficulty}</span>
                  <span>•</span>
                  <div className="flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    <span>{item.estimatedTime || 20}m</span>
                  </div>
                </div>
              </div>
              
              <Link 
                to={`/workspace/${item.question_id}`} 
                className="text-[10px] font-bold text-[#4F46E5] flex items-center gap-0.5 shrink-0"
              >
                <span>Revise</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const hasItems = today.length > 0 || tomorrow.length > 0 || thisWeek.length > 0 || nextWeek.length > 0;

  return (
    <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm select-none text-xs font-semibold text-[#0F172A] space-y-4">
      <div className="flex items-center gap-1.5 border-b border-[#F1F5F9] pb-3">
        <CalendarRange className="h-4.5 w-4.5 text-[#4F46E5] shrink-0" />
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
          Upcoming Schedule Timeline
        </h3>
      </div>

      {!hasItems ? (
        <div className="text-center py-6 text-[#64748B] italic">
          No upcoming revisions scheduled.
        </div>
      ) : (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {renderSection('Today', today)}
          {renderSection('Tomorrow', tomorrow)}
          {renderSection('This Week', thisWeek)}
          {renderSection('Next Week', nextWeek)}
        </div>
      )}
    </div>
  );
};

export default Timeline;
