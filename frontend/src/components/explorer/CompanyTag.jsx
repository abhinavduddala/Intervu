import React from 'react';

const CompanyTag = ({ name }) => {
  const getStyles = (companyName) => {
    const lower = (companyName || '').toLowerCase();
    if (lower.includes('google')) return 'bg-blue-50 border-blue-100 text-blue-600';
    if (lower.includes('amazon')) return 'bg-amber-50 border-amber-100 text-amber-700';
    if (lower.includes('microsoft')) return 'bg-sky-50 border-sky-100 text-sky-600';
    if (lower.includes('meta')) return 'bg-indigo-50 border-indigo-100 text-indigo-600';
    if (lower.includes('netflix')) return 'bg-red-50 border-red-100 text-red-600';
    if (lower.includes('atlassian')) return 'bg-cyan-50 border-cyan-100 text-cyan-700';
    return 'bg-slate-50 border-[#E2E8F0] text-slate-600';
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-bold rounded-md select-none ${getStyles(name)}`}>
      {name}
    </span>
  );
};

export default CompanyTag;
