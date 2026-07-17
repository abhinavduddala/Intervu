import React from 'react';
import { Lightbulb } from 'lucide-react';

const InsightsPanel = ({ insights = [] }) => {
  if (insights.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-[#64748B] italic">
        No active AI recommendations available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {insights.map((insight, index) => (
        <div key={index} className="flex gap-2.5 items-start p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-lg">
          <Lightbulb className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
          <span className="text-xs text-[#475569] font-medium leading-relaxed">
            {insight}
          </span>
        </div>
      ))}
    </div>
  );
};

export default InsightsPanel;
