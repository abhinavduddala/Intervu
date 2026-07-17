import React, { useState } from 'react';
import { Plus, SlidersHorizontal, Trash2 } from 'lucide-react';

const PatternManager = ({
  patterns = [], // Array of { name, count }
  onCreatePattern,
  onArchivePattern
}) => {
  const [newPatternName, setNewPatternName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPatternName.trim()) return;
    onCreatePattern(newPatternName.trim());
    setNewPatternName('');
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 select-none text-xs font-semibold text-[#0F172A]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#F1F5F9] pb-3">
        <div>
          <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
            Patterns Manager
          </h3>
          <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">Create and manage core patterns and templates.</p>
        </div>

        {/* Create Pattern inline form */}
        <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
          <input
            type="text"
            value={newPatternName}
            onChange={(e) => setNewPatternName(e.target.value)}
            placeholder="New pattern name..."
            className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all min-w-[150px]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {patterns.map((pattern, i) => (
          <div 
            key={i} 
            className="p-4.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-100 rounded-xl flex items-center justify-between gap-4 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-[#0F172A] truncate" title={pattern.name}>
                  {pattern.name}
                </h4>
                <span className="text-[9px] text-[#64748B] font-mono leading-none">
                  {pattern.count || 0} questions listed
                </span>
              </div>
            </div>

            <button
              onClick={() => onArchivePattern(pattern.name)}
              className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#EF4444] transition-colors shrink-0"
              title="Archive Pattern"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatternManager;
