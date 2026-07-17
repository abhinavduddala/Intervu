import React from 'react';
import { Calendar, Clock, Star, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import DifficultyBadge from '../explorer/DifficultyBadge';
import CompanyTag from '../explorer/CompanyTag';

const RevisionCard = ({ 
  revision, 
  onStart, 
  onComplete, 
  onSkip 
}) => {
  const {
    id,
    question_id,
    question_title,
    difficulty = 'medium',
    topic_name = 'General',
    pattern_name = 'Logic',
    last_revised_at,
    priority = 'Medium',
    estimatedTime = 20,
    companyTags = []
  } = revision;

  const priorityStyles = (pri) => {
    const normalized = String(pri).toLowerCase();
    if (normalized === 'high') return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
    if (normalized === 'medium') return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
    return 'text-[#64748B] bg-[#F1F5F9] border-[#E2E8F0]';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 flex flex-col justify-between select-none text-xs font-semibold text-[#0F172A] gap-4">
      <div>
        <div className="flex justify-between items-center gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <DifficultyBadge difficulty={difficulty} />
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${priorityStyles(priority)}`}>
              {priority} Priority
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-[10px] text-[#64748B] font-mono">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last revised: {formatDate(last_revised_at)}</span>
          </div>
        </div>

        <h3 className="text-sm font-extrabold text-[#0F172A] leading-tight mb-2 truncate">
          {question_title}
        </h3>

        <div className="flex items-center gap-3 text-[10px] text-[#64748B] font-mono mb-3">
          <span>Topic: <strong className="text-[#475569]">{topic_name}</strong></span>
          <span>•</span>
          <span>Pattern: <strong className="text-[#475569]">{pattern_name}</strong></span>
        </div>

        {/* Company tags */}
        {companyTags && companyTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {companyTags.slice(0, 3).map((c, i) => (
              <CompanyTag key={i} name={c} />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3.5 mt-auto text-xs font-semibold">
        <div className="flex items-center gap-1 text-[#64748B]">
          <Clock className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px]">{estimatedTime}m target</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSkip(question_id)}
            className="px-2.5 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] rounded-lg transition-colors"
            title="Skip Revision"
          >
            Skip
          </button>
          
          <button
            onClick={() => onStart(question_id)}
            className="px-2.5 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#4F46E5] rounded-lg transition-colors flex items-center gap-1"
            title="Start solving"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Start</span>
          </button>

          <button
            onClick={() => onComplete(question_id)}
            className="px-2.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg transition-colors flex items-center gap-1"
            title="Mark solved complete"
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>Complete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevisionCard;
