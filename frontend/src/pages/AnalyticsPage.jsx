import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Target, 
  Award, 
  BookOpen, 
  TrendingUp, 
  RefreshCw 
} from 'lucide-react';
import { analyticsService } from '../services/analytics.service';

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [topics, setTopics] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sData, tData, pData] = await Promise.all([
        analyticsService.getStats(),
        analyticsService.getTopics(),
        analyticsService.getPatterns(),
      ]);

      setStats(sData);
      setTopics(tData || []);
      setPatterns(pData || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 select-none text-xs font-semibold text-[#4F46E5] gap-3">
        <RefreshCw className="h-7 w-7 animate-spin text-[#4F46E5]" />
        <span>Compiling performance analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none text-xs font-semibold text-[#0F172A]">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Analytics</h1>
        <p className="text-xs text-[#64748B] mt-1 font-medium">Track your learning progress and identify weak areas.</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Solved Ratio */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider font-bold">Solved Ratio</span>
            <Award className="h-5 w-5 text-[#4F46E5]" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0F172A] font-mono leading-none">{stats?.questionsSolved || 0}</div>
            <div className="text-[10px] text-[#64748B] mt-2 font-medium">
              out of {stats?.questionsAttempted || 0} attempted questions
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider font-bold">Current practice streak</span>
            <Flame className="h-5 w-5 text-[#F59E0B]" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0F172A] font-mono leading-none">
              {stats?.streak?.current || 0} <span className="text-xs font-normal text-[#64748B]">days</span>
            </div>
            <div className="text-[10px] text-[#64748B] mt-2 font-medium">
              Longest streak recorded: {stats?.streak?.longest || 0} days
            </div>
          </div>
        </div>

        {/* AI rating */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#64748B] tracking-wider font-bold">AI Assessment Average</span>
            <TrendingUp className="h-5 w-5 text-[#22C55E]" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#0F172A] font-mono leading-none">
              {stats?.averageAIRating || 0} <span className="text-xs font-normal text-[#64748B]">/ 10</span>
            </div>
            <div className="text-[10px] text-[#64748B] mt-2 font-medium">
              grade of code structure and edge cases
            </div>
          </div>
        </div>
      </div>

      {/* Topics & Patterns Split Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Topics Completion */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3">
            <BookOpen className="h-5 w-5 text-[#4F46E5]" />
            <h2 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">Topic Completion</h2>
          </div>

          <div className="space-y-4">
            {topics.length === 0 ? (
              <div className="text-center py-6 text-[#64748B] italic">No topics progress recorded.</div>
            ) : (
              topics.map((t) => (
                <div key={t.topicId} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#475569]">{t.topicName}</span>
                    <span className="text-[#64748B] font-mono">{t.completedQuestions} / {t.totalQuestions} ({Math.round(t.completionPercentage)}%)</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden border border-[#E2E8F0]/30">
                    <div
                      className="bg-[#4F46E5] h-full rounded-full transition-all"
                      style={{ width: `${t.completionPercentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Patterns Completion */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3">
            <Target className="h-5 w-5 text-[#4F46E5]" />
            <h2 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">Pattern Coverage</h2>
          </div>

          <div className="space-y-4">
            {patterns.length === 0 ? (
              <div className="text-center py-6 text-[#64748B] italic">No patterns progress recorded.</div>
            ) : (
              patterns.map((p) => (
                <div key={p.patternId} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#475569]">{p.patternName}</span>
                    <span className="text-[#64748B] font-mono">{p.completedQuestions} / {p.totalQuestions} ({Math.round(p.completionPercentage)}%)</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden border border-[#E2E8F0]/30">
                    <div
                      className="bg-[#4F46E5] h-full rounded-full transition-all"
                      style={{ width: `${p.completionPercentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
