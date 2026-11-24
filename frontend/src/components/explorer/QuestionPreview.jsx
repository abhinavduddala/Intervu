import React from 'react';
import { X, Code2, CheckCircle, Star, Info, Sparkles, BookOpen, Command, Compass, Play, BarChart2, CalendarRange } from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';
import CompanyTag from './CompanyTag';
import QuestionBadge from './QuestionBadge';

const QuestionPreview = ({ 
  question, 
  status = 'NOT_STARTED', 
  isFavorite = false,
  onClose,
  onStart,
  onSolve,
  onFavorite,
  onOpenWorkspace,
  onQuickStartRandom // action callback for selecting a random question
}) => {
  if (!question) {
    return (
      <div className="h-full flex flex-col justify-between bg-white border border-[#E2E8F0] rounded-xl p-6 select-none text-xs font-semibold text-[#0F172A] shadow-sm">
        
        {/* Mockup Dashboard Illustration */}
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <div className="w-full max-w-[240px] mx-auto p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-3 shadow-2xs">
            <div className="flex justify-between items-center">
              <span className="h-3 w-16 bg-[#CBD5E1] rounded block animate-pulse" />
              <span className="h-4 w-10 bg-indigo-50 border border-indigo-100 rounded block" />
            </div>
            <div className="space-y-1.5">
              <span className="h-4 w-full bg-[#E2E8F0] rounded block" />
              <span className="h-3 w-2/3 bg-[#F1F5F9] rounded block" />
            </div>
            <div className="flex gap-1.5 pt-1">
              <span className="h-3 w-12 bg-blue-50 border border-blue-100 rounded block" />
              <span className="h-3 w-14 bg-amber-50 border border-amber-100 rounded block" />
            </div>
          </div>

          <div className="text-center max-w-sm mx-auto space-y-2">
            <h4 className="text-sm font-extrabold text-[#0F172A] tracking-tight">Select Coding Question</h4>
            <p className="text-xs text-[#64748B] font-medium leading-relaxed">
              Click any question to view analytical hints, corporate tag frequency, prerequisite listings, and solution links.
            </p>
          </div>
        </div>

        {/* Interactive Keyboard Shortcuts & Quick Actions Footer */}
        <div className="border-t border-[#F1F5F9] pt-5 mt-auto space-y-5">
          {/* Shortcuts list */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[#64748B]">
              <Command className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Workspace Shortcuts</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[10px] text-[#475569] font-medium">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-1.5">
                <span>Open Preview</span>
                <kbd className="px-1.5 py-0.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded font-mono text-[9px]">Click</kbd>
              </div>
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-1.5">
                <span>Start Solving</span>
                <kbd className="px-1.5 py-0.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded font-mono text-[9px]">Space</kbd>
              </div>
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-1.5">
                <span>Mark Solved</span>
                <kbd className="px-1.5 py-0.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded font-mono text-[9px]">S</kbd>
              </div>
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-1.5">
                <span>Toggle Fav</span>
                <kbd className="px-1.5 py-0.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded font-mono text-[9px]">F</kbd>
              </div>
            </div>
          </div>

          {/* Quick actions links */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (onQuickStartRandom) onQuickStartRandom();
              }}
              className="py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm select-none active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Practice Random</span>
            </button>

            <a
              href="/analytics"
              className="py-2.5 bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors select-none active:scale-[0.98]"
            >
              <BarChart2 className="h-4 w-4 text-[#64748B]" />
              <span>Analytics</span>
            </a>
          </div>
        </div>

      </div>
    );
  }

  const {
    id,
    title,
    slug,
    topic,
    pattern,
    difficulty,
    companyTags = [],
    hint = 'No hint provided.',
    prerequisites = [],
    recommendedNext = [],
    acceptanceRate = 50,
    estimatedTime = 20,
  } = question;

  return (
    <div className="flex flex-col h-full bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden select-none text-xs font-semibold text-[#0F172A]">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={difficulty} />
          <QuestionBadge status={status} />
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] transition-colors"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Content Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight leading-snug mb-2">
            {title}
          </h3>
          
          <div className="flex flex-col gap-2.5 border-t border-[#F1F5F9] pt-3 text-[11px] text-[#64748B] font-mono">
            <div className="flex justify-between">
              <span>Topic</span>
              <span className="font-bold text-[#0F172A]">{topic}</span>
            </div>
            <div className="flex justify-between">
              <span>Pattern</span>
              <span className="font-bold text-[#0F172A]">{pattern}</span>
            </div>
            <div className="flex justify-between">
              <span>Est. Solving Duration</span>
              <span className="font-bold text-[#0F172A]">{estimatedTime} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Acceptance</span>
              <span className="font-bold text-[#0F172A]">{acceptanceRate}%</span>
            </div>
          </div>
        </div>

        {/* Company Tags */}
        {companyTags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Interview Frequency Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {companyTags.map((c, i) => (
                <CompanyTag key={i} name={c} />
              ))}
            </div>
          </div>
        )}

        {/* Hints */}
        <div className="space-y-2 bg-indigo-50/50 p-4 border border-indigo-100/60 rounded-lg">
          <div className="flex items-center gap-1.5 text-[#4F46E5]">
            <Sparkles className="h-4 w-4 shrink-0" />
            <h4 className="font-bold text-[11px]">AI Preparation Hint</h4>
          </div>
          <p className="text-xs text-[#475569] font-medium leading-relaxed">
            {hint}
          </p>
        </div>

        {/* Prerequisites */}
        {prerequisites && prerequisites.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Prerequisite Concepts</h4>
            <div className="flex flex-col gap-1.5">
              {prerequisites.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] font-medium text-[#475569]">
                  <BookOpen className="h-3.5 w-3.5 text-[#64748B] shrink-0" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Next Questions */}
        {recommendedNext && recommendedNext.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Recommended Next</h4>
            <div className="flex flex-col gap-1.5">
              {recommendedNext.map((rn, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[11px] font-medium text-[#475569]">
                  <span>{rn}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-col gap-2">
        <button
          onClick={() => (onOpenWorkspace ? onOpenWorkspace(id) : onStart(id))}
          className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm select-none active:scale-[0.98]"
        >
          <Code2 className="h-4 w-4" />
          <span>{status === 'SOLVED' ? 'Solve Again in Workspace' : 'Solve in Workspace'}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">

          {status !== 'SOLVED' && (
            <button
              onClick={() => onSolve(id)}
              className="py-2 bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors col-span-2 select-none active:scale-[0.98]"
            >
              <CheckCircle className="h-4 w-4 text-[#22C55E]" />
              <span>Mark Solved</span>
            </button>
          )}

          <button
            onClick={() => onFavorite(id)}
            className={`py-2 bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors select-none active:scale-[0.98] ${
              isFavorite ? 'text-[#F59E0B] border-[#F59E0B]/20 bg-amber-50/20' : ''
            }`}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            <span>{isFavorite ? 'Unfavorite' : 'Favorite'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default QuestionPreview;
