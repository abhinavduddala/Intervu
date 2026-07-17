import React, { useState } from 'react';
import { Plus, BookOpen, Trash2, Edit } from 'lucide-react';

const TopicManager = ({
  topics = [], // Array of { name, count }
  onCreateTopic,
  onArchiveTopic
}) => {
  const [newTopicName, setNewTopicName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    onCreateTopic(newTopicName.trim());
    setNewTopicName('');
  };

  return (
    <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6 select-none text-xs font-semibold text-[#0F172A]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#F1F5F9] pb-3">
        <div>
          <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
            Topics Manager
          </h3>
          <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">Create and coordinate algorithmic categories.</p>
        </div>

        {/* Create Topic inline form */}
        <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
          <input
            type="text"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            placeholder="New topic name..."
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
        {topics.map((topic, i) => (
          <div 
            key={i} 
            className="p-4.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-100 rounded-xl flex items-center justify-between gap-4 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-[#0F172A] truncate" title={topic.name}>
                  {topic.name}
                </h4>
                <span className="text-[9px] text-[#64748B] font-mono leading-none">
                  {topic.count || 0} questions listed
                </span>
              </div>
            </div>

            <button
              onClick={() => onArchiveTopic(topic.name)}
              className="p-1 rounded hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#EF4444] transition-colors shrink-0"
              title="Archive Topic"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicManager;
