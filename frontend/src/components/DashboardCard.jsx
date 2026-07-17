import React from 'react';

const DashboardCard = ({ title, extra, children, className = '' }) => {
  return (
    <div className={`bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex flex-col ${className}`}>
      {(title || extra) && (
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          {title && <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>}
          {extra && <div className="text-xs">{extra}</div>}
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
