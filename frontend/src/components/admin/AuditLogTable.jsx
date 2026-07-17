import React from 'react';
import { User, Activity, Clock } from 'lucide-react';

const AuditLogTable = ({ logs = [] }) => {
  const defaultLogs = [
    { admin: 'admin@intervu.ai', action: 'CREATE_QUESTION', resource: 'Unique Paths II (ID: 24)', timestamp: new Date().toISOString() },
    { admin: 'admin@intervu.ai', action: 'UPDATE_QUESTION', resource: 'Two Sum (ID: 1)', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { admin: 'system_root', action: 'IMPORT_DATASET', resource: 'leetcode_starter.json (18 questions)', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { admin: 'admin@intervu.ai', action: 'CREATE_TOPIC', resource: 'Dynamic Programming', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  const list = logs.length > 0 ? logs : defaultLogs;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden select-none text-xs font-semibold text-[#0F172A]">
      <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
          System Audit Logs
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[9px] font-mono uppercase text-[#64748B] tracking-wider">
              <th className="px-5 py-3">Admin</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Resource Target</th>
              <th className="px-5 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {list.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#F8FAFC]/50 transition-colors text-xs font-semibold">
                <td className="px-5 py-3.5 text-[#0F172A] font-bold flex items-center gap-1.5">
                  <User className="h-4 w-4 text-[#64748B] shrink-0" />
                  <span>{row.admin}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    row.action.startsWith('CREATE')
                      ? 'text-emerald-600 bg-emerald-50 border border-emerald-100'
                      : row.action.startsWith('UPDATE')
                      ? 'text-blue-600 bg-blue-50 border border-blue-100'
                      : 'text-amber-600 bg-amber-50 border border-amber-100'
                  }`}>
                    {row.action}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[#475569] font-mono">
                  {row.resource}
                </td>
                <td className="px-5 py-3.5 font-mono text-[#64748B] flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-[#64748B] shrink-0" />
                  <span>{formatDate(row.timestamp)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogTable;
