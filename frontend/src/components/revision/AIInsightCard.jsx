import React from 'react';
import { Sparkles } from 'lucide-react';

const AIInsightCard = ({ insights = [] }) => {
  const defaultInsights = [
    'You tend to forget Graph problems after one week of solving.',
    'Focus on Dynamic Programming recursion before Google interviews.',
    'Revisit Medium-level Tree nodes traversal challenges.'
  ];

  const list = insights.length > 0 ? insights : defaultInsights;

  return (
    <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-4 select-none text-xs font-semibold text-[#0F172A]">
      <div className="flex items-center gap-1.5 border-b border-[#F1F5F9] pb-3">
        <Sparkles className="h-4.5 w-4.5 text-[#4F46E5] shrink-0" />
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
          AI Spaced Repetition Insights
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {list.map((ins, idx) => (
          <div 
            key={idx} 
            className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-lg text-xs leading-relaxed text-[#475569] font-medium"
          >
            {ins}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsightCard;
