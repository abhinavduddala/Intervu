import React from 'react';

const CodeInput = ({ value, onChange, language = 'javascript' }) => {
  return (
    <div className="relative w-full border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm select-none text-xs font-semibold text-[#0F172A] bg-[#F8FAFC]">
      <div className="px-4 py-2 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase text-[#64748B] tracking-wide">
          Solution Editor
        </span>
        <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-100 text-[#4F46E5] px-2 py-0.5 rounded font-bold uppercase">
          {language}
        </span>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-80 px-4 py-3 bg-[#F8FAFC] font-mono text-[11px] leading-relaxed text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white transition-all resize-none"
        placeholder={`// Paste your LeetCode solution code here...\nfunction solution() {\n  // your code\n}`}
      />
    </div>
  );
};

export default CodeInput;
