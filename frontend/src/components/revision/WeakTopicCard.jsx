import React from 'react';
import { AlertCircle } from 'lucide-react';

const WeakTopicCard = ({ 
  topicName, 
  mastery = 35, 
  pendingCount = 2,
  recommendation = 'Solve 2 Medium problems'
}) => {
  const masteryColor = (val) => {
    if (val >= 80) return 'text-[#22C55E]';
    if (val >= 50) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  const progressColor = (val) => {
    if (val >= 80) return 'bg-[#22C55E]';
    if (val >= 50) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-4.5 rounded-xl shadow-sm space-y-3 select-none text-xs font-semibold text-[#0F172A] hover:border-red-200 transition-all flex flex-col justify-between h-[155px]">
      <div>
        <div className="flex justify-between items-center gap-2 mb-1.5">
          <h4 className="font-extrabold text-[#0F172A] truncate" title={topicName}>
            {topicName}
          </h4>
          <span className={`font-mono font-bold text-xs ${masteryColor(mastery)}`}>
            {mastery}% Mastery
          </span>
        </div>

        <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${progressColor(mastery)}`}
            style={{ width: `${mastery}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 border-t border-[#F1F5F9] pt-2.5 mt-auto">
        <div className="flex justify-between text-[10px] text-[#64748B]">
          <span>Revisions Pending</span>
          <span className="font-bold text-[#0F172A]">{pendingCount} questions</span>
        </div>
        
        <div className="flex items-start gap-1 p-1.5 bg-red-50/50 border border-red-100 rounded text-[10px] text-[#EF4444]">
          <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
          <span className="font-bold leading-normal truncate" title={recommendation}>{recommendation}</span>
        </div>
      </div>
    </div>
  );
};

export default WeakTopicCard;
