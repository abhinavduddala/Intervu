import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { STATUS_LABELS, scoreColor, formatDate } from './constants';

const InterviewHistoryTable = ({ interviews, onDelete, deletingId }) => {
  if (!interviews.length) {
    return <p className="text-[12px] text-[#64748B] py-8 text-center">No interviews yet. Your past interviews will appear here.</p>;
  }

  const linkFor = (i) =>
    ['in_progress', 'paused'].includes(i.status) ? `/mock-interview/${i.id}` : `/mock-interview/${i.id}/report`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="text-left text-[11px] text-[#64748B] border-b border-[#F1F5F9]">
            <th className="py-2 pr-3 font-semibold">Date</th>
            <th className="py-2 pr-3 font-semibold">Interview</th>
            <th className="py-2 pr-3 font-semibold">Company</th>
            <th className="py-2 pr-3 font-semibold">Status</th>
            <th className="py-2 pr-3 font-semibold text-right">Score</th>
            <th className="py-2 w-8" />
          </tr>
        </thead>
        <tbody>
          {interviews.map((i) => (
            <tr key={i.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
              <td className="py-2.5 pr-3 text-[#64748B] whitespace-nowrap">{formatDate(i.createdAt)}</td>
              <td className="py-2.5 pr-3">
                <Link to={linkFor(i)} className="font-semibold text-[#0F172A] hover:text-[#4F46E5]">
                  {i.interviewTypeLabel}
                </Link>
                <div className="text-[11px] text-[#64748B]">
                  {i.jobRole} · {i.durationMinutes} min
                </div>
              </td>
              <td className="py-2.5 pr-3 text-[#475569]">{i.companyName || 'General'}</td>
              <td className="py-2.5 pr-3 text-[#475569]">{STATUS_LABELS[i.status] || i.status}</td>
              <td className="py-2.5 pr-3 text-right font-mono font-bold" style={{ color: scoreColor(i.overallScore) }}>
                {i.overallScore !== null ? Math.round(i.overallScore) : '-'}
              </td>
              <td className="py-2.5 text-right">
                {!['evaluating'].includes(i.status) && (
                  <button
                    type="button"
                    onClick={() => onDelete(i)}
                    disabled={deletingId === i.id}
                    className="p-1 text-[#94A3B8] hover:text-red-600 disabled:opacity-50"
                    title="Delete interview"
                    aria-label="Delete interview"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InterviewHistoryTable;
