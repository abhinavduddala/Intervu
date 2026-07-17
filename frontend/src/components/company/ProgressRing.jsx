import React from 'react';

const ProgressRing = ({ 
  percent = 0, 
  size = 120, 
  strokeWidth = 10,
  primaryColor = '#4F46E5',
  trailColor = '#E2E8F0'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track Circle */}
        <circle
          stroke={trailColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          stroke={primaryColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-300 ease-out"
        />
      </svg>
      
      {/* Center Label */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-extrabold text-[#0F172A] font-mono leading-none">
          {Math.round(percent)}%
        </span>
        <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider mt-0.5">
          Ready
        </span>
      </div>
    </div>
  );
};

export default ProgressRing;
