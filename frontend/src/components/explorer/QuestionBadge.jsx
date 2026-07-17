import React from 'react';
import { CheckCircle2, Hourglass, Circle } from 'lucide-react';

const QuestionBadge = ({ status }) => {
  const normalized = (status || 'NOT_STARTED').toUpperCase();

  const configs = {
    SOLVED: {
      label: 'Solved',
      styles: 'text-[#15803D] bg-[#F0FDF4] border-[#DCFCE7]',
      icon: CheckCircle2
    },
    IN_PROGRESS: {
      label: 'In Progress',
      styles: 'text-[#B45309] bg-[#FFFBEB] border-[#FEF3C7]',
      icon: Hourglass
    },
    NOT_STARTED: {
      label: 'Not Started',
      styles: 'text-[#64748B] bg-[#F8FAFC] border-[#E2E8F0]',
      icon: Circle
    }
  };

  const config = configs[normalized] || configs.NOT_STARTED;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-md border ${config.styles} select-none`}>
      <Icon className="h-3 w-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};

export default QuestionBadge;
