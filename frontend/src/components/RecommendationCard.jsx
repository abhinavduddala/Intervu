import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Clock } from 'lucide-react';

const RecommendationCard = ({ 
  questionId, 
  title, 
  difficulty = 'easy', 
  pattern = 'Generic', 
  estimatedTime = 20, 
  reason, 
  className = '' 
}) => {
  const diffColors = {
    easy: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20',
    medium: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20',
    hard: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20'
  };

  return (
    <div className={`border border-[#E2E8F0] p-5 rounded-lg bg-white shadow-sm flex flex-col justify-between h-[180px] hover:border-indigo-200 transition-colors ${className}`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${diffColors[difficulty.toLowerCase()]}`}>
            {difficulty}
          </span>
          <span className="text-[10px] text-[#64748B] font-mono">{pattern}</span>
        </div>
        
        <h4 className="text-sm font-bold text-[#0F172A] line-clamp-1 mb-1.5">{title}</h4>
        {reason && <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{reason}</p>}
      </div>
      
      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
          <Clock className="h-3.5 w-3.5" />
          <span>{estimatedTime} mins</span>
        </div>
        
        <Link 
          to={`/workspace/${questionId}`} 
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-all"
        >
          <span>Start Practice</span>
          <PlayCircle className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default RecommendationCard;
