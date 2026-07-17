import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  trend, 
  trendType = 'neutral', // 'up' | 'down' | 'neutral'
  description, 
  className = '' 
}) => {
  const trendColors = {
    up: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20',
    down: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20',
    neutral: 'text-[#64748B] bg-[#F1F5F9] border-[#E2E8F0]'
  };

  return (
    <div className={`bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-[#64748B] tracking-wide uppercase select-none">{title}</span>
        {Icon && (
          <div className="p-2 bg-indigo-50/50 border border-indigo-100 text-[#4F46E5] rounded-lg">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <div>
        <div className="text-2xl font-extrabold text-[#0F172A] tracking-tight">{value}</div>
        
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded border ${trendColors[trendType]}`}>
              {trendType === 'up' && <ArrowUpRight className="h-2.5 w-2.5" />}
              {trendType === 'down' && <ArrowDownRight className="h-2.5 w-2.5" />}
              {trend}
            </span>
          )}
          {description && (
            <span className="text-[10px] text-[#64748B] font-medium leading-none">{description}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
