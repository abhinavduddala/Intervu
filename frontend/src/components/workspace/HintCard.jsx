import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const HintCard = ({ hint }) => {
  const [expanded, setExpanded] = useState(false);

  if (!hint) return null;

  return (
    <div className="border border-indigo-100/60 rounded-xl bg-indigo-50/30 overflow-hidden select-none text-xs font-semibold text-[#0F172A]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-indigo-50/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-[#4F46E5]">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span className="font-bold">AI Practice Hint</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-[#64748B]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#64748B]" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 text-xs font-medium text-[#475569] leading-relaxed border-t border-indigo-100/40 pt-3">
          {hint}
        </div>
      )}
    </div>
  );
};

export default HintCard;
