import React from 'react';

const DifficultyBadge = ({ difficulty = 'easy' }) => {
  const normalized = difficulty.toLowerCase();

  const configs = {
    easy: 'text-[#15803D] bg-[#F0FDF4] border-[#DCFCE7]',
    medium: 'text-[#B45309] bg-[#FFFBEB] border-[#FEF3C7]',
    hard: 'text-[#B91C1C] bg-[#FEF2F2] border-[#FEE2E2]'
  };

  const styles = configs[normalized] || configs.easy;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${styles} select-none`}>
      {difficulty}
    </span>
  );
};

export default DifficultyBadge;
