import React from 'react';
import CompanyTag from '../explorer/CompanyTag';

const CompanyTags = ({ tags = [] }) => {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-2 select-none text-xs font-semibold text-[#0F172A]">
      <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Frequently Asked in Interviews</h4>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, idx) => (
          <CompanyTag key={idx} name={tag} />
        ))}
      </div>
    </div>
  );
};

export default CompanyTags;
