import React, { useState } from 'react';
import { Search, SlidersHorizontal, ChevronDown, ChevronRight } from 'lucide-react';

const difficulties = ['easy', 'medium', 'hard'];
const topics = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Trie',
  'Backtracking',
  'Graphs',
  'Advanced Graphs',
  '1-D DP',
  '2-D DP',
  'Greedy',
  'Intervals',
  'Math & Geometry',
  'Bit Manipulation'
];

const patterns = [
  'Hash Map',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Linked List',
  'Trie',
  'Recursion',
  'DFS/BFS',
  'Topological Sort',
  'Heap',
  'Union Find',
  'Dynamic Programming',
  'Greedy',
  'Bit Manipulation'
];

const companies = ['Amazon', 'Google', 'Microsoft', 'Meta', 'Netflix', 'Apple'];
const frequencies = ['Very High', 'High', 'Medium', 'Low'];

const FilterSidebar = ({ 
  search, 
  setSearch, 
  difficulty, 
  setDifficulty, 
  topicId, 
  setTopicId, 
  patternId, 
  setPatternId, 
  availableTopics = [],
  availablePatterns = [],
  company, 
  setCompany,
  frequency,
  setFrequency,
  onReset 
}) => {
  // Accordion state: only one expanded section at a time
  const [expandedSection, setExpandedSection] = useState(null); // 'topics' | 'patterns' | 'companies' | null

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="w-full h-full flex flex-col select-none bg-white border border-[#E2E8F0] rounded-xl shadow-sm text-xs font-semibold text-[#0F172A] overflow-hidden">
      {/* Sidebar Header - Fixed at Top */}
      <div className="flex items-center justify-between p-5 border-b border-[#F1F5F9] shrink-0">
        <div className="flex items-center gap-1.5 font-extrabold text-[#0F172A] text-sm">
          <SlidersHorizontal className="h-4 w-4 text-[#4F46E5]" />
          <span>Explorer Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-[10px] font-bold text-[#64748B] hover:text-[#4F46E5] transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Single Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Search Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#0F172A]">Search Title</label>
          <div className="field-control">
            <Search className="field-icon text-[#64748B] h-4.5 w-4.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type question name..."
              className="w-full h-12 pr-4 py-3 border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 transition-all bg-[#F8FAFC] input-with-icon"
            />
          </div>
        </div>

        {/* Difficulty select buttons */}
        <div className="flex flex-col gap-2">
          <span className="text-[#64748B] font-bold uppercase tracking-wider text-[10px]">Difficulty</span>
          <div className="grid grid-cols-3 gap-2">
            {difficulties.map((diff) => {
              const isSelected = difficulty.toLowerCase() === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setDifficulty(isSelected ? '' : diff)}
                  className={`py-2 px-2 rounded-lg border text-center capitalize text-[10px] font-bold transition-all ${
                    isSelected
                      ? 'bg-[#4f46e5]/10 text-[#4F46E5] border-[#4F46E5]'
                      : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>
        </div>

        {/* Topics Accordion Section */}
        <div className="flex flex-col border-t border-[#F1F5F9] pt-4.5">
          <button
            type="button"
            onClick={() => toggleSection('topics')}
            className="flex items-center justify-between py-1.5 text-left text-xs font-extrabold text-[#0F172A] uppercase tracking-wider font-mono hover:text-[#4F46E5] transition-colors"
          >
            <span>Topics</span>
            {expandedSection === 'topics' ? (
              <ChevronDown className="h-4 w-4 text-[#64748B]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#64748B]" />
            )}
          </button>

          {expandedSection === 'topics' && (
            <div className="w-full flex flex-col gap-1 mt-2 pr-1 min-w-0 transition-all duration-200">
              {(availableTopics || []).map((t) => {
                const isSelected = Number(topicId) === Number(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => setTopicId(isSelected ? '' : Number(t.id))}
                    className={`w-full min-w-0 text-left px-2.5 py-2 rounded-lg text-[11px] transition-all truncate font-medium ${
                      isSelected
                        ? 'bg-indigo-50/60 text-[#4F46E5] font-bold'
                        : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Patterns Accordion Section */}
        <div className="flex flex-col border-t border-[#F1F5F9] pt-4.5">
          <button
            type="button"
            onClick={() => toggleSection('patterns')}
            className="flex items-center justify-between py-1.5 text-left text-xs font-extrabold text-[#0F172A] uppercase tracking-wider font-mono hover:text-[#4F46E5] transition-colors"
          >
            <span>Patterns</span>
            {expandedSection === 'patterns' ? (
              <ChevronDown className="h-4 w-4 text-[#64748B]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#64748B]" />
            )}
          </button>

          {expandedSection === 'patterns' && (
            <div className="w-full flex flex-col gap-1 mt-2 pr-1 min-w-0 transition-all duration-200">
              {(availablePatterns || []).map((p) => {
                const isSelected = Number(patternId) === Number(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => setPatternId(isSelected ? '' : Number(p.id))}
                    className={`w-full min-w-0 text-left px-2.5 py-2 rounded-lg text-[11px] transition-all truncate font-medium ${
                      isSelected
                        ? 'bg-indigo-50/60 text-[#4F46E5] font-bold'
                        : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Companies Accordion Section */}
        <div className="flex flex-col border-t border-[#F1F5F9] pt-4.5 pb-2">
          <button
            type="button"
            onClick={() => toggleSection('companies')}
            className="flex items-center justify-between py-1.5 text-left text-xs font-extrabold text-[#0F172A] uppercase tracking-wider font-mono hover:text-[#4F46E5] transition-colors"
          >
            <span>Companies</span>
            {expandedSection === 'companies' ? (
              <ChevronDown className="h-4 w-4 text-[#64748B]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#64748B]" />
            )}
          </button>

          {expandedSection === 'companies' && (
            <div className="flex flex-wrap gap-1.5 mt-3 transition-all duration-200">
              {companies.map((c) => {
                const isSelected = company === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCompany(isSelected ? '' : c)}
                    className={`px-2.5 py-1.5 text-[10px] rounded-lg font-bold border transition-all ${
                      isSelected
                        ? 'bg-[#4f46e5]/10 text-[#4F46E5] border-[#4F46E5]'
                        : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Frequencies rating list */}
        <div className="flex flex-col gap-2 border-t border-[#F1F5F9] pt-4.5">
          <span className="text-[#64748B] font-bold uppercase tracking-wider text-[10px]">Interview Frequency</span>
          <div className="grid grid-cols-2 gap-2">
            {frequencies.map((f) => {
              const isSelected = frequency === f;
              return (
                <button
                  key={f}
                  onClick={() => setFrequency(isSelected ? '' : f)}
                  className={`py-2 px-2 rounded-lg border text-center text-[10px] font-bold transition-all ${
                    isSelected
                      ? 'bg-[#4f46e5]/10 text-[#4F46E5] border-[#4F46E5]'
                      : 'bg-white text-[#475569] border-[#E2E8F0] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FilterSidebar;
