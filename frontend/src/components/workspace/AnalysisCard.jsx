import React from 'react';
import { Sparkles, Brain, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';

const AnalysisCard = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 select-none text-xs font-semibold text-[#0F172A]">
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
        <Sparkles className="h-5 w-5 text-[#4F46E5] shrink-0" />
        <h3 className="text-sm font-extrabold text-[#0F172A]">AI Complexity Review</h3>
      </div>

      {/* Complexities Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg text-center">
          <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider mb-1">Time Complexity</div>
          <div className="text-base font-extrabold font-mono text-[#4F46E5]">{analysis.timeComplexity || 'O(N)'}</div>
        </div>
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg text-center">
          <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider mb-1">Space Complexity</div>
          <div className="text-base font-extrabold font-mono text-[#4F46E5]">{analysis.spaceComplexity || 'O(N)'}</div>
        </div>
      </div>

      {/* Explanation */}
      {analysis.complexityExplanation && (
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Complexity Details</h4>
          <p className="text-xs text-[#475569] font-medium leading-relaxed">{analysis.complexityExplanation}</p>
        </div>
      )}

      {/* Optimizations */}
      {analysis.optimizationSummary && (
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Optimization Opportunities</h4>
          <p className="text-xs text-[#475569] font-medium leading-relaxed">{analysis.optimizationSummary}</p>
        </div>
      )}

      {/* Interview Feedback */}
      {analysis.interviewFeedback && (
        <div className="bg-indigo-50/50 border border-indigo-100/60 p-4.5 rounded-lg space-y-2.5">
          <div className="flex justify-between items-center border-b border-indigo-100/40 pb-2">
            <div className="flex items-center gap-1.5 text-[#4F46E5]">
              <Brain className="h-4.5 w-4.5 shrink-0" />
              <span className="font-bold text-[11px]">Interview Assessment</span>
            </div>
            <span className="text-base font-extrabold text-[#4F46E5] font-mono">
              {analysis.interviewFeedback.rating || 8}/10
            </span>
          </div>
          <p className="text-xs text-[#475569] font-medium leading-relaxed">
            {analysis.interviewFeedback.assessment || analysis.interviewFeedback.summary}
          </p>
        </div>
      )}

      {/* Edge cases missed */}
      {analysis.edgeCases && analysis.edgeCases.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-[#F59E0B]" />
            <span>Missed Edge Cases</span>
          </h4>
          <ul className="space-y-1.5">
            {analysis.edgeCases.map((ec, idx) => (
              <li key={idx} className="text-xs text-[#475569] font-medium flex items-start gap-1.5 leading-relaxed">
                <ChevronRight className="h-3.5 w-3.5 text-[#64748B] shrink-0 mt-0.5" />
                <span>{ec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alternative Approach */}
      {analysis.alternativeApproach && (
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Alternative Approach</h4>
          <p className="text-xs text-[#475569] font-medium leading-relaxed">{analysis.alternativeApproach}</p>
        </div>
      )}

    </div>
  );
};

export default AnalysisCard;
