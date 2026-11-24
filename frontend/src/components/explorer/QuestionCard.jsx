import React from 'react';
import { Star, Bookmark, Eye, Clock, Code2 } from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';
import CompanyTag from './CompanyTag';
import QuestionBadge from './QuestionBadge';

const QuestionCard = ({ 
  question, 
  status = 'NOT_STARTED', 
  isFavorite = false, 
  isBookmarked = false,
  viewMode = 'list',
  onPreview,
  onFavorite,
  onBookmark,
  onOpenWorkspace
}) => {
  const {
    id,
    title,
    difficulty,
    topic,
    pattern,
    companyTags = [],
    estimatedTime = 20,
    frequency = 'Medium',
    learningOrder = 1,
  } = question;

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavorite(id);
  };

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    onBookmark(id);
  };

  const handleSolveClick = (e) => {
    e.stopPropagation();
    if (onOpenWorkspace) onOpenWorkspace(id);
  };

  if (viewMode === 'grid') {
    return (
      <div 
        onClick={() => onPreview(question)}
        className="bg-white border border-[#E2E8F0] hover:border-indigo-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 flex flex-col justify-between min-h-[240px] cursor-pointer group select-none relative"
      >
        <div className="space-y-3">
          {/* Header row: learning order & actions */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-[#64748B] font-bold bg-[#F8FAFC] border border-[#E2E8F0] px-1.5 py-0.5 rounded">
              #{learningOrder}
            </span>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={handleFavoriteClick} 
                className={`p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors ${isFavorite ? 'text-[#F59E0B]' : 'text-[#64748B]'}`}
                title="Favorite"
              >
                <Star className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={handleBookmarkClick} 
                className={`p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors ${isBookmarked ? 'text-[#4F46E5]' : 'text-[#64748B]'}`}
                title="Bookmark"
              >
                <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Question Title */}
          <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#4F46E5] line-clamp-2 transition-colors">
            {title}
          </h3>

          {/* Difficulty and Metadata Focus Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <DifficultyBadge difficulty={difficulty} />
            <span className="text-[10px] font-mono text-[#64748B]">
              {topic} • {pattern}
            </span>
          </div>

          {/* Company tags inline */}
          {companyTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {companyTags.slice(0, 3).map((c, i) => (
                <CompanyTag key={i} name={c} />
              ))}
              {companyTags.length > 3 && (
                <span className="text-[9px] text-[#64748B] font-mono self-center font-bold pl-0.5">
                  +{companyTags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Row: Estimated Time, Status, Actions */}
        <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 mt-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[#64748B]">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono text-[10px]">{estimatedTime}m</span>
            </div>
            <QuestionBadge status={status} />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(question); }}
              className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
              title="Preview details"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleSolveClick}
              className="ml-1 px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
              title="Solve in the coding workspace"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Solve</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List View Mode
  return (
    <div 
      onClick={() => onPreview(question)}
      className="bg-white border border-[#E2E8F0] hover:border-indigo-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 flex flex-col justify-between gap-4 cursor-pointer group select-none"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="flex items-start gap-3.5 min-w-0">
          <span className="text-xs font-mono font-bold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            #{learningOrder}
          </span>
          
          <div className="space-y-2 min-w-0">
            {/* Title */}
            <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors leading-tight truncate">
              {title}
            </h3>

            {/* Difficulty + Topic + Pattern */}
            <div className="flex items-center gap-2 flex-wrap">
              <DifficultyBadge difficulty={difficulty} />
              <span className="text-[10px] font-mono text-[#64748B]">
                {topic} • {pattern}
              </span>
            </div>

            {/* Corporate tags */}
            {companyTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {companyTags.slice(0, 4).map((c, i) => (
                  <CompanyTag key={i} name={c} />
                ))}
                {companyTags.length > 4 && (
                  <span className="text-[9px] text-[#64748B] font-mono self-center font-bold pl-0.5">
                    +{companyTags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Estimated Time, Status, Actions */}
      <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 text-xs font-semibold">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[#64748B]">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono text-[10px]">{estimatedTime} mins</span>
          </div>
          <QuestionBadge status={status} />
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={handleFavoriteClick} 
            className={`p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors ${isFavorite ? 'text-[#F59E0B]' : 'text-[#64748B]'}`}
            title="Favorite"
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={handleBookmarkClick} 
            className={`p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors ${isBookmarked ? 'text-[#4F46E5]' : 'text-[#64748B]'}`}
            title="Bookmark"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleSolveClick}
            className="ml-1 px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            title="Solve in the coding workspace"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Solve</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
