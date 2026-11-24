import React from 'react';
import { CATEGORY_LABELS, scoreColor } from './constants';

/** Horizontal bars for the eight evaluation categories. */
const ScoreBreakdown = ({ categories, detailed = false }) => (
  <div className="space-y-4">
    {categories.map((c) => (
      <div key={c.key} className="space-y-1.5">
        <div className="flex items-center justify-between text-[12px]">
          <span className="font-semibold text-[#0F172A]">{CATEGORY_LABELS[c.key] || c.key}</span>
          <span className="font-mono font-bold" style={{ color: scoreColor(c.score) }}>
            {c.applicable === false || c.score === null || c.score === undefined ? 'N/A' : `${c.score}/100`}
          </span>
        </div>
        <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${c.score || 0}%`, backgroundColor: scoreColor(c.score) }}
          />
        </div>
        {detailed && (
          <div className="text-[12px] leading-relaxed text-[#475569] space-y-1.5 pt-0.5">
            {c.explanation && <p>{c.explanation}</p>}
            {c.strengths?.length > 0 && (
              <ul className="list-disc pl-5 space-y-0.5">
                {c.strengths.map((s) => (
                  <li key={s}>
                    <span className="text-emerald-700 font-semibold">Strength:</span> {s}
                  </li>
                ))}
              </ul>
            )}
            {c.improvements?.length > 0 && (
              <ul className="list-disc pl-5 space-y-0.5">
                {c.improvements.map((s) => (
                  <li key={s}>
                    <span className="text-amber-700 font-semibold">Improve:</span> {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    ))}
  </div>
);

export default ScoreBreakdown;
