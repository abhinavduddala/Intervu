import React from 'react';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';

const SaveBar = ({ 
  hasChanges = false, 
  saveStatus = 'idle', // 'idle' | 'saving' | 'saved'
  onSave, 
  onReset 
}) => {
  if (!hasChanges && saveStatus !== 'saved') return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xl bg-white border border-[#E2E8F0] shadow-xl p-4 rounded-xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-200 select-none text-xs font-semibold text-[#0F172A]">
      <div className="flex items-center gap-2">
        {saveStatus === 'saved' ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
            <span className="text-[#22C55E] font-bold">Profile changes saved successfully!</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-[#F59E0B]" />
            <span className="text-[#475569]">You have unsaved profile changes.</span>
          </>
        )}
      </div>

      {saveStatus !== 'saved' && (
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-3.5 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] rounded-lg transition-colors"
          >
            Reset
          </button>
          
          <button
            onClick={onSave}
            className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SaveBar;
