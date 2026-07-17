import React from 'react';
import { CheckCircle2, MessageSquare, Sparkles, RotateCcw } from 'lucide-react';

const icons = {
  solved: { component: CheckCircle2, color: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20' },
  reviewed: { component: MessageSquare, color: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' },
  feedback: { component: Sparkles, color: 'text-[#A855F7] bg-[#A855F7]/10 border-[#A855F7]/20' },
  revision: { component: RotateCcw, color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20' }
};

const ActivityTimeline = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-[#64748B] italic">
        No recent activity records.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 relative pl-4 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E2E8F0]">
      {activities.map((act, index) => {
        const typeConfig = icons[act.type] || icons.solved;
        const Icon = typeConfig.component;
        
        return (
          <div key={index} className="flex gap-4 items-start relative">
            <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 absolute -left-6 z-10 bg-white ${typeConfig.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0 pl-6">
              <div className="flex justify-between items-start gap-4">
                <span className="text-xs font-bold text-[#0F172A] leading-normal">{act.title}</span>
                <span className="text-[10px] text-[#64748B] font-mono whitespace-nowrap">{act.time}</span>
              </div>
              {act.description && (
                <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{act.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
