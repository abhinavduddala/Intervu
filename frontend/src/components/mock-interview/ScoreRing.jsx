import React from 'react';
import { scoreColor } from './constants';

/** Circular overall score, 0-100. */
const ScoreRing = ({ score, size = 120, stroke = 10 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  const color = scoreColor(score);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle r={radius} cx={size / 2} cy={size / 2} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (value / 100) * circumference}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold font-mono" style={{ color }}>
          {Math.round(value)}
        </span>
        <span className="text-[10px] text-[#64748B]">out of 100</span>
      </div>
    </div>
  );
};

export default ScoreRing;
