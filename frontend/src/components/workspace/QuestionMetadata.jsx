import React from 'react';
import { Clock, Tag, Compass, Sparkles } from 'lucide-react';

const QuestionMetadata = ({ question }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-[#E2E8F0] p-4.5 rounded-xl shadow-sm select-none text-xs font-semibold text-[#0F172A]">
      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Est. Duration</div>
          <div className="text-xs font-bold text-[#0F172A] mt-0.5">{question.estimatedTime || 20} mins</div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
          <Compass className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Acceptance</div>
          <div className="text-xs font-bold text-[#0F172A] mt-0.5">{question.acceptanceRate || 50}%</div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
          <Tag className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Topic Group</div>
          <div className="text-xs font-bold text-[#0F172A] mt-0.5 truncate max-w-[100px]" title={question.topic}>{question.topic}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="h-8 w-8 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Logical Pattern</div>
          <div className="text-xs font-bold text-[#0F172A] mt-0.5 truncate max-w-[100px]" title={question.pattern}>{question.pattern}</div>
        </div>
      </div>
    </div>
  );
};

export default QuestionMetadata;
