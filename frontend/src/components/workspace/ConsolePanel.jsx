import React, { useState } from 'react';
import { CheckCircle2, XCircle, Terminal, Loader2, Lock } from 'lucide-react';

const OutputBox = ({ label, value, tone = 'default' }) => {
  if (value === null || value === undefined || value === '') return null;
  const tones = {
    default: 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A]',
    error: 'bg-red-50 border-red-200 text-red-700',
  };
  return (
    <div>
      <div className="text-[10px] text-[#94A3B8] mb-1">{label}</div>
      <pre className={`border rounded-lg p-2.5 font-mono text-[11px] whitespace-pre-wrap break-words max-h-48 overflow-auto select-text ${tones[tone]}`}>
        {value}
      </pre>
    </div>
  );
};

const VerdictBadge = ({ result }) => {
  const ok = result.verdict === 'Accepted';
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${ok ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
      <div className={`flex items-center gap-2 font-extrabold text-sm ${ok ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
        {ok ? <CheckCircle2 className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
        <span>{result.verdict}</span>
      </div>
      <div className="text-[11px] font-mono text-[#475569]">
        {result.passed}/{result.total} passed
        {result.executionTime != null && ` · ${result.executionTime}s`}
        {result.executionMemory != null && ` · ${Math.round(result.executionMemory / 1024)} MB`}
      </div>
    </div>
  );
};

/**
 * Bottom console: custom stdin, run results per test case, and submission verdicts.
 */
const ConsolePanel = ({ result, running, statusText, customInput, onCustomInputChange, useCustomInput, onToggleCustomInput }) => {
  const [activeCase, setActiveCase] = useState(0);
  const cases = result?.cases || [];
  const current = cases[Math.min(activeCase, Math.max(cases.length - 1, 0))];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm text-xs font-semibold text-[#0F172A]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[#4F46E5]" />
          <span className="font-extrabold">Console</span>
        </div>
        <label className="flex items-center gap-2 text-[11px] text-[#475569] cursor-pointer">
          <input type="checkbox" checked={useCustomInput} onChange={(e) => onToggleCustomInput(e.target.checked)} className="accent-[#4F46E5]" />
          Run with custom input
        </label>
      </div>

      <div className="p-4 space-y-3">
        {useCustomInput && (
          <div>
            <div className="text-[10px] text-[#94A3B8] mb-1">Custom stdin</div>
            <textarea
              value={customInput}
              onChange={(e) => onCustomInputChange(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-[11px] focus:outline-none focus:bg-white focus:border-[#4F46E5] resize-y"
              placeholder="Type the input your program reads from stdin..."
            />
          </div>
        )}

        {running && (
          <div className="flex items-center gap-2 text-[#64748B]">
            <Loader2 className="h-4 w-4 animate-spin text-[#4F46E5]" />
            <span>{statusText || 'Running...'}</span>
          </div>
        )}

        {!running && !result && (
          <p className="text-[11px] text-[#94A3B8] font-medium">
            Run executes the sample tests (Ctrl/Cmd + Enter). Submit runs every test, including hidden ones, and then reviews your code with AI.
          </p>
        )}

        {!running && result?.error && <OutputBox label="Error" value={result.error} tone="error" />}

        {!running && result && !result.error && (
          <>
            {result.mode !== 'custom' && <VerdictBadge result={result} />}

            {result.compileOutput && <OutputBox label="Compiler output" value={result.compileOutput} tone="error" />}

            {cases.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {cases.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCase(i)}
                    className={`px-2.5 py-1 rounded-md border text-[11px] font-bold flex items-center gap-1 ${
                      i === activeCase ? 'border-[#4F46E5] bg-indigo-50' : 'border-[#E2E8F0] bg-white'
                    } ${c.passed ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}
                  >
                    {c.hidden && <Lock className="h-3 w-3" />}
                    Case {i + 1}
                  </button>
                ))}
              </div>
            )}

            {current && (
              <div className="space-y-2">
                {result.mode !== 'custom' && (
                  <div className={`text-[11px] font-bold ${current.passed ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>{current.status}</div>
                )}
                {current.hidden ? (
                  <p className="text-[11px] text-[#64748B] font-medium">Hidden test case: input and output are not shown.</p>
                ) : (
                  <>
                    <OutputBox label="Input" value={current.input} />
                    <OutputBox label={result.mode === 'custom' ? 'Output' : 'Your output'} value={current.actualOutput || (current.passed ? '' : '(no output)')} />
                    {result.mode !== 'custom' && <OutputBox label="Expected" value={current.expectedOutput} />}
                  </>
                )}
                <OutputBox label="stderr" value={current.stderr} tone="error" />
                {current.message && <OutputBox label="Message" value={current.message} tone="error" />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConsolePanel;
