import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Loader2, TrendingUp } from 'lucide-react';

const barColor = (score) => (score >= 70 ? 'bg-[#22C55E]' : score >= 40 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]');

/**
 * Company readiness for the companies that ask this question (falls back to the top companies).
 * `previous` holds scores from before the latest submission/review, to show the change.
 */
const ReadinessPanel = ({ readiness, companyTags = [], loading, previous = {} }) => {
  if (loading && !readiness) {
    return (
      <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm flex items-center gap-2 text-xs text-[#64748B]">
        <Loader2 className="h-4 w-4 animate-spin text-[#4F46E5]" /> Calculating company readiness...
      </div>
    );
  }
  if (!readiness?.length) return null;

  const tags = (companyTags || []).map((t) => t.toLowerCase());
  const tagged = readiness.filter((c) => tags.includes(String(c.company).toLowerCase()));
  const list = (tagged.length ? tagged : [...readiness].sort((a, b) => b.readiness - a.readiness)).slice(0, 5);

  return (
    <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-4 text-xs font-semibold text-[#0F172A]">
      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#4F46E5]" />
          <h3 className="font-extrabold">Company Readiness</h3>
        </div>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#94A3B8]" />}
      </div>
      <p className="text-[10px] text-[#94A3B8] font-medium">
        {tagged.length ? 'Companies that ask this question' : 'Your top companies'} · based on solved topics, patterns, difficulty mix and AI review scores
      </p>

      <div className="space-y-3">
        {list.map((c) => {
          const score = Math.round(c.readiness || 0);
          const before = previous[c.company];
          const delta = before !== undefined ? Math.round((c.readiness - before) * 10) / 10 : 0;
          return (
            <div key={c.company} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold">{c.company}</span>
                <span className="font-mono font-extrabold flex items-center gap-1.5">
                  {delta > 0 && (
                    <span className="text-[10px] text-[#16A34A] flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />+{delta}
                    </span>
                  )}
                  {score}%
                </span>
              </div>
              <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor(score)}`} style={{ width: `${Math.min(100, score)}%` }} />
              </div>
              {c.weakTopics?.length > 0 && (
                <div className="text-[10px] text-[#64748B] font-medium">Work on: {c.weakTopics.join(', ')}</div>
              )}
            </div>
          );
        })}
      </div>

      <Link to="/company" className="block text-[11px] font-bold text-[#4F46E5] hover:underline">
        View full readiness report
      </Link>
    </div>
  );
};

export default ReadinessPanel;
