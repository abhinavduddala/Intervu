import React from 'react';
import { X, ExternalLink, PlayCircle, ShieldCheck } from 'lucide-react';
import DifficultyBadge from '../explorer/DifficultyBadge';
import CompanyTag from '../explorer/CompanyTag';

const SessionModal = ({ 
  question, 
  onClose, 
  onConfirm 
}) => {
  if (!question) return null;

  const {
    title,
    difficulty = 'easy',
    estimatedTime = 20,
    companyTags = [],
    prerequisites = []
  } = question;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none text-xs font-semibold text-[#0F172A]">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white border border-[#E2E8F0] rounded-xl shadow-xl overflow-hidden flex flex-col z-50 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <span className="font-extrabold text-sm text-[#0F172A]">Start Solving Session</span>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <X className="h-4.5 w-4.5 shrink-0" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-[#0F172A] line-clamp-1">{title}</h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <DifficultyBadge difficulty={difficulty} />
              <span className="text-[10px] text-[#64748B] font-mono">Time Target: {estimatedTime}m</span>
            </div>
          </div>

          {/* Companies list */}
          {companyTags.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">Interview Targets</div>
              <div className="flex flex-wrap gap-1.5">
                {companyTags.slice(0, 3).map((c, i) => (
                  <CompanyTag key={i} name={c} />
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          <div className="space-y-2 bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg">
            <div className="flex items-center gap-1.5 text-[#22C55E]">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
              <span className="font-extrabold text-[10px] uppercase tracking-wider">Prerequisite Check</span>
            </div>
            {prerequisites.length > 0 ? (
              <ul className="space-y-1 text-xs text-[#475569] font-medium pl-1">
                {prerequisites.map((p, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 bg-[#22C55E] rounded-full shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-[#64748B] font-medium leading-relaxed">
                No prerequisite problems identified. Ready to proceed.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] rounded-lg font-bold"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Start Session</span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default SessionModal;
