import React from 'react';
import ProgressRing from './ProgressRing';

const ReadinessCard = ({ overallScore = 75 }) => {
  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-6 select-none text-xs font-semibold text-[#0F172A]">
      <ProgressRing percent={overallScore} size={110} strokeWidth={9} />
      
      <div className="flex-1 text-center md:text-left space-y-1.5">
        <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">
          Overall Placement Readiness
        </h2>
        <p className="text-xs text-[#64748B] leading-relaxed max-w-xl font-medium">
          Based on your solved coding problems, AI reviews, topic mastery, and active revision history.
        </p>
        
        <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4 text-[10px] font-mono text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
            <span>Solved Accuracy Target Met</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#4F46E5]" />
            <span>AI Reviews Tracked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadinessCard;
