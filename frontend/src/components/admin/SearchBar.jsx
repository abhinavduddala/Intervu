import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = 'Global search by title, topic, pattern or company...' 
}) => {
  return (
    <div className="relative select-none text-xs font-semibold text-[#0F172A]">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[#64748B]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 pl-11 pr-4 py-3 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150"
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;
