import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, AlertCircle } from 'lucide-react';

const QuestionEditor = ({
  question = null, // null means "Create" mode
  topics = [],
  patterns = [],
  onSave,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [pattern, setPattern] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [videoSolutionUrl, setVideoSolutionUrl] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(20);
  const [acceptanceRate, setAcceptanceRate] = useState('');
  const [frequency, setFrequency] = useState('Medium');
  const [companyTags, setCompanyTags] = useState('');
  const [hint, setHint] = useState('');
  const [prerequisites, setPrerequisites] = useState('');
  const [recommendedNext, setRecommendedNext] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState('');

  useEffect(() => {
    if (question) {
      setTitle(question.title || '');
      setTopic(question.topic || '');
      setPattern(question.pattern || '');
      setDifficulty(question.difficulty || 'medium');
      setLeetcodeUrl(question.leetcodeUrl || '');
      setVideoSolutionUrl(question.videoSolutionUrl || '');
      setArticleUrl(question.articleUrl || '');
      setEstimatedTime(question.estimatedTime || 20);
      setAcceptanceRate(question.acceptanceRate || '');
      setFrequency(question.frequency || 'Medium');
      setCompanyTags(Array.isArray(question.companyTags) ? question.companyTags.join(', ') : '');
      setHint(question.hint || '');
      setPrerequisites(question.prerequisites || '');
      setRecommendedNext(question.recommendedNext || '');
      setIsPremium(question.isPremium || false);
      setIsActive(question.isActive !== false);
    } else {
      setTitle('');
      setTopic('');
      setPattern('');
      setDifficulty('medium');
      setLeetcodeUrl('');
      setVideoSolutionUrl('');
      setArticleUrl('');
      setEstimatedTime(20);
      setAcceptanceRate('');
      setFrequency('Medium');
      setCompanyTags('');
      setHint('');
      setPrerequisites('');
      setRecommendedNext('');
      setIsPremium(false);
      setIsActive(true);
    }
    setError('');
  }, [question]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!topic.trim()) {
      setError('Topic is required.');
      return;
    }
    if (!pattern.trim()) {
      setError('Pattern is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      topic: topic.trim(),
      pattern: pattern.trim(),
      difficulty,
      leetcodeUrl: leetcodeUrl.trim() || null,
      videoSolutionUrl: videoSolutionUrl.trim() || null,
      articleUrl: articleUrl.trim() || null,
      estimatedTime: Number(estimatedTime) || 20,
      acceptanceRate: acceptanceRate ? Number(acceptanceRate) : null,
      frequency,
      companyTags: companyTags.split(',').map(s => s.trim()).filter(Boolean),
      hint: hint.trim() || null,
      prerequisites: prerequisites.trim() || null,
      recommendedNext: recommendedNext.trim() || null,
      isPremium,
      isActive
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none text-xs font-semibold text-[#0F172A]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F172A]/20 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col justify-between h-full">
          
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <div>
              <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight">
                {question ? 'Edit Coding Question' : 'Create Coding Question'}
              </h2>
              <p className="text-[10px] text-[#64748B] mt-0.5">Define core properties, difficulty, and resource locations.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#E2E8F0]/50 text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Form Content Scrollable */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Title & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Question Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                  placeholder="e.g. Unique Paths"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Topic & Pattern (Select or Creatable) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Topic Focus Area</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  list="topics-datalist"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                  placeholder="Select or type topic"
                />
                <datalist id="topics-datalist">
                  {topics.map((t, i) => <option key={i} value={t} />)}
                </datalist>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Algorithmic Pattern</label>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  list="patterns-datalist"
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                  placeholder="Select or type pattern"
                />
                <datalist id="patterns-datalist">
                  {patterns.map((p, i) => <option key={i} value={p} />)}
                </datalist>
              </div>
            </div>

            {/* Target URLs links */}
            <div className="space-y-3.5 border-t border-[#F1F5F9] pt-4">
              <span className="font-extrabold text-[10px] font-mono text-[#475569] uppercase tracking-wider block">Resource URLs & Links</span>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1 py-2 font-mono text-[10px] text-[#64748B] uppercase">LeetCode URL</div>
                  <input
                    type="url"
                    value={leetcodeUrl}
                    onChange={(e) => setLeetcodeUrl(e.target.value)}
                    className="sm:col-span-2 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                    placeholder="https://leetcode.com/problems/..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1 py-2 font-mono text-[10px] text-[#64748B] uppercase">Video Solution URL</div>
                  <input
                    type="url"
                    value={videoSolutionUrl}
                    onChange={(e) => setVideoSolutionUrl(e.target.value)}
                    className="sm:col-span-2 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1 py-2 font-mono text-[10px] text-[#64748B] uppercase">Article / Editorial URL</div>
                  <input
                    type="url"
                    value={articleUrl}
                    onChange={(e) => setArticleUrl(e.target.value)}
                    className="sm:col-span-2 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                    placeholder="https://leetcode.com/editorial/..."
                  />
                </div>
              </div>
            </div>

            {/* Estimated time, acceptance, frequency tags */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#F1F5F9] pt-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Est. Duration (m)</label>
                <input
                  type="number"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                  min={1}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Acceptance %</label>
                <input
                  type="number"
                  value={acceptanceRate}
                  onChange={(e) => setAcceptanceRate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                  min={1}
                  max={100}
                  placeholder="e.g. 48.5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Frequency Factor</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                >
                  <option value="High">High frequency</option>
                  <option value="Medium">Medium frequency</option>
                  <option value="Low">Low frequency</option>
                </select>
              </div>
            </div>

            {/* Company Tags comma-separated */}
            <div className="space-y-1.5 border-t border-[#F1F5F9] pt-4">
              <label className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Target Corporate Tags</label>
              <input
                type="text"
                value={companyTags}
                onChange={(e) => setCompanyTags(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                placeholder="Amazon, Google, Meta, Microsoft (comma separated)"
              />
            </div>

            {/* Hint text */}
            <div className="space-y-1.5 border-t border-[#F1F5F9] pt-4">
              <label className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider">First solving hint</label>
              <textarea
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs resize-none h-14 placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                placeholder="Give candidates a logic direction..."
              />
            </div>

            {/* Toggles (Premium / Active Status) */}
            <div className="grid grid-cols-2 gap-4 border-t border-[#F1F5F9] pt-4">
              <label className="flex items-center justify-between gap-4 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg cursor-pointer">
                <div>
                  <span className="font-bold text-[#0F172A]">Premium Access</span>
                  <span className="block text-[9px] text-[#64748B] font-medium leading-none mt-0.5">Restrict to paid tier</span>
                </div>
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="h-4 w-4 text-[#4F46E5] border-[#E2E8F0] rounded focus:ring-[#4F46E5]"
                />
              </label>

              <label className="flex items-center justify-between gap-4 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg cursor-pointer">
                <div>
                  <span className="font-bold text-[#0F172A]">Publish Status</span>
                  <span className="block text-[9px] text-[#64748B] font-medium leading-none mt-0.5">Visible to candidates</span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-[#4F46E5] border-[#E2E8F0] rounded focus:ring-[#4F46E5]"
                />
              </label>
            </div>
          </form>

          {/* Footer Save / Preview Actions */}
          <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] rounded-lg font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>Save Question</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
