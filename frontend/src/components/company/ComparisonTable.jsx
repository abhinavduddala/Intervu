import React from 'react';
import DifficultyBadge from '../explorer/DifficultyBadge';

const ComparisonTable = ({ comparisonData = [], onSelectCompany }) => {
  const readinessColor = (score) => {
    if (score >= 80) return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20';
    if (score >= 50) return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
    return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20';
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden select-none text-xs font-semibold text-[#0F172A]">
      <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">Target Company Comparisons</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[9px] font-mono uppercase text-[#64748B] tracking-wider">
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Readiness Score</th>
              <th className="px-5 py-3">Problems Remaining</th>
              <th className="px-5 py-3">Est. Target Hours</th>
              <th className="px-5 py-3">Interview Difficulty</th>
              <th className="px-5 py-3 text-right">Roadmap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {comparisonData.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#F8FAFC]/50 transition-colors text-xs font-semibold">
                <td className="px-5 py-3.5 text-[#0F172A] font-bold">{row.company}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${readinessColor(row.readiness)}`}>
                    {Math.round(row.readiness)}%
                  </span>
                </td>
                <td className="px-5 py-3.5 font-mono text-[#475569]">{row.questionsRemaining} questions</td>
                <td className="px-5 py-3.5 font-mono text-[#0F172A]">{row.hoursToReady} hours</td>
                <td className="px-5 py-3.5">
                  <DifficultyBadge difficulty={row.difficulty} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => onSelectCompany(row.company)}
                    className="text-[10px] font-bold text-[#4F46E5] hover:underline"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
