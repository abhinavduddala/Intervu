import React from 'react';

export const LANGUAGES = [
  { value: 'python', label: 'Python 3' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'go', label: 'Go' },
  { value: 'csharp', label: 'C#' }
];

const languages = LANGUAGES;

const LanguageSelector = ({ value, onChange, disabled = false }) => {
  return (
    <select
      value={value}
      disabled={disabled}
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
