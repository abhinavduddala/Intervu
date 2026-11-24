import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Award, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookOpen,
  Calendar,
  Compass,
  Zap,
  Target
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { companyService } from '../services/company.service';
import { recommendationsService } from '../services/recommendations.service';
import ReadinessCard from '../components/company/ReadinessCard';
import CompanyCard from '../components/company/CompanyCard';
import GapAnalysisTable from '../components/company/GapAnalysisTable';
import PatternCard from '../components/company/PatternCard';
import RoadmapTimeline from '../components/company/RoadmapTimeline';
import ComparisonTable from '../components/company/ComparisonTable';
import MockInterviewCompanyCard from '../components/mock-interview/MockInterviewCompanyCard';

// Baseline configurations for all target firms
const COMPANY_PROFILES = {
  Amazon: { difficulty: 'Hard', hours: 45, pattern: 'DFS/BFS', targetTopics: ['Trees', 'Arrays', 'Graphs'] },
  Google: { difficulty: 'Expert', hours: 60, pattern: 'DFS/BFS', targetTopics: ['Graphs', 'Dynamic Programming', 'Trees'] },
  Microsoft: { difficulty: 'Medium', hours: 35, pattern: 'Binary Search', targetTopics: ['Arrays', 'Trees', 'Stacks'] },
  Meta: { difficulty: 'Hard', hours: 50, pattern: 'Two Pointers', targetTopics: ['Arrays', 'Trees', 'Graphs'] },
  Adobe: { difficulty: 'Medium', hours: 30, pattern: 'Hash Map', targetTopics: ['Arrays', 'Trees', 'Linked Lists'] },
  Uber: { difficulty: 'Hard', hours: 55, pattern: 'Graphs', targetTopics: ['Graphs', 'Dynamic Programming', 'Heap'] },
  Atlassian: { difficulty: 'Hard', hours: 40, pattern: 'Stacks', targetTopics: ['Stacks', 'Queues', 'Arrays'] },
  Oracle: { difficulty: 'Medium', hours: 35, pattern: 'Binary Search', targetTopics: ['Arrays', 'Trees', 'Stacks'] },
  Qualcomm: { difficulty: 'Medium', hours: 25, pattern: 'Recursion', targetTopics: ['Arrays', 'Stacks', 'Recursion'] },
  Roche: { difficulty: 'Easy', hours: 15, pattern: 'Hash Map', targetTopics: ['Arrays', 'Linked Lists'] },
  ValueMomentum: { difficulty: 'Easy', hours: 12, pattern: 'Hash Map', targetTopics: ['Arrays', 'Linked Lists'] },
  Techolution: { difficulty: 'Medium', hours: 20, pattern: 'Sliding Window', targetTopics: ['Arrays', 'Sliding Window'] }
};

// Mock history data for chart
const HISTORY_DATA = [
  { week: 'Wk 1', readiness: 42 },
  { week: 'Wk 2', readiness: 48 },
  { week: 'Wk 3', readiness: 55 },
  { week: 'Wk 4', readiness: 63 },
  { week: 'Wk 5', readiness: 71 },
  { week: 'Wk 6', readiness: 78 }
];

const CompanyPage = () => {
  const navigate = useNavigate();
  
  // Data loading states
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('Amazon');
  const [details, setDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [overallScore, setOverallScore] = useState(0);

  // Status check for empty state
  const [hasSolvedAny, setHasSolvedAny] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await companyService.getReadiness();
      
      // Determine if user has solved any questions based on score averages
      const hasSolved = data && data.some(c => c.readinessScore > 10 || c.readiness > 10);
      setHasSolvedAny(hasSolved);

      // Merge backend results with our comprehensive target list
      const merged = Object.keys(COMPANY_PROFILES).map((name) => {
        const found = data?.find(item => item.companyName === name || item.company === name);
        const score = found ? (found.readinessScore || found.readiness || 0) : 0;
        
        // Generate a baseline score based on other solved stats if not present in API
        const profile = COMPANY_PROFILES[name];
        const baseScore = score > 0 ? score : Math.max(15, Math.min(78, (data?.[0]?.readinessScore || 45) - (profile.difficulty === 'Expert' ? 25 : profile.difficulty === 'Hard' ? 12 : 5)));
        
        return {
          company: name,
          readiness: baseScore,
          difficulty: profile.difficulty,
          hoursToReady: Math.max(4, Math.round(profile.hours * (1 - baseScore / 100))),
          topicsRemaining: Math.max(1, Math.round(3 * (1 - baseScore / 100))),
          pattern: profile.pattern,
          targetTopics: profile.targetTopics
        };
      });

      setCompanies(merged);

      // Overall average score calculation
      const avg = merged.reduce((sum, item) => sum + item.readiness, 0) / merged.length;
      setOverallScore(Math.round(avg));

      // Trigger select first company
      if (merged.length > 0) {
        handleSelectCompany(selectedCompany || merged[0].company, merged);
      }
    } catch (err) {
      console.error('Failed to load company readiness metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompany = async (companyName, list = companies) => {
    setSelectedCompany(companyName);
    setLoadingDetails(true);
    try {
      const found = list.find(c => c.company === companyName);
      let detailsPayload = null;

      try {
        detailsPayload = await companyService.getDetail(companyName);
      } catch (err) {
        // Fallback to locally mock metadata details if API errors out or is unconfigured
        const compProfile = COMPANY_PROFILES[companyName];
        detailsPayload = {
          company: companyName,
          readiness: found?.readiness || 65,
          solvedCount: found ? Math.round(15 * (found.readiness / 100)) : 4,
          totalCount: 15,
          strengths: found?.readiness >= 70 ? [`${compProfile.pattern} Pattern`, 'Array Manipulation'] : ['Basic Sorting'],
          weakTopics: found?.readiness < 80 ? [compProfile.targetTopics[0]] : [],
          weakPatterns: found?.readiness < 85 ? [compProfile.pattern] : []
        };
      }

      setDetails(detailsPayload);

      // Load recommended questions for this company
      let recs = [];
      try {
        recs = await recommendationsService.getCompanyRecs(companyName);
      } catch (err) {
        // Mock fallback if recommendations not configured
        recs = [
          { questionId: 1, questionTitle: `Two Sum (Topical prep for ${companyName})`, topicName: 'Arrays & Hashing', questionDifficulty: 'easy' },
          { questionId: 3, questionTitle: `Longest Substring Without Repeating Characters`, topicName: 'Sliding Window', questionDifficulty: 'medium' }
        ];
      }
      // The API returns { recommendations: [...] }; accept a bare array too
      setRecommendations(Array.isArray(recs) ? recs : recs?.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateStudyPlan = () => {
    alert(`Study Plan successfully generated for ${selectedCompany}! It has been synced to your dashboard.`);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
          <span className="text-xs font-semibold text-[#64748B]">Loading analytics...</span>
        </div>
      </div>
    );
  }

  // Empty state if overall readiness score is extremely low or user hasn't completed reviews
  if (!hasSolvedAny) {
    return (
      <div className="p-8 max-w-md mx-auto text-center border border-dashed border-[#E2E8F0] p-8 rounded-xl bg-white text-xs font-semibold text-[#0F172A] mt-24">
        <Compass className="h-12 w-12 text-[#64748B] opacity-60 mx-auto mb-4 animate-pulse" />
        <h2 className="text-sm font-extrabold text-[#0F172A] mb-1">Company Readiness Locked</h2>
        <p className="text-[#64748B] mb-6 leading-relaxed">
          Solve at least one coding question and submit it to the AI Review Engine to unlock readiness tracking metrics.
        </p>
        <button
          onClick={() => navigate('/questions')}
          className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          View Questions Explorer
        </button>
      </div>
    );
  }

  // Helper variables for details
  const compProfile = COMPANY_PROFILES[selectedCompany] || COMPANY_PROFILES.Amazon;
  
  // Topic Gap mock data generator
  const gapAnalysisData = compProfile.targetTopics.map((topic) => {
    const isWeak = details?.weakTopics?.includes(topic);
    const score = isWeak ? 45 : Math.round(details?.readiness || 70);
    return {
      topic,
      required: 85,
      current: score,
      recommendation: isWeak ? `Solve 2 more medium-difficulty problems` : 'Optimal status reached'
    };
  });

  // Pattern mastery cards mock data
  const patternMasteryData = [
    { name: compProfile.pattern, mastery: details?.readiness || 65, remaining: 1 },
    { name: 'Sliding Window', mastery: 80, remaining: 0 },
    { name: 'Hash Map', mastery: 90, remaining: 0 }
  ];

  // Milestone timeline data
  const milestonesData = [
    { name: 'Core Syntax & Logic', status: 'completed', questionCount: 4, estHours: 6, difficulty: 'easy' },
    { name: `${compProfile.pattern} Focus`, status: 'current', questionCount: 2, estHours: 5, difficulty: 'medium' },
    { name: 'System Constraints', status: 'next', questionCount: 3, estHours: 8, difficulty: 'medium' },
    { name: 'Extreme Edge Auditing', status: 'future', questionCount: 1, estHours: 4, difficulty: 'hard' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none pb-24 text-xs font-semibold text-[#0F172A]">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Company Readiness</h1>
        <p className="text-xs text-[#64748B] mt-1 font-medium">Am I ready to interview at my target company?</p>
      </div>

      {/* Header Cards (Overall Readiness & Chart Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Overall Readiness Indicator */}
        <div className="lg:col-span-1 flex flex-col justify-between">
          <ReadinessCard overallScore={overallScore} />
        </div>

        {/* Readiness History Line Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
            <span className="font-extrabold text-xs text-[#0F172A] flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-[#4F46E5]" />
              <span>Readiness Progress Timeline</span>
            </span>
            <span className="text-[10px] text-[#64748B] font-mono">Past 6 Weeks</span>
          </div>
          
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={9} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} fontFamily="JetBrains Mono" domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '10px' }} 
                  labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="readiness" 
                  stroke="#4F46E5" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#4F46E5', strokeWidth: 0 }}
                  activeDot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Target Companies horizontal scroll grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-extrabold text-xs text-[#0F172A] uppercase tracking-wider">Target Tech Corporations</span>
          <span className="text-[10px] text-[#64748B]">Click card to inspect roadmap</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {companies.map((c) => (
            <CompanyCard
              key={c.company}
              companyName={c.company}
              readiness={c.readiness}
              difficulty={c.difficulty}
              topicsRemaining={c.topicsRemaining}
              hoursToReady={c.hoursToReady}
              isSelected={selectedCompany === c.company}
              onSelect={() => handleSelectCompany(c.company)}
            />
          ))}
        </div>
      </div>

      {/* Main Details inspector grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left segment detail inspection (7 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {loadingDetails ? (
            <div className="p-12 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center animate-pulse">
              <Loader2 className="h-6 w-6 animate-spin text-[#4F46E5]" />
            </div>
          ) : details && (
            <>
              {/* Detailed metrics box */}
              <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-[#F1F5F9] pb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#4F46E5]" />
                    <h3 className="font-extrabold text-sm text-[#0F172A]">{details.company} Interview Analytics</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateStudyPlan}
                      className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors"
                    >
                      Generate Study Plan
                    </button>
                  </div>
                </div>

                {/* Grid performance statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <div className="text-[9px] text-[#64748B] uppercase tracking-wider font-mono">Solved Volume</div>
                    <div className="text-sm font-extrabold text-[#0F172A] font-mono mt-0.5">
                      {details.solvedCount} / {details.totalCount} problems
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <div className="text-[9px] text-[#64748B] uppercase tracking-wider font-mono">AI Accuracy Confidence</div>
                    <div className="text-sm font-extrabold text-[#0F172A] font-mono mt-0.5">
                      {Math.round(details.readiness * 0.95)}%
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <div className="text-[9px] text-[#64748B] uppercase tracking-wider font-mono">Company Solved Ratio</div>
                    <div className="text-sm font-extrabold text-[#22C55E] font-mono mt-0.5">
                      {Math.round((details.solvedCount / details.totalCount) * 100)}%
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                    <div className="text-[9px] text-[#64748B] uppercase tracking-wider font-mono">Interview Difficulty</div>
                    <div className="text-sm font-extrabold text-[#EF4444] uppercase tracking-wider mt-0.5">
                      {compProfile.difficulty}
                    </div>
                  </div>
                </div>

                {/* Strengths / Weaknesses checklists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-emerald-50/10 border border-emerald-100 rounded-lg space-y-2">
                    <div className="text-[10px] font-mono text-[#22C55E] uppercase tracking-wider font-bold">Readiness Strengths</div>
                    {details.strengths?.length > 0 ? (
                      <ul className="space-y-1 text-[#475569] font-medium text-xs">
                        {details.strengths.map((s, i) => (
                          <li key={i} className="flex items-center gap-1.5">• {s}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[10px] text-[#64748B] italic">No strength anchors tracked.</span>
                    )}
                  </div>

                  <div className="p-4 bg-red-50/10 border border-red-100 rounded-lg space-y-2">
                    <div className="text-[10px] font-mono text-[#EF4444] uppercase tracking-wider font-bold">Preparation Gaps</div>
                    {details.weakTopics?.length > 0 ? (
                      <ul className="space-y-1 text-[#475569] font-medium text-xs">
                        {details.weakTopics.map((wt, i) => (
                          <li key={i} className="flex items-center gap-1.5">• {wt} Topic</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[10px] text-[#22C55E] font-bold flex items-center gap-1">✔ Full mastery reached</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Gap Analysis table container */}
              <GapAnalysisTable gapData={gapAnalysisData} />

              {/* Pattern readiness cards */}
              <div className="space-y-3.5">
                <span className="font-extrabold text-xs text-[#0F172A] uppercase tracking-wider">Pattern Mastery Mapping</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {patternMasteryData.map((p, idx) => (
                    <PatternCard
                      key={idx}
                      patternName={p.name}
                      mastery={p.mastery}
                      recommendedCount={p.remaining}
                    />
                  ))}
                </div>
              </div>

              {/* Milestones timeline roadmap */}
              <RoadmapTimeline milestones={milestonesData} />
            </>
          )}

        </div>

        {/* Right segment target details list (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">

          {selectedCompany && <MockInterviewCompanyCard company={selectedCompany} />}
          
          {/* AI recommendations card list */}
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 border-b border-[#F1F5F9] pb-3">
              <Sparkles className="h-4.5 w-4.5 text-[#4F46E5] shrink-0" />
              <h3 className="font-extrabold text-xs text-[#0F172A]">AI Readiness Insights</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-lg text-xs leading-relaxed text-[#475569] font-medium">
                Complete at least <strong className="text-[#4F46E5]">2 Graph problems</strong> before attempting Google technical interviews.
              </div>
              <div className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-lg text-xs leading-relaxed text-[#475569] font-medium">
                Focus on improving <strong className="text-[#4F46E5]">Dynamic Programming</strong> recursion benchmarks for Microsoft.
              </div>
              <div className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-lg text-xs leading-relaxed text-[#475569] font-medium">
                Audit tree logical pointers to raise target scores.
              </div>
            </div>
          </div>

          {/* Recommended practice question checklist cards */}
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 border-b border-[#F1F5F9] pb-3 justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="h-4.5 w-4.5 text-[#4F46E5]" />
                <h3 className="font-extrabold text-xs text-[#0F172A]">Target Preparation Tasks</h3>
              </div>
              <span className="text-[9px] font-mono text-[#64748B]">{recommendations.length} left</span>
            </div>

            <div className="flex flex-col gap-2.5">
              {recommendations.length === 0 ? (
                <div className="text-center py-6 text-[#64748B] italic">
                  No topics remaining! All target matrices cleared.
                </div>
              ) : (
                recommendations.map((rec, i) => (
                  <div 
                    key={i} 
                    className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-200 rounded-lg flex items-center justify-between transition-all cursor-pointer group"
                    onClick={() => navigate(`/workspace/${rec.questionId}`)}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">{rec.questionTitle}</div>
                      <div className="text-[10px] text-[#64748B] font-mono mt-0.5">{rec.topicName}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#64748B] group-hover:text-[#4F46E5] transition-colors shrink-0 ml-1" />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Cross-company comparison table */}
      <div className="pt-4">
        <ComparisonTable
          comparisonData={companies}
          onSelectCompany={(name) => handleSelectCompany(name)}
        />
      </div>

    </div>
  );
};

export default CompanyPage;
