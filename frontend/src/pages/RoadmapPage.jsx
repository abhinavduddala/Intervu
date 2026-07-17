import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Circle,
  PlayCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Target,
  AlertTriangle,
  RotateCcw,
  Compass,
  Award
} from 'lucide-react';
import { roadmapService } from '../services/roadmap.service';
import DifficultyBadge from '../components/explorer/DifficultyBadge';

const RoadmapPage = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStages, setExpandedStages] = useState({});

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roadmapService.getRoadmap();
      setRoadmap(data.roadmap);
      
      // Expand stages that are 'in_progress' by default
      if (data?.roadmap?.stages) {
        const defaultExpanded = {};
        data.roadmap.stages.forEach((stage) => {
          if (stage.status === 'in_progress' || stage.status === 'completed') {
            defaultExpanded[stage.id] = true;
          }
        });
        // If nothing is expanded, expand the first stage
        if (Object.keys(defaultExpanded).length === 0 && data.roadmap.stages.length > 0) {
          defaultExpanded[data.roadmap.stages[0].id] = true;
        }
        setExpandedStages(defaultExpanded);
      }
    } catch (err) {
      console.error('Failed to load learning roadmap:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to communicate with Roadmap API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const toggleStage = (stageId) => {
    setExpandedStages(prev => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse text-xs font-semibold text-[#64748B]">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-7 w-48 bg-zinc-200 rounded-lg" />
          <div className="h-4 w-96 bg-zinc-100 rounded" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-3">
              <div className="h-3 w-20 bg-zinc-100 rounded" />
              <div className="h-6 w-12 bg-zinc-200 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Current Goal Skeleton */}
        <div className="h-36 bg-zinc-50 border border-zinc-100 rounded-xl" />

        {/* Timeline Stages Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-white border border-[#E2E8F0] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="p-8 max-w-md mx-auto text-center border border-red-100 rounded-xl bg-white text-xs font-semibold text-[#0F172A] mt-24 shadow-sm">
        <AlertTriangle className="h-12 w-12 text-[#EF4444] opacity-80 mx-auto mb-4 animate-bounce" />
        <h2 className="text-sm font-extrabold text-[#0F172A] mb-1">Roadmap Connection Failure</h2>
        <p className="text-[#64748B] mb-6 leading-relaxed">
          {error}
        </p>
        <button
          onClick={fetchRoadmap}
          className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 mx-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const { totalQuestions, completedQuestions, inProgressQuestions, completionPercentage, currentQuestion, stages } = roadmap;

  // 3. Empty State
  if (!stages || stages.length === 0) {
    return (
      <div className="p-8 max-w-md mx-auto text-center border border-dashed border-[#E2E8F0] p-8 rounded-xl bg-white text-xs font-semibold text-[#0F172A] mt-24">
        <Compass className="h-12 w-12 text-[#64748B] opacity-60 mx-auto mb-4 animate-pulse" />
        <h2 className="text-sm font-extrabold text-[#0F172A] mb-1">No Active Roadmap</h2>
        <p className="text-[#64748B] mb-6 leading-relaxed">
          There are no curated questions available to generate your learning track roadmap. Please contact your administrator to verify seed questions are properly loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 select-none pb-24 text-xs font-semibold text-[#0F172A]">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Intervu Learning Roadmap</h1>
        <p className="text-xs text-[#64748B] mt-1 font-medium">Follow our curated sequence of key algorithms from top companies to level up your mastery.</p>
      </div>

      {/* Grid of Key Progress metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono font-bold">Total Curriculum</div>
          <div className="text-xl font-extrabold text-[#0F172A] font-mono mt-1">{totalQuestions} questions</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono font-bold">Solved Exercises</div>
          <div className="text-xl font-extrabold text-[#22C55E] font-mono mt-1">{completedQuestions} completed</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono font-bold">In-Progress Tasks</div>
          <div className="text-xl font-extrabold text-[#4F46E5] font-mono mt-1">{inProgressQuestions} active</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-mono font-bold">Overall Progress</div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xl font-extrabold text-[#0F172A] font-mono">{completionPercentage}%</span>
            <div className="h-2 bg-[#E2E8F0] rounded-full flex-grow overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Current Active Goal Highlight */}
      {currentQuestion && (
        <div className="bg-gradient-to-br from-indigo-50/40 via-violet-50/20 to-white border border-indigo-100/80 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-[#4F46E5] rounded-full text-[9px] font-mono tracking-wider uppercase font-extrabold">
              <Target className="h-3 w-3" />
              <span>Next Challenge Target</span>
            </div>
            <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">{currentQuestion.title}</h2>
            <div className="flex items-center gap-3 text-[10px] text-[#64748B] font-mono">
              <span className="bg-white border border-[#E2E8F0] px-2 py-0.5 rounded text-[#0F172A]">{currentQuestion.topic}</span>
              <span>•</span>
              <DifficultyBadge difficulty={currentQuestion.difficulty} />
              {currentQuestion.leetcodeUrl && (
                <>
                  <span>•</span>
                  <a 
                    href={currentQuestion.leetcodeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-[#4F46E5] underline flex items-center gap-0.5"
                  >
                    View on LeetCode
                  </a>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate(`/workspace/${currentQuestion.slug || currentQuestion.id}`)}
            className="px-5 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all self-start md:self-auto hover:translate-x-1 duration-200"
          >
            <span>Solve Challenge</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Roadmap Timeline Sections */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-xs text-[#0F172A] uppercase tracking-wider">Curriculum Path</h3>
        
        <div className="space-y-4">
          {stages.map((stage, idx) => {
            const isExpanded = !!expandedStages[stage.id];
            
            // Icon configuration based on status
            const statusConfigs = {
              completed: {
                icon: CheckCircle2,
                iconColor: 'text-[#22C55E]',
                borderColor: 'border-[#22C55E]/40',
                bgColor: 'bg-white',
                progressColor: 'bg-[#22C55E]'
              },
              in_progress: {
                icon: PlayCircle,
                iconColor: 'text-[#4F46E5]',
                borderColor: 'border-[#4F46E5]/40 shadow-sm shadow-indigo-50',
                bgColor: 'bg-white',
                progressColor: 'bg-[#4F46E5]'
              },
              upcoming: {
                icon: Circle,
                iconColor: 'text-[#94A3B8] opacity-60',
                borderColor: 'border-[#E2E8F0]',
                bgColor: 'bg-[#F8FAFC]/50',
                progressColor: 'bg-zinc-300'
              }
            };

            const config = statusConfigs[stage.status] || statusConfigs.upcoming;
            const StatusIcon = config.icon;

            return (
              <div 
                key={stage.id} 
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${config.borderColor} ${config.bgColor}`}
              >
                {/* Stage Header */}
                <div 
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/50 transition-colors select-none"
                  onClick={() => toggleStage(stage.id)}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <StatusIcon className={`h-5 w-5 shrink-0 ${config.iconColor}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-[#64748B] uppercase tracking-wider font-bold">
                          Stage {idx + 1}
                        </span>
                        <span className="font-mono text-[9px] bg-zinc-100 border border-[#E2E8F0] px-1.5 py-0.2 rounded font-bold uppercase text-[#475569]">
                          {stage.completedQuestions} / {stage.totalQuestions} solved
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-[#0F172A] mt-0.5 tracking-tight">
                        {stage.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#64748B] font-mono bg-zinc-100/60 px-2.5 py-1 rounded-full font-bold">
                      {stage.status === 'completed' ? 'Completed' : stage.status === 'in_progress' ? 'Active' : 'Upcoming'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4.5 w-4.5 text-[#64748B]" />
                    ) : (
                      <ChevronDown className="h-4.5 w-4.5 text-[#64748B]" />
                    )}
                  </div>
                </div>

                {/* Stage Questions List (Expandable body) */}
                {isExpanded && (
                  <div className="border-t border-[#F1F5F9] bg-white p-5 space-y-2">
                    {stage.questions.length === 0 ? (
                      <div className="text-center py-4 text-[#64748B] italic">
                        No questions in this stage.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {stage.questions.map((q) => {
                          const qStatusConfigs = {
                            SOLVED: {
                              color: 'text-[#22C55E]',
                              text: 'Solved',
                              bg: 'bg-emerald-50/40 text-[#15803d]'
                            },
                            IN_PROGRESS: {
                              color: 'text-[#4F46E5]',
                              text: 'Active',
                              bg: 'bg-indigo-50/40 text-[#4338ca]'
                            },
                            NOT_STARTED: {
                              color: 'text-[#94A3B8]',
                              text: 'Todo',
                              bg: 'bg-zinc-50 text-[#64748B]'
                            }
                          };

                          const qConfig = qStatusConfigs[q.status] || qStatusConfigs.NOT_STARTED;

                          return (
                            <div 
                              key={q.id} 
                              className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-indigo-200 rounded-xl flex items-center justify-between gap-4 transition-all group"
                            >
                              <div className="min-w-0 flex flex-col gap-1">
                                <span 
                                  onClick={() => navigate(`/workspace/${q.slug || q.id}`)}
                                  className="font-extrabold text-[#0F172A] hover:text-[#4F46E5] cursor-pointer transition-colors truncate text-xs"
                                >
                                  {q.title}
                                </span>
                                <div className="flex items-center gap-2 text-[9px] text-[#64748B] font-mono">
                                  <DifficultyBadge difficulty={q.difficulty} />
                                  <span>•</span>
                                  <span>{q.pattern}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`text-[9px] font-mono uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${qConfig.bg}`}>
                                  {qConfig.text}
                                </span>
                                <button
                                  onClick={() => navigate(`/workspace/${q.slug || q.id}`)}
                                  className="p-1.5 bg-white border border-[#E2E8F0] hover:border-indigo-300 hover:text-[#4F46E5] text-[#64748B] rounded-lg transition-all"
                                  title="Solve in Workspace"
                                >
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default RoadmapPage;
