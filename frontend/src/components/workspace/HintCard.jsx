import React, { useState } from 'react';
import { Sparkles, Loader2, Lightbulb } from 'lucide-react';

const LEVEL_LABELS = ['Nudge', 'Technique', 'Outline'];

/**
 * Progressive AI hints: each click reveals the next level (nudge, technique, outline),
 * tailored to the code currently in the editor.
 */
const HintCard = ({ hint, onRequestHint }) => {
  const [hints, setHints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nextLevel = hints.length + 1;

  const requestHint = async () => {
    if (!onRequestHint || nextLevel > 3) return;
    setLoading(true);
    setError('');
    try {
      const res = await onRequestHint(nextLevel, hints.map((h) => h.hint));
      setHints((prev) => [...prev, res]);
    } catch (err) {
      setError(err.message || 'Could not get a hint right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-indigo-100/60 rounded-xl bg-indigo-50/30 p-4 space-y-3 text-xs font-semibold text-[#0F172A]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#4F46E5]">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span className="font-bold">AI Hints</span>
        </div>
        <span className="text-[10px] font-mono text-[#64748B]">{hints.length}/3 used</span>
      </div>

      {hints.length === 0 && (
        <p className="text-[11px] text-[#64748B] font-medium">Stuck? Hints get more specific each time, and they look at the code you have written so far.</p>
      )}

      {hint && (
        <p className="text-[11px] text-[#475569] font-medium bg-white border border-indigo-100 rounded-lg p-3">
          <span className="font-bold text-[#0F172A]">Quick tip: </span>{hint}
        </p>
      )}

      {hints.map((h, i) => (
        <div key={i} className="bg-white border border-indigo-100 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider">
            <Lightbulb className="h-3.5 w-3.5" />
            Hint {i + 1} · {LEVEL_LABELS[i]}
            {h.focus && <span className="normal-case font-semibold text-[#64748B]">({h.focus})</span>}
          </div>
          <p className="text-xs text-[#475569] font-medium leading-relaxed whitespace-pre-line">{h.hint}</p>
        </div>
      ))}

      {error && <p className="text-[11px] text-red-600">{error}</p>}

      {nextLevel <= 3 && onRequestHint && (
        <button
          onClick={requestHint}
          disabled={loading}
          className="w-full py-2 bg-white border border-indigo-200 hover:bg-indigo-50 disabled:opacity-60 text-[#4F46E5] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors text-[11px]"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lightbulb className="h-3.5 w-3.5" />}
          {loading ? 'Thinking...' : `Get hint ${nextLevel}: ${LEVEL_LABELS[nextLevel - 1]}`}
        </button>
      )}
    </div>
  );
};

export default HintCard;
