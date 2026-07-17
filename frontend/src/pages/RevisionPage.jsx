import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  SlidersHorizontal,
  Flame,
  Target,
  Compass,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { revisionService } from '../services/revision.service';
import RevisionCard from '../components/revision/RevisionCard';
import GoalCard from '../components/revision/GoalCard';
import CalendarView from '../components/revision/CalendarView';
import Timeline from '../components/revision/Timeline';
import WeakTopicCard from '../components/revision/WeakTopicCard';
import HistoryTable from '../components/revision/HistoryTable';
import AIInsightCard from '../components/revision/AIInsightCard';

const SkeletonRevision = () => (
  <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse select-none text-xs font-semibold text-[#0F172A]">
    <div className="h-6 bg-[#E2E8F0] rounded w-48" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-40 bg-[#E2E8F0] rounded w-full" />
        <div className="h-60 bg-[#E2E8F0] rounded w-full" />
      </div>
      <div className="lg:col-span-1 space-y-4">
        <div className="h-80 bg-[#E2E8F0] rounded w-full" />
      </div>
    </div>
  </div>
);

const RevisionPage = () => {
  const navigate = useNavigate();

  // Data loading states
  const [loading, setLoading] = useState(true);
  const [todayRevisions, setTodayRevisions] = useState([]);
  const [upcomingRevisions, setUpcomingRevisions] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  
  // Search & Filter state values
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Selected date agenda from calendar
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Local state for mocked stats
  const [streakCount, setStreakCount] = useState(5);
  const [longestStreak, setLongestStreak] = useState(14);
  const [completionRate, setCompletionRate] = useState(88);
  const [consistencyScore, setConsistencyScore] = useState(92);

  // Load backend schedules and details
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      const [todayData, upcomingData, dashboardData] = await Promise.all([
        revisionService.getToday(),
        revisionService.getUpcoming(),
        revisionService.getDashboard()
      ]);

      // If backend returns empty lists, we populate them with high-fidelity realistic schedules
      const processedToday = todayData?.length > 0 ? todayData : [
        {
          id: 101,
          question_id: 1,
          question_title: 'Two Sum',
          difficulty: 'easy',
          topic_name: 'Arrays & Hashing',
          pattern_name: 'Two Pointers',
          last_revised_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'High',
          estimatedTime: 15,
          companyTags: ['Amazon', 'Google', 'Meta']
        },
        {
          id: 102,
          question_id: 2,
          question_title: 'Valid Parentheses',
          difficulty: 'easy',
          topic_name: 'Stack',
          pattern_name: 'Stack',
          last_revised_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'Medium',
          estimatedTime: 20,
          companyTags: ['Microsoft', 'Amazon']
        }
      ];

      const processedUpcoming = upcomingData?.length > 0 ? upcomingData : [
        {
          id: 103,
          question_id: 3,
          question_title: 'Container With Most Water',
          difficulty: 'medium',
          topic_name: 'Two Pointers',
          pattern_name: 'Two Pointers',
          next_revision_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: 'High',
          estimatedTime: 25,
          companyTags: ['Google', 'Meta']
        },
        {
          id: 104,
          question_id: 4,
          question_title: 'Validate Binary Search Tree',
          difficulty: 'medium',
          topic_name: 'Trees',
          pattern_name: 'DFS/BFS',
          next_revision_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'Medium',
          estimatedTime: 30,
          companyTags: ['Amazon', 'Microsoft']
        }
      ];

      setTodayRevisions(processedToday);
      setUpcomingRevisions(processedUpcoming);
      setDashboardMetrics(dashboardData || { todayCount: processedToday.length, overdueCount: 1, upcomingCount: processedUpcoming.length, calendar: {} });
    } catch (err) {
      console.error('Failed to load revision metrics:', err);
      setErrorMsg('Failed to sync spaced repetition revisions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Action handlers
  const handleStartRevision = (qId) => {
    navigate(`/workspace/${qId}`);
  };

  const handleCompleteRevision = async (qId) => {
    try {
      await revisionService.complete(qId);
      setTodayRevisions(todayRevisions.filter(r => r.question_id !== qId));
      
      // Increment streak and completion stats locally
      setStreakCount(prev => prev + 1);
      setSuccessMsg('Revision marked as completed successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setErrorMsg('Failed to update revision status.');
    }
  };

  const handleSkipRevision = (qId) => {
    setTodayRevisions(todayRevisions.filter(r => r.question_id !== qId));
    setSuccessMsg('Revision skipped and postponed to tomorrow.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Filter application
  const filteredToday = todayRevisions.filter((rev) => {
    const matchesSearch = rev.question_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = selectedTopic === '' || rev.topic_name === selectedTopic;
    const matchesDifficulty = selectedDifficulty === '' || rev.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchesPriority = selectedPriority === '' || rev.priority.toLowerCase() === selectedPriority.toLowerCase();
    return matchesSearch && matchesTopic && matchesDifficulty && matchesPriority;
  });

  // Unique topic list for filtering
  const uniqueTopics = [...new Set(todayRevisions.map(r => r.topic_name))];

  // Calendar event indicators mock mappings
  const calendarEvents = {};
  const todayStr = new Date().toISOString().split('T')[0];
  calendarEvents[todayStr] = todayRevisions.length;
  calendarEvents[new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]] = 1;
  calendarEvents[new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]] = 1;

  // Weak topics details mapping
  const weakTopicsData = [
    { topicName: 'Graphs', mastery: 42, pendingCount: 2, recommendation: 'Solve 2 Medium graph traversals' },
    { topicName: 'Dynamic Programming', mastery: 35, pendingCount: 3, recommendation: 'Solve 3 1-D DP problems' },
    { topicName: 'Trees', mastery: 68, pendingCount: 1, recommendation: 'Solve 1 Medium Binary Tree node check' }
  ];

  // Mock History Table records
  const revisionHistoryData = [
    { question_id: 1, question_title: 'Two Sum', completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), estimatedTime: 15, aiScore: 9, next_revision_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
    { question_id: 2, question_title: 'Valid Parentheses', completed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), estimatedTime: 20, aiScore: 8, next_revision_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  if (loading) {
    return <SkeletonRevision />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none pb-24 text-xs font-semibold text-[#0F172A]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Revision Planner</h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">Review the right questions at the right time.</p>
        </div>
      </div>

      {errorMsg && <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">{errorMsg}</div>}
      {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-[#22C55E] rounded-lg">{successMsg}</div>}

      {/* Main Top Statistics Panel (Streak meters, goals, actions) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Goals Progress Circles */}
        <div className="md:col-span-2">
          <GoalCard 
            todaySolved={2 - filteredToday.length} 
            todayGoal={2} 
            weekSolved={6} 
            weekGoal={10} 
            monthSolved={24} 
            monthGoal={40} 
          />
        </div>

        {/* Study Streak Statistics Card */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 border-b border-[#F1F5F9] pb-2.5">
            <Flame className="h-5 w-5 text-[#F59E0B] fill-current animate-pulse" />
            <span className="font-extrabold text-xs text-[#0F172A]">Active Streak Stats</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono">Current Streak</span>
              <div className="text-base font-extrabold text-[#F59E0B] font-mono">{streakCount} Days</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono">Longest Streak</span>
              <div className="text-base font-extrabold text-[#0F172A] font-mono">{longestStreak} Days</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono">Completion Rate</span>
              <div className="text-base font-extrabold text-[#22C55E] font-mono">{completionRate}%</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono">Consistency</span>
              <div className="text-base font-extrabold text-[#4F46E5] font-mono">{consistencyScore}/100</div>
            </div>
          </div>
        </div>

      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-[#E2E8F0] p-4.5 rounded-xl shadow-sm text-xs font-semibold">
        <div className="flex-1 field-control">
          <Search className="field-icon text-[#64748B] h-3.5 w-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pr-4 py-2 border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-lg text-xs placeholder-[#64748B] focus:outline-none focus:border-[#4F46E5] focus:bg-white bg-[#F8FAFC] transition-all input-with-icon"
            placeholder="Search active revisions by title..."
          />
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-white border border-[#E2E8F0] px-3.5 py-2 rounded-lg text-xs font-semibold text-[#475569] hover:text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="">All Topics</option>
            {uniqueTopics.map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-white border border-[#E2E8F0] px-3.5 py-2 rounded-lg text-xs font-semibold text-[#475569] hover:text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-white border border-[#E2E8F0] px-3.5 py-2 rounded-lg text-xs font-semibold text-[#475569] hover:text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Today's scheduled revisions & history (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Today's schedule card container */}
          <div className="space-y-3.5">
            <span className="font-extrabold text-xs text-[#0F172A] uppercase tracking-wider">Today's revision queue</span>
            
            {filteredToday.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-dashed border-[#E2E8F0] rounded-xl p-8">
                <CheckCircle2 className="h-12 w-12 text-[#22C55E] mb-4 animate-bounce" />
                <h3 className="text-base font-extrabold text-[#0F172A] mb-1">🎉 You're all caught up!</h3>
                <p className="text-xs text-[#64748B] max-w-sm mb-6 leading-relaxed">
                  No spaced repetition tasks scheduled for today. Solve a new problem from the explorer to keep practicing.
                </p>
                <button
                  onClick={() => navigate('/questions')}
                  className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  Solve a New Question
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredToday.map((rev) => (
                  <RevisionCard
                    key={rev.id}
                    revision={rev}
                    onStart={handleStartRevision}
                    onComplete={handleCompleteRevision}
                    onSkip={handleSkipRevision}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Weak Topics performance checklist */}
          <div className="space-y-3.5">
            <span className="font-extrabold text-xs text-[#0F172A] uppercase tracking-wider">Focus Areas (Weak Topics)</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {weakTopicsData.map((wt, idx) => (
                <WeakTopicCard
                  key={idx}
                  topicName={wt.topicName}
                  mastery={wt.mastery}
                  pendingCount={wt.pendingCount}
                  recommendation={wt.recommendation}
                />
              ))}
            </div>
          </div>

          {/* Revision history table */}
          <HistoryTable historyData={revisionHistoryData} />

        </div>

        {/* RIGHT COLUMN: Monthly calendar view, timeline schedules, AI insights (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Monthly Calendar */}
          <CalendarView 
            calendarData={calendarEvents} 
            onSelectDate={setSelectedDate} 
          />

          {/* Selected Date Agenda sidebar indicators */}
          <div className="bg-white border border-[#E2E8F0] p-4.5 rounded-xl shadow-sm space-y-3.5">
            <h4 className="font-extrabold text-xs text-[#0F172A] border-b border-[#F1F5F9] pb-2">
              Agenda: {selectedDate === todayStr ? 'Today' : selectedDate}
            </h4>
            {selectedDate === todayStr && filteredToday.length > 0 ? (
              <div className="space-y-2">
                {filteredToday.map((rev) => (
                  <div key={rev.id} className="p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs leading-normal flex items-center justify-between">
                    <span className="font-bold text-[#0f172a] truncate max-w-[150px]">{rev.question_title}</span>
                    <button 
                      onClick={() => navigate(`/workspace/${rev.question_id}`)}
                      className="text-[10px] font-bold text-[#4F46E5] hover:underline"
                    >
                      Start
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-[#64748B] italic">No revisions scheduled for this date.</div>
            )}
          </div>

          {/* Timeline groupings for upcoming */}
          <Timeline upcoming={upcomingRevisions} />

          {/* AI insights recommendations */}
          <AIInsightCard />

        </div>

      </div>

    </div>
  );
};

export default RevisionPage;
