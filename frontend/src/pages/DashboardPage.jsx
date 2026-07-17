import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { analyticsService } from '../services/analytics.service';
import { recommendationsService } from '../services/recommendations.service';
import { revisionService } from '../services/revision.service';
import { companyService } from '../services/company.service';
import { questionsService } from '../services/questions.service';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  CheckCircle2, 
  Code2, 
  Flame, 
  Clock, 
  Compass,
  ArrowRight,
  TrendingUp,
  Brain,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import ProgressCard from '../components/ProgressCard';
import CompanyCard from '../components/CompanyCard';
import RecommendationCard from '../components/RecommendationCard';
import ActivityTimeline from '../components/ActivityTimeline';
import InsightsPanel from '../components/InsightsPanel';
import DashboardCard from '../components/DashboardCard';

// Sample mock data for Recharts study progress
const chartData = [
  { day: 'Mon', minutes: 40 },
  { day: 'Tue', minutes: 60 },
  { day: 'Wed', minutes: 30 },
  { day: 'Thu', minutes: 80 },
  { day: 'Fri', minutes: 45 },
  { day: 'Sat', minutes: 90 },
  { day: 'Sun', minutes: 65 },
];

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [revisionStats, setRevisionStats] = useState(null);
  const [revisionsToday, setRevisionsToday] = useState([]);
  const [readiness, setReadiness] = useState([]);
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          sData, 
          pData, 
          rStats, 
          rToday,
          compReadiness,
          uProgress
        ] = await Promise.allSettled([
          analyticsService.getStats(),
          recommendationsService.getStudyPlan(),
          revisionService.getDashboard(),
          revisionService.getToday(),
          companyService.getReadiness(),
          questionsService.getProgress()
        ]);

        setStats(sData.status === 'fulfilled' ? sData.value : null);
        setStudyPlan(pData.status === 'fulfilled' ? pData.value : null);
        setRevisionStats(rStats.status === 'fulfilled' ? rStats.value : null);
        setRevisionsToday(rToday.status === 'fulfilled' ? rToday.value || [] : []);
        setReadiness(compReadiness.status === 'fulfilled' ? compReadiness.value || [] : []);
        setProgressList(uProgress.status === 'fulfilled' ? uProgress.value || [] : []);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute stats metrics or use sensible fallbacks
  const solvedCount = stats?.questionsSolved || progressList.filter(p => p.status === 'solved').length || 0;
  const remainingCount = Math.max(0, 150 - solvedCount);
  
  // Calculate average readiness
  const avgReadiness = readiness.length > 0 
    ? Math.round(readiness.reduce((acc, curr) => acc + (curr.readiness_score || 0), 0) / readiness.length) 
    : 55;

  const dueRevisionCount = revisionStats?.todayCount || revisionsToday.length || 0;
  const activeStreak = stats?.streak?.current || 0;
  const displayName = user?.name || user?.email?.split('@')[0] || 'Abhinav';

  // AI Insights generated based on current progress
  const aiInsights = [
    solvedCount > 5 ? "Your Hash Map pattern is strong." : "Focus on basic Array & Hash Map patterns to start.",
    "Practice Sliding Window problems next for Meta target readiness.",
    "Graph problems require improvement based on your current unsolved count.",
    "Keep solving Medium questions to improve complexity audit diagnostics."
  ];

  // Activities log mockup derived from progressList
  const activities = progressList.length > 0 
    ? progressList.slice(0, 4).map(p => ({
        type: p.status === 'solved' ? 'solved' : 'reviewed',
        title: `${p.status === 'solved' ? 'Solved' : 'Started'} ${p.question_title || 'Question'}`,
        description: `Logged via LeetCode workspace with stage ${p.revision_stage || 1} revision intervals.`,
        time: new Date(p.updated_at || p.created_at).toLocaleDateString()
      }))
    : [
        { type: 'solved', title: 'Solved Two Sum', description: 'O(N) runtime Hash Map optimization compiled.', time: '2 mins ago' },
        { type: 'reviewed', title: 'Reviewed LRU Cache', description: 'Analyzed line-by-line syntax for doubly linked lists.', time: '1 hr ago' },
        { type: 'feedback', title: 'AI Code Review Received', description: 'Completed complexity audit on Valid Parentheses.', time: '2 hrs ago' },
        { type: 'revision', title: 'Completed Revision Check', description: 'Marked stage 2 revision check as passed.', time: '1 day ago' }
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-t-indigo-600 border-[#E2E8F0] animate-spin" />
          <span className="text-xs font-semibold text-[#64748B]">Loading workspace dashboard...</span>
        </div>
      </div>
    );
  }

  // Brand new user layout with 0 solved questions
  if (solvedCount === 0 && progressList.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[600px] text-center">
        <div className="h-16 w-16 bg-indigo-50 border border-indigo-100 text-[#4F46E5] rounded-full flex items-center justify-center mb-6">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">Welcome to Intervu, {displayName}</h1>
        <p className="text-sm text-[#64748B] max-w-md mb-8 leading-relaxed">
          Your AI-powered coding interview companion. Solve questions on LeetCode and paste your solutions to trigger complexity audits and revision planning.
        </p>
        <Link
          to="/questions"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold rounded-lg shadow-sm transition-all text-sm"
        >
          <span>Start Solving Your First Question</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 select-none">
      
      {/* Welcome Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Dashboard</h1>
          <p className="text-xs text-[#64748B] mt-1 font-medium">Welcome back, {displayName}. Review your personalized coding interview roadmap.</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[#64748B] bg-white border border-[#E2E8F0] px-4 py-2.5 rounded-lg shadow-sm">
          <span>Today's Goal: <strong className="text-[#0F172A]">Solve 2 problems</strong></span>
          <span>•</span>
          <span>Weekly: <strong className="text-[#0F172A]">8/10 solved</strong></span>
        </div>
      </div>

      {/* Grid of Key Statistics (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={CheckCircle2}
          title="Questions Solved"
          value={solvedCount}
          trend="+12%"
          trendType="up"
          description="from last week"
        />
        <StatCard
          icon={Code2}
          title="Remaining Problems"
          value={remainingCount}
          trend="-6%"
          trendType="down"
          description="in NeetCode 150 track"
        />
        <StatCard
          icon={Flame}
          title="Company Readiness"
          value={`${avgReadiness}%`}
          trend="+4.2%"
          trendType="up"
          description="average match score"
        />
        <StatCard
          icon={Clock}
          title="Revision Queue"
          value={`${dueRevisionCount} Due`}
          trend={dueRevisionCount > 0 ? "Action Required" : "Up to date"}
          trendType={dueRevisionCount > 0 ? "neutral" : "up"}
          description="spaced active retention"
        />
      </div>

      {/* Main Grid Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Progress, Recommendations, Charts */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Study Progress Curve (Recharts) */}
          <DashboardCard 
            title="Weekly Study Performance" 
            extra={<span className="text-xs font-mono font-bold text-[#4F46E5] flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> O(N) review curve</span>}
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                  />
                  <Area type="monotone" dataKey="minutes" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorMinutes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>

          {/* Daily Recommendations Grid */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">AI Recommended Practice</h2>
              <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">Refreshed 10m ago</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyPlan?.recommendations?.slice(0, 2).map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  questionId={rec.questionId}
                  title={rec.questionTitle}
                  difficulty={rec.difficulty || 'medium'}
                  pattern={rec.patternName || rec.topicName}
                  estimatedTime={rec.estimatedTime || 25}
                  reason={rec.reason}
                />
              )) || (
                <>
                  <RecommendationCard
                    questionId="two-sum"
                    title="Two Sum"
                    difficulty="Easy"
                    pattern="Hash Map"
                    estimatedTime={15}
                    reason="Fundamental array index mapping logic tested heavily at target companies."
                  />
                  <RecommendationCard
                    questionId="lru-cache"
                    title="LRU Cache"
                    difficulty="Medium"
                    pattern="Design"
                    estimatedTime={30}
                    reason="A core double-linked list cache structure due for revision check."
                  />
                </>
              )}
            </div>
          </div>

          {/* Company Readiness metrics list */}
          <DashboardCard 
            title="Placement Company Readiness" 
            extra={<Link to="/company" className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA]">View Full Report &raquo;</Link>}
          >
            <div className="flex flex-col gap-3">
              {readiness.slice(0, 4).map((comp) => (
                <CompanyCard 
                  key={comp.company_name} 
                  company={comp.company_name} 
                  readiness={comp.readiness_score || 0} 
                />
              )) || (
                <>
                  <CompanyCard company="Amazon" readiness={72} />
                  <CompanyCard company="Google" readiness={55} />
                  <CompanyCard company="Microsoft" readiness={63} />
                  <CompanyCard company="Meta" readiness={48} />
                </>
              )}
            </div>
          </DashboardCard>

        </div>

        {/* Right Column (4 cols): Insights, Progress Bars, Activity */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* AI Insights panel */}
          <DashboardCard title="AI Preparation Insights">
            <InsightsPanel insights={aiInsights} />
          </DashboardCard>

          {/* Topic Progress elements */}
          <DashboardCard title="Topic Readiness Map">
            <div className="flex flex-col gap-5">
              <ProgressCard label="Arrays & Hashing" percentage={72} solved={8} total={11} />
              <ProgressCard label="Sliding Window" percentage={34} solved={3} total={9} />
              <ProgressCard label="Graphs" percentage={10} solved={1} total={10} />
              <ProgressCard label="Trees" percentage={60} solved={6} total={10} />
            </div>
          </DashboardCard>

          {/* Right Insights details */}
          <DashboardCard title="Performance Indices">
            <div className="flex flex-col gap-4 text-xs font-medium text-[#64748B]">
              <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
                <span>Study Time (This Week)</span>
                <span className="font-bold text-[#0F172A]">6.2 hrs</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
                <span>Consistency Score</span>
                <span className="font-bold text-[#22C55E]">94%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Streak Target</span>
                <span className="font-bold text-[#F59E0B]">{activeStreak} / 21 Days</span>
              </div>
            </div>
          </DashboardCard>

          {/* Recent Activity timeline */}
          <DashboardCard title="Recent Activity">
            <ActivityTimeline activities={activities} />
          </DashboardCard>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
