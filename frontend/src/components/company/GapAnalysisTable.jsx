import React from 'react';

const GapAnalysisTable = ({ gapData = [] }) => {
  const gapSeverityStyle = (gapVal) => {
    if (gapVal <= 0) return 'text-[#22C55E] font-bold bg-[#22C55E]/10 px-1.5 py-0.5 rounded';
    if (gapVal <= 20) return 'text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-1.5 py-0.5 rounded';
    return 'text-[#EF4444] font-bold bg-[#EF4444]/10 px-1.5 py-0.5 rounded';
  };

  const progressColor = (level) => {
    if (level >= 80) return 'bg-[#22C55E]';
    if (level >= 50) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden select-none text-xs font-semibold text-[#0F172A]">
      <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">Skills Gap Analysis</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[9px] font-mono uppercase text-[#64748B] tracking-wider">
              <th className="px-5 py-3">Topic</th>
              <th className="px-5 py-3">Required Level</th>
              <th className="px-5 py-3">Current Mastery</th>
              <th className="px-5 py-3">Mastery Gap</th>
              <th className="px-5 py-3">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {gapData.map((row, idx) => {
              const gap = Math.max(0, row.required - row.current);
              return (
                <tr key={idx} className="hover:bg-[#F8FAFC]/50 transition-colors text-xs font-semibold">
                  <td className="px-5 py-3.5 text-[#0F172A] font-bold">{row.topic}</td>
                  <td className="px-5 py-3.5 font-mono text-[#475569]">{row.required}%</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-[#F1F5F9] rounded-full h-2 overflow-hidden border border-[#E2E8F0]">
                        <div 
                          className={`h-full rounded-full ${progressColor(row.current)}`}
                          style={{ width: `${row.current}%` }}
                        />
                      </div>
                      <span className="font-mono text-[#0F172A]">{row.current}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={gapSeverityStyle(gap)}>
                      {gap === 0 ? 'Optimal' : `-${gap}%`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[#64748B] font-medium max-w-[200px] truncate" title={row.recommendation}>
                    {row.recommendation}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GapAnalysisTable;
