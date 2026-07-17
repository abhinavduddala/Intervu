import React from 'react';

const CompanyCard = ({ company, readiness = 0, className = '' }) => {
  return (
    <div className={`flex items-center gap-4 justify-between border border-[#E2E8F0] p-4 rounded-lg bg-white ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-xs font-bold text-[#0F172A]">
          {company.substring(0, 1)}
        </div>
        <div>
          <span className="text-xs font-bold text-[#0F172A]">{company}</span>
          <div className="text-[10px] text-[#64748B] mt-0.5">Readiness Score</div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-1 max-w-[200px]">
        <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden border border-[#E2E8F0]/30">
          <div 
            className="bg-[#4F46E5] h-full rounded-full" 
            style={{ width: `${readiness}%` }}
          />
        </div>
        <span className="text-xs font-bold font-mono text-[#0F172A] min-w-[32px] text-right">
          {readiness}%
        </span>
      </div>
    </div>
  );
};

export default CompanyCard;
