import React, { useState } from 'react';
import { Star, Link2, Check, Share2 } from 'lucide-react';
import DifficultyBadge from '../explorer/DifficultyBadge';
import QuestionBadge from '../explorer/QuestionBadge';

const QuestionHeader = ({ 
  question, 
  status = 'NOT_STARTED', 
  isFavorite = false,
  onFavorite 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-6 select-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Title and Badge */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
            #{question.learningOrder || 1}
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
              {question.title}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <DifficultyBadge difficulty={question.difficulty} />
              <QuestionBadge status={status} />
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onFavorite}
            className={`p-2.5 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-bold ${
              isFavorite 
                ? 'border-amber-200 bg-amber-50 text-[#F59E0B]' 
                : 'border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] bg-white'
            }`}
            title="Mark as Favorite"
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>
          
          <button
            onClick={handleCopyLink}
            className="p-2.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] bg-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Copy Workspace Link"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-[#22C55E]" />
                <span className="text-[#22C55E]">Copied</span>
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuestionHeader;
