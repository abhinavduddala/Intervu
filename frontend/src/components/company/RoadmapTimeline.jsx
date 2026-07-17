import React from 'react';
import { CheckCircle2, Circle, PlayCircle, ArrowRight } from 'lucide-react';
import DifficultyBadge from '../explorer/DifficultyBadge';

const RoadmapTimeline = ({ milestones = [] }) => {
  if (milestones.length === 0) return null;

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm select-none text-xs font-semibold text-[#0F172A] space-y-4">
      <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
        Interview Preparation Roadmap
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
        {milestones.map((milestone, idx) => {
          const { name, status, questionCount, estHours, difficulty } = milestone;

          // Icon and border styles based on status
          const statusConfigs = {
            completed: {
              icon: CheckCircle2,
              iconColor: 'text-[#22C55E]',
              borderColor: 'border-[#22C55E]',
              bgColor: 'bg-emerald-50/20'
            },
            current: {
              icon: PlayCircle,
              iconColor: 'text-[#4F46E5]',
              borderColor: 'border-[#4F46E5]',
              bgColor: 'bg-indigo-50/20'
            },
            next: {
              icon: Circle,
              iconColor: 'text-[#64748B]',
              borderColor: 'border-[#E2E8F0]',
              bgColor: 'bg-[#F8FAFC]'
            },
            future: {
              icon: Circle,
              iconColor: 'text-[#94A3B8] opacity-50',
              borderColor: 'border-[#E2E8F0]/60',
              bgColor: 'bg-[#F8FAFC]/50'
            }
          };

          const config = statusConfigs[status] || statusConfigs.next;
          const Icon = config.icon;

          return (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border ${config.borderColor} ${config.bgColor} flex flex-col gap-3 relative justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                    Milestone {idx + 1}
                  </span>
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${config.iconColor}`} />
                </div>

                <h4 className="font-extrabold text-[#0F172A] mt-1 text-[11px] leading-tight">
                  {name}
                </h4>
              </div>

              <div className="space-y-2 border-t border-[#E2E8F0] pt-2.5 mt-2">
                <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
                  <span>Problems</span>
                  <span className="font-bold text-[#0F172A]">{questionCount} questions</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
                  <span>Est. Duration</span>
                  <span className="font-bold text-[#0F172A]">{estHours} hours</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-[#64748B] pt-0.5">
                  <span>Target</span>
                  <DifficultyBadge difficulty={difficulty} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapTimeline;
