import React from 'react';
import { Database, ShieldCheck, BookOpen, Layers, Building2, Users, CheckSquare, UploadCloud } from 'lucide-react';

const StatisticsCards = ({ 
  metrics = {} 
}) => {
  const cards = [
    { label: 'Total Questions', value: metrics.totalQuestions || 23, icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { label: 'Active Questions', value: metrics.activeQuestions || 22, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Topics Focus', value: metrics.topicsCount || 7, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { label: 'Patterns Focus', value: metrics.patternsCount || 10, icon: Layers, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
    { label: 'Companies Target', value: metrics.companiesCount || 8, icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    { label: 'Registered Users', value: metrics.usersCount || 12, icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100' },
    { label: 'Solved Today', value: metrics.solvedTodayCount || 3, icon: CheckSquare, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
    { label: 'Pending Imports', value: metrics.pendingImportsCount || 0, icon: UploadCloud, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none text-xs font-semibold text-[#0F172A]">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="bg-white border border-[#E2E8F0] p-4.5 rounded-xl shadow-sm space-y-2 flex flex-col justify-between hover:border-indigo-100 transition-all">
            <div className="flex justify-between items-center gap-2">
              <span className="text-[10px] text-[#64748B] font-mono uppercase tracking-wider leading-none">{card.label}</span>
              <div className={`h-7 w-7 rounded-lg ${card.bg} border flex items-center justify-center ${card.color} shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            
            <div className="text-xl font-extrabold text-[#0F172A] font-mono leading-none">
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatisticsCards;
