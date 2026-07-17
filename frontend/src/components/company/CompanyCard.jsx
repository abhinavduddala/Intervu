import React from 'react';
import { Target, ArrowRight } from 'lucide-react';

const CompanyCard = ({ 
  companyName, 
  readiness = 0, 
  difficulty = 'Medium', 
  topicsRemaining = 3, 
  hoursToReady = 12,
  isSelected = false,
  onSelect 
}) => {
  // Initials for mockup logo
  const initials = companyName ? companyName.substring(0, 2).toUpperCase() : 'CO';

  const readinessStyles = (score) => {
    if (score >= 80) return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20';
    if (score >= 50) return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
    return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
  };

  return (
    <div 
      onClick={() => onSelect(companyName)}
      className={`bg-white border p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 flex flex-col justify-between h-[210px] cursor-pointer group select-none ${
        isSelected ? 'border-[#4F46E5] ring-2 ring-indigo-50' : 'border-[#E2E8F0] hover:border-indigo-200'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Logo placeholder */}
          <div className="h-9 w-9 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] font-bold text-xs flex items-center justify-center shrink-0">
            {initials}
          </div>
          
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${readinessStyles(readiness)}`}>
            {Math.round(readiness)}% Ready
          </span>
        </div>

        <h3 className="text-sm font-extrabold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors mb-1 truncate">
          {companyName}
        </h3>
        
        <div className="text-[10px] font-mono text-[#64748B] flex items-center gap-1.5 flex-wrap">
          <span>Diff: <strong className="text-[#475569]">{difficulty}</strong></span>
          <span>•</span>
          <span>{topicsRemaining} topics left</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3.5 mt-auto text-xs font-semibold text-[#64748B]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">Est. Duration</span>
          <span className="text-xs font-bold text-[#0F172A] font-mono">{hoursToReady} hours</span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onSelect(companyName); }}
          className="flex items-center gap-1 text-[10px] font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
        >
          <span>Readiness Roadmap</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

    </div>
  );
};

export default CompanyCard;
