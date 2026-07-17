import React from 'react';

const ProgressCard = ({ label, percentage = 0, solved = 0, total = 0, className = '' }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-center text-xs font-semibold text-[#0F172A]">
        <span>{label}</span>
        <div className="flex items-center gap-1.5 font-mono text-[#64748B] text-[11px]">
          <span>{percentage}%</span>
          {total > 0 && (
            <>
              <span>•</span>
              <span>{solved}/{total} solved</span>
            </>
          )}
        </div>
      </div>
      
      <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden border border-[#E2E8F0]/30">
        <div 
          className="bg-[#4F46E5] h-full rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} 
        />
      </div>
    </div>
  );
};

export default ProgressCard;
