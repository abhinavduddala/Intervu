import React from 'react';
import { CheckCircle2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const HistoryTable = ({ historyData = [] }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden select-none text-xs font-semibold text-[#0F172A]">
      <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
          Revision Completion History
        </h3>
      </div>

      <div className="overflow-x-auto">
        {historyData.length === 0 ? (
          <div className="text-center py-8 text-[#64748B] italic">
            No completed revision history records.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[9px] font-mono uppercase text-[#64748B] tracking-wider">
                <th className="px-5 py-3">Question</th>
                <th className="px-5 py-3">Completed On</th>
                <th className="px-5 py-3">Est. Duration</th>
                <th className="px-5 py-3">AI Complexity Score</th>
                <th className="px-5 py-3">Next Revision Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {historyData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC]/50 transition-colors text-xs font-semibold">
                  <td className="px-5 py-3.5 text-[#0F172A] font-bold">
                    <Link to={`/workspace/${row.question_id}`} className="hover:text-[#4F46E5] transition-colors flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" />
                      <span>{row.question_title}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[#64748B]">
                    {formatDate(row.completed_at)}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[#475569]">
                    {row.estimatedTime || 20} mins
                  </td>
                  <td className="px-5 py-3.5 font-mono">
                    <span className="text-[#4F46E5] font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {row.aiScore || row.score || 8}/10
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[#F59E0B] font-bold flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {formatDate(row.next_revision_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HistoryTable;
