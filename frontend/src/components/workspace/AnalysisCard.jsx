import React, { useState } from 'react';
import { Sparkles, Brain, CheckCircle2, ChevronRight, AlertTriangle, Zap, Copy, Check, Code2, Lightbulb } from 'lucide-react';

const CORRECTNESS = {
  likely_correct: { label: 'Likely correct', cls: 'bg-emerald-50 border-emerald-200 text-[#16A34A]' },
  needs_review: { label: 'Needs review', cls: 'bg-amber-50 border-amber-200 text-[#B45309]' },
  likely_incorrect: { label: 'Likely incorrect', cls: 'bg-red-50 border-red-200 text-[#DC2626]' },
};

const Section = ({ title, icon: Icon, children }) => (
  <div className="space-y-1.5">
    <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{title}</span>
    </h4>
    {children}
  </div>
);

const BulletList = ({ items }) => (
  <ul className="space-y-1.5">
    {items.map((item, idx) => (
      <li key={idx} className="text-xs text-[#475569] font-medium flex items-start gap-1.5 leading-relaxed">
        <ChevronRight className="h-3.5 w-3.5 text-[#64748B] shrink-0 mt-0.5" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const AnalysisCard = ({ analysis, onUseOptimal }) => {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);

  if (!analysis) return null;

  const correctness = analysis.correctness ? CORRECTNESS[analysis.correctness.status] : null;
  const optimal = analysis.optimalSolution;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(optimal.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 text-xs font-semibold text-[#0F172A]">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#4F46E5] shrink-0" />
          <h3 className="text-sm font-extrabold text-[#0F172A]">AI Code Review</h3>
        </div>
        {correctness && (
          <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase ${correctness.cls}`}>{correctness.label}</span>
        )}
      </div>

      {analysis.summary && <p className="text-xs text-[#475569] font-medium leading-relaxed">{analysis.summary}</p>}
      {analysis.correctness?.explanation && (
        <p className="text-[11px] text-[#64748B] font-medium leading-relaxed">{analysis.correctness.explanation}</p>
      )}

      {/* Your complexity vs optimal */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-lg">
          <div className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider mb-1">Your solution</div>
          <div className="font-mono text-[#0F172A] font-extrabold">Time {analysis.timeComplexity}</div>
          <div className="font-mono text-[#0F172A] font-extrabold">Space {analysis.spaceComplexity}</div>
        </div>
        {optimal && (
          <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg">
            <div className="text-[10px] font-mono text-[#4F46E5] uppercase tracking-wider mb-1">Optimal</div>
            <div className="font-mono text-[#4F46E5] font-extrabold">Time {optimal.timeComplexity}</div>
            <div className="font-mono text-[#4F46E5] font-extrabold">Space {optimal.spaceComplexity}</div>
          </div>
        )}
      </div>

      {analysis.complexityExplanation && (
        <Section title="Complexity Details">
          <p className="text-xs text-[#475569] font-medium leading-relaxed whitespace-pre-line">{analysis.complexityExplanation}</p>
        </Section>
      )}

      {/* Optimal solution */}
      {optimal && (
        <div className="border border-indigo-100 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#4F46E5]">
              <Zap className="h-4 w-4" />
              <span className="font-bold text-[11px]">
                {optimal.isUserSolutionOptimal ? 'Your approach is already optimal' : 'Optimal approach'}: {optimal.approach}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#475569] font-medium leading-relaxed whitespace-pre-line">{optimal.explanation}</p>
          {optimal.code && (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowCode((v) => !v)}
                  className="px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  {showCode ? 'Hide optimal code' : 'Show optimal code'}
                </button>
                {showCode && (
                  <>
                    <button onClick={copyCode} className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#475569] text-[11px] font-bold rounded-lg flex items-center gap-1.5">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    {onUseOptimal && (
                      <button onClick={() => onUseOptimal(optimal.code)} className="px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#475569] text-[11px] font-bold rounded-lg">
                        Load into editor
                      </button>
                    )}
                  </>
                )}
              </div>
              {showCode && (
                <pre className="bg-[#1E1E1E] text-slate-100 rounded-lg p-3 font-mono text-[11px] whitespace-pre overflow-auto max-h-96 select-text">
                  {optimal.code}
                </pre>
              )}
            </>
          )}
        </div>
      )}

      {/* Progressive hints toward the optimal solution */}
      {analysis.hints?.length > 0 && !optimal?.isUserSolutionOptimal && (
        <Section title="Hints toward the optimal solution" icon={Lightbulb}>
          <div className="space-y-2">
            {analysis.hints.slice(0, revealedHints).map((h, i) => (
              <p key={i} className="text-xs text-[#475569] font-medium leading-relaxed bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5">
                <span className="font-bold text-[#4F46E5]">Hint {i + 1}: </span>{h}
              </p>
            ))}
            {revealedHints < analysis.hints.length && (
              <button onClick={() => setRevealedHints((n) => n + 1)} className="text-[11px] font-bold text-[#4F46E5] hover:underline">
                Reveal hint {revealedHints + 1} of {analysis.hints.length}
              </button>
            )}
          </div>
        </Section>
      )}

      {analysis.strengths?.length > 0 && (
        <Section title="Strengths" icon={CheckCircle2}>
          <BulletList items={analysis.strengths} />
        </Section>
      )}

      {analysis.optimizations?.length > 0 && (
        <Section title="Optimization Opportunities">
          <BulletList items={analysis.optimizations} />
        </Section>
      )}

      {analysis.edgeCases?.length > 0 && (
        <Section title="Edge Cases" icon={AlertTriangle}>
          <BulletList items={analysis.edgeCases} />
        </Section>
      )}

      {analysis.interviewFeedback && (
        <div className="bg-indigo-50/50 border border-indigo-100/60 p-4 rounded-lg space-y-2.5">
          <div className="flex justify-between items-center border-b border-indigo-100/40 pb-2">
            <div className="flex items-center gap-1.5 text-[#4F46E5]">
              <Brain className="h-4.5 w-4.5 shrink-0" />
              <span className="font-bold text-[11px]">Interview Assessment</span>
            </div>
            <span className="text-base font-extrabold text-[#4F46E5] font-mono">{analysis.interviewFeedback.rating}/10</span>
          </div>
          <p className="text-xs text-[#475569] font-medium leading-relaxed">{analysis.interviewFeedback.assessment}</p>
        </div>
      )}

      {analysis.alternativeApproach && (
        <Section title="Alternative Approach">
          <p className="text-xs text-[#475569] font-medium leading-relaxed">{analysis.alternativeApproach}</p>
        </Section>
      )}

      {analysis.conceptsUsed?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {analysis.conceptsUsed.map((c, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[10px] font-bold text-[#475569]">{c}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysisCard;
