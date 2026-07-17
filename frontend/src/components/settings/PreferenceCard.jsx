import React from 'react';

const difficulties = ['easy', 'medium', 'hard'];
const topics = ['Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 'Trees', 'Graphs', 'Dynamic Programming'];

const PreferenceCard = ({ 
  data = {}, 
  onChange 
}) => {
  const handleInputChange = (field, val) => {
    onChange({ ...data, [field]: val });
  };

  const handleDifficultyToggle = (diff) => {
    const list = data.difficulties || ['easy', 'medium'];
    if (list.includes(diff)) {
      handleInputChange('difficulties', list.filter(d => d !== diff));
    } else {
      handleInputChange('difficulties', [...list, diff]);
    }
  };

  const handleTopicToggle = (topic) => {
    const list = data.topics || [];
    if (list.includes(topic)) {
      handleInputChange('topics', list.filter(t => t !== topic));
    } else {
      handleInputChange('topics', [...list, topic]);
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 select-none text-xs font-semibold text-[#0F172A]">
      <div className="border-b border-[#F1F5F9] pb-3">
        <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
          Practice Preferences
        </h3>
      </div>

      {/* Difficulty settings */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#0F172A]">Preferred difficulty levels</label>
        <div className="flex gap-2">
          {difficulties.map((diff) => {
            const isSelected = (data.difficulties || ['easy', 'medium']).includes(diff);
            return (
              <button
                key={diff}
                type="button"
                onClick={() => handleDifficultyToggle(diff)}
                className={`flex-1 py-2.5 rounded-lg border text-center capitalize text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-indigo-50 border-[#4F46E5] text-[#4F46E5]'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topics options */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#0F172A]">Preferred topic focus areas</label>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => {
            const isSelected = (data.topics || []).includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleTopicToggle(t)}
                className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-50 border-[#4F46E5] text-[#4F46E5]'
                    : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reminder Alerts settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#F1F5F9] pt-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#0F172A]">Daily study reminder</label>
          <input
            type="time"
            value={data.dailyReminderTime || '09:00'}
            onChange={(e) => handleInputChange('dailyReminderTime', e.target.value)}
            className="w-full h-12 px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all duration-150"
          />
        </div>

        <div className="flex items-center justify-between gap-4 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-end h-12">
          <div>
            <label className="text-xs font-medium text-[#0F172A] leading-none">Revision alerts</label>
            <span className="block text-[9px] text-[#64748B] font-medium leading-none mt-0.5">Spaced repetition reminders</span>
          </div>
          <input
            type="checkbox"
            checked={data.revisionAlertsEnabled || false}
            onChange={(e) => handleInputChange('revisionAlertsEnabled', e.target.checked)}
            className="h-4 w-4 text-[#4F46E5] border-[#E2E8F0] rounded focus:ring-[#4F46E5]"
          />
        </div>
      </div>

    </div>
  );
};

export default PreferenceCard;
