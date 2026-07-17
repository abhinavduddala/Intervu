import React from 'react';
import { Target } from 'lucide-react';

const PatternCard = ({ 
  patternName, 
  mastery = 0, 
  recommendedCount = 2 
}) => {
  const masteryColor = (val) => {
    if (val >= 80) return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20';
    if (val >= 50) return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
    return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
  };

  const progressColor = (val) => {
    if (val >= 80) return 'bg-[#22C55E]';
    if (val >= 50) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-4.5 rounded-xl shadow-sm space-y-3.5 select-none text-xs font-semibold text-[#0F172A] hover:border-indigo-100/80 transition-all">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-[#0F172A] truncate" title={patternName}>
          {patternName}
        </h4>
        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${masteryColor(mastery)}`}>
          {Math.round(mastery)}% Mastery
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${progressColor(mastery)}`}
            style={{ width: `${mastery}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-[10px] text-[#64748B] font-medium">
          <span className="flex items-center gap-1 font-mono">
            <Target className="h-3 w-3 text-[#4F46E5]" />
            <span>Target Coverage</span>
          </span>
          <span className="font-bold text-[#0F172A]">
            {recommendedCount > 0 ? `${recommendedCount} problems left` : 'Completed'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PatternCard;
