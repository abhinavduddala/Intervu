import React from 'react';

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python3' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'csharp', label: 'C#' }
];

const LanguageSelector = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[#475569] hover:text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-100 transition-all select-none"
    >
      {languages.map((lang) => (
        <option key={lang.value} value={lang.value}>
          {lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
