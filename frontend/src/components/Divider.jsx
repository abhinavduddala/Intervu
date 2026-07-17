import React from 'react';

const Divider = ({ label = 'OR' }) => {
  return (
    <div className="relative w-full flex items-center justify-center my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#E2E8F0]" />
      </div>
      <span className="relative bg-white px-3 text-xs font-semibold text-[#64748B] uppercase select-none">
        {label}
      </span>
    </div>
  );
};

export default Divider;
