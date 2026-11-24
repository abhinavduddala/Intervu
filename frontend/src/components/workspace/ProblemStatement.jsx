import React from 'react';
import { FileText, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

const Block = ({ label, children }) => (
  <div className="space-y-1.5">
    <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{label}</h4>
    {children}
  </div>
);

const Pre = ({ children }) => (
  <pre className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 font-mono text-[11px] text-[#0F172A] whitespace-pre-wrap break-words select-text">
    {children}
  </pre>
);

const ProblemStatement = ({ problem, loading, onRegenerate }) => {
  if (loading) {
    return (
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm flex items-center gap-3 text-xs text-[#64748B]">
        <Loader2 className="h-4 w-4 animate-spin text-[#4F46E5]" />
        <span>Preparing the problem statement, test cases and starter code (first visit can take up to a minute)...</span>
      </div>
    );
  }

  if (!problem) return null;

  if (!problem.generated) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="h-4 w-4" />
          <span>Problem statement unavailable</span>
        </div>
        <p className="font-medium leading-relaxed">
          {problem.error || 'Test cases could not be generated.'} You can still write code and run it against custom input.
        </p>
        {onRegenerate && (
          <button onClick={onRegenerate} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 hover:underline">
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-5 text-xs font-medium text-[#475569]">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
        <div className="flex items-center gap-2 text-[#0F172A]">
          <FileText className="h-4.5 w-4.5 text-[#4F46E5]" />
          <h3 className="text-sm font-extrabold">Problem</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#94A3B8]">
          <span>AI-prepared · stdin/stdout</span>
          {onRegenerate && (
            <button onClick={onRegenerate} title="Regenerate statement and test cases" className="inline-flex items-center gap-1 text-[#4F46E5] hover:underline font-sans font-bold">
              <RefreshCw className="h-3 w-3" /> Try again
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 leading-relaxed whitespace-pre-line select-text">{problem.description}</div>

      {problem.examples?.length > 0 && (
        <Block label="Examples">
          <div className="space-y-3">
            {problem.examples.map((ex, i) => (
              <div key={i} className="space-y-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] text-[#94A3B8] mb-1">Input</div>
                    <Pre>{ex.input}</Pre>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94A3B8] mb-1">Output</div>
                    <Pre>{ex.output}</Pre>
                  </div>
                </div>
                {ex.explanation && <p className="text-[11px] leading-relaxed">{ex.explanation}</p>}
              </div>
            ))}
          </div>
        </Block>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {problem.inputFormat && (
          <Block label="Input Format">
            <p className="leading-relaxed whitespace-pre-line">{problem.inputFormat}</p>
          </Block>
        )}
        {problem.outputFormat && (
          <Block label="Output Format">
            <p className="leading-relaxed whitespace-pre-line">{problem.outputFormat}</p>
          </Block>
        )}
      </div>

      {problem.constraints?.length > 0 && (
        <Block label="Constraints">
          <ul className="space-y-1 font-mono text-[11px]">
            {problem.constraints.map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </Block>
      )}

      <div className="text-[10px] text-[#94A3B8]">
        {problem.sampleTests?.length || 0} sample tests · {problem.hiddenTestCount || 0} hidden tests on submit
      </div>
    </div>
  );
};

export default ProblemStatement;
