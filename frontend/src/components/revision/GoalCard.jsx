import React from 'react';
import ProgressRing from '../company/ProgressRing';

const GoalCard = ({ 
  todaySolved = 1, 
  todayGoal = 2,
  weekSolved = 4,
  weekGoal = 10,
  monthSolved = 18,
  monthGoal = 40
}) => {
  const todayPercent = Math.min(100, Math.round((todaySolved / todayGoal) * 100));
  const weekPercent = Math.min(100, Math.round((weekSolved / weekGoal) * 100));
  const monthPercent = Math.min(100, Math.round((monthSolved / monthGoal) * 100));

  return (
    <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-4 select-none text-xs font-semibold text-[#0F172A]">
      <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
        Revision Practice Goals
      </h3>

      <div className="grid grid-cols-3 gap-4 text-center">
        {/* Today */}
        <div className="flex flex-col items-center gap-2">
          <ProgressRing percent={todayPercent} size={70} strokeWidth={6} primaryColor="#4F46E5" />
          <div className="space-y-0.5">
            <div className="text-[10px] text-[#0F172A] font-bold">Today</div>
            <div className="text-[9px] text-[#64748B] font-mono">{todaySolved}/{todayGoal} solved</div>
          </div>
        </div>

        {/* Weekly */}
        <div className="flex flex-col items-center gap-2">
          <ProgressRing percent={weekPercent} size={70} strokeWidth={6} primaryColor="#22C55E" />
          <div className="space-y-0.5">
            <div className="text-[10px] text-[#0F172A] font-bold">This Week</div>
            <div className="text-[9px] text-[#64748B] font-mono">{weekSolved}/{weekGoal} solved</div>
          </div>
        </div>

        {/* Monthly */}
        <div className="flex flex-col items-center gap-2">
          <ProgressRing percent={monthPercent} size={70} strokeWidth={6} primaryColor="#F59E0B" />
          <div className="space-y-0.5">
            <div className="text-[10px] text-[#0F172A] font-bold">This Month</div>
            <div className="text-[9px] text-[#64748B] font-mono">{monthSolved}/{monthGoal} solved</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
