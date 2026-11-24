import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video } from 'lucide-react';
import { mockInterviewService } from '../../services/mockInterview.service';
import { scoreColor, formatDate } from './constants';

/**
 * Mock interview performance for one company, shown on the Companies page.
 * Kept separate from the practice-based readiness score.
 */
const MockInterviewCompanyCard = ({ company }) => {
  const [stats, setStats] = useState(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([mockInterviewService.getStats(), mockInterviewService.getOptions()])
      .then(([s, options]) => {
        if (cancelled) return;
        setStats(s);
        setSupported(options.companies.some((c) => c.name === company));
      })
      .catch(() => !cancelled && setStats({ companies: [] }));
    return () => {
      cancelled = true;
    };
  }, [company]);

  const entry = stats?.companies?.find((c) => c.companyName === company);

  return (
    <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-3">
      <div className="flex items-center gap-1.5 border-b border-[#F1F5F9] pb-3">
        <Video className="h-4 w-4 text-[#4F46E5]" />
        <span className="font-extrabold text-xs text-[#0F172A]">{company} mock interview</span>
      </div>
      {entry ? (
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] text-[#64748B] font-semibold">Mock interview score</div>
            <div className="text-2xl font-extrabold font-mono" style={{ color: scoreColor(entry.mockInterviewScore) }}>
              {entry.mockInterviewScore}
            </div>
          </div>
          <div className="text-right text-[10px] text-[#64748B]">
            {entry.interviews} interview{entry.interviews === 1 ? '' : 's'}
            <br />
            Last {formatDate(entry.lastInterviewAt)}
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-[#64748B]">
          {stats ? `No ${company} mock interviews yet.` : 'Loading...'}
        </p>
      )}
      <p className="text-[10px] text-[#64748B] leading-relaxed">
        Based on how you answer in AI mock interviews. It is separate from the readiness score above, which comes from solved
        questions.
      </p>
      {supported && (
        <Link
          to={`/mock-interview/new?company=${encodeURIComponent(company)}`}
          className="w-full h-9 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[11px] font-bold inline-flex items-center justify-center gap-1.5"
        >
          <Video className="h-3.5 w-3.5" /> Practise a {company} interview
        </Link>
      )}
    </div>
  );
};

export default MockInterviewCompanyCard;
