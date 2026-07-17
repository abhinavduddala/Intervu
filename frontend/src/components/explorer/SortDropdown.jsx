import React, { useState } from 'react';
import { ArrowDownAZ, ChevronDown } from 'lucide-react';

const options = [
  { value: 'learningOrder', label: 'Learning Order' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'acceptanceRate', label: 'Acceptance Rate' },
  { value: 'frequency', label: 'Interview Frequency' },
  { value: 'estimatedTime', label: 'Estimated Time' },
  { value: 'title', label: 'Alphabetical' }
];

const SortDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find(o => o.value === value) || options[0];

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="relative z-20 select-none text-xs">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] rounded-lg font-semibold text-[#475569] hover:text-[#0F172A] transition-colors"
      >
        <ArrowDownAZ className="h-4 w-4 shrink-0 text-[#64748B]" />
        <span>Sort: {selectedOption.label}</span>
        <ChevronDown className="h-3 w-3 shrink-0 text-[#64748B]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#E2E8F0] rounded-lg shadow-md py-1.5 z-45">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3 py-2 text-xs font-semibold ${
                  opt.value === value 
                    ? 'text-[#4F46E5] bg-indigo-50/50' 
                    : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SortDropdown;
