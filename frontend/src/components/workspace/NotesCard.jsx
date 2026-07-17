import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Loader2, FileText } from 'lucide-react';

const NotesCard = ({ value, onChange, onSave }) => {
  const [localNotes, setLocalNotes] = useState(value || '');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'

  useEffect(() => {
    setLocalNotes(value || '');
  }, [value]);

  // Debounced autosave
  useEffect(() => {
    if (localNotes === value) return;
    
    setSaveStatus('saving');
    const handler = setTimeout(async () => {
      try {
        await onSave(localNotes);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        setSaveStatus('idle');
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [localNotes]);

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-4 select-none text-xs font-semibold text-[#0F172A]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold">
          <FileText className="h-4.5 w-4.5 text-[#4F46E5] shrink-0" />
          <span>Personal Study Notes</span>
        </div>
        
        {/* Autosave status indicator */}
        <div className="flex items-center gap-1 font-mono text-[10px] text-[#64748B]">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#4F46E5]" />
              <span>Autosaving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
              <span className="text-[#22C55E] font-bold">Changes saved</span>
            </>
          )}
          {saveStatus === 'idle' && (
            <span>Auto-saves locally</span>
          )}
        </div>
      </div>

      <textarea
        value={localNotes}
        onChange={(e) => {
          setLocalNotes(e.target.value);
          onChange(e.target.value);
        }}
        className="w-full h-32 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all resize-none leading-relaxed"
        placeholder="Document details of your coding approach, space constraints, corner edge cases, or optimizations..."
      />
      <div className="text-[10px] text-[#64748B] font-mono leading-relaxed">
        Markdown supported. Wrap codes in backticks (e.g. `O(N)`).
      </div>
    </div>
  );
};

export default NotesCard;
