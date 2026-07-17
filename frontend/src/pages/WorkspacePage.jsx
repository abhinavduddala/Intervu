import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ExternalLink, 
  Video, 
  Compass, 
  Loader2, 
  Sparkles,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Calendar,
  Clock,
  History
} from 'lucide-react';
import { questionsService } from '../services/questions.service';
import QuestionHeader from '../components/workspace/QuestionHeader';
import QuestionMetadata from '../components/workspace/QuestionMetadata';
import CompanyTags from '../components/workspace/CompanyTags';
import HintCard from '../components/workspace/HintCard';
import CodeInput from '../components/workspace/CodeInput';
import LanguageSelector from '../components/workspace/LanguageSelector';
import AnalysisCard from '../components/workspace/AnalysisCard';
import NotesCard from '../components/workspace/NotesCard';
import SessionModal from '../components/workspace/SessionModal';

// Skeleton layout for questions page details
const SkeletonWorkspace = () => (
  <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse select-none text-xs font-semibold text-[#0f172a]">
    <div className="h-4 bg-[#E2E8F0] rounded w-32 mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="h-10 bg-[#E2E8F0] rounded w-2/3" />
        <div className="h-16 bg-[#E2E8F0] rounded w-full" />
        <div className="h-40 bg-[#E2E8F0] rounded w-full" />
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="h-80 bg-[#E2E8F0] rounded w-full" />
      </div>
    </div>
  </div>
);

const WorkspacePage = () => {
  const { slugOrId } = useParams();
  
  // Data loading states
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [notes, setNotes] = useState('');
  
  // Form submission inputs
  const [sourceCode, setSourceCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Banners and modals states
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showReturnPrompt, setShowReturnPrompt] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // past analyses history
  const [pastAnalyses, setPastAnalyses] = useState([]);

  // Fetch question and details
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      let q = null;
      if (!isNaN(Number(slugOrId))) {
        q = await questionsService.getById(Number(slugOrId));
      } else {
        const res = await questionsService.get();
        q = res.questions.find(item => item.slug === slugOrId) || res.questions[0];
      }

      if (q) {
        setQuestion(q);
        setLeetcodeUrl(q.leetcodeUrl || '');
        
        // Fetch progress details
        const progressList = await questionsService.getProgress();
        const foundProgress = progressList.find(p => p.question_id === q.id);
        
        if (foundProgress) {
          setProgress(foundProgress);
          setNotes(foundProgress.notes || '');
          setIsFavorite(foundProgress.status === 'FAVORITE' || foundProgress.favorite === true);
          
          if (foundProgress.leetcode_submission_url) {
            setLeetcodeUrl(foundProgress.leetcode_submission_url);
          }
          
          // Show return prompt banner if starting session is in progress
          if (foundProgress.status === 'IN_PROGRESS') {
            setShowReturnPrompt(true);
          }

          // Populate past analyses from mock records if any
          if (foundProgress.history) {
            setPastAnalyses(foundProgress.history);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load question details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slugOrId]);

  // Redirection confirmation handler
  const handleStartSessionConfirm = async () => {
    setShowSessionModal(false);
    try {
      const p = await questionsService.start(question.id);
      setProgress(p);
      setShowReturnPrompt(true);
      window.open(question.leetcodeUrl || question.sourceUrl || `https://leetcode.com/problems/${question.slug || 'two-sum'}/`, '_blank');
      setSuccessMsg('Redirection session started on LeetCode.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Failed to initialize session status.');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!question) return;
    try {
      const p = await questionsService.favorite(question.id);
      setProgress(p);
      setIsFavorite(p.status === 'FAVORITE' || p.favorite === true);
    } catch (err) {
      setErrorMsg('Failed to update favorite status.');
    }
  };

  // Autosave notes callback
  const handleAutosaveNotes = async (newNotes) => {
    if (!question) return;
    await questionsService.saveNotes(question.id, newNotes);
  };

  // Mark solved
  const handleMarkSolved = async () => {
    if (!question) return;
    try {
      const p = await questionsService.markSolved(question.id, leetcodeUrl || null);
      setProgress(p);
      setShowReturnPrompt(false);
      setSuccessMsg('Status updated to Solved!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Failed to mark question as solved.');
    }
  };

  // Run AI analysis
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!sourceCode.trim()) {
      setErrorMsg('Please paste some code to run the review engine.');
      return;
    }
    setErrorMsg('');
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await questionsService.pasteSolution(question.id, { sourceCode, language });
      setAnalysis(res.analysis);
      
      // Reload progress state
      const progressList = await questionsService.getProgress();
      const foundProgress = progressList.find(p => p.question_id === question.id);
      if (foundProgress) {
        setProgress(foundProgress);
        setShowReturnPrompt(false);
        if (foundProgress.history) {
          setPastAnalyses(foundProgress.history);
        }
      }
      setSuccessMsg('AI Complexity Review complete.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'AI Analysis review failed. Verify connection endpoints.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <SkeletonWorkspace />;
  }

  if (!question) {
    return (
      <div className="p-8 max-w-md mx-auto text-center border border-[#E2E8F0] p-8 rounded-xl bg-white text-xs font-semibold text-[#0F172A] mt-20">
        <h2 className="text-sm font-extrabold text-[#EF4444] mb-2">Question Details Stale</h2>
        <p className="text-[#64748B] mb-4">Could not load question metadata from the PostgreSQL database.</p>
        <Link to="/questions" className="text-[#4F46E5] hover:underline font-bold">Back to Explorer</Link>
      </div>
    );
  }

  const currentStatus = progress?.status || 'NOT_STARTED';

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 select-none pb-24 text-xs font-semibold text-[#0F172A]">
      
      {/* Return Prompt Welcome Back Header Banner */}
      {showReturnPrompt && (
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#4F46E5] shrink-0" />
            <div className="text-left">
              <span className="font-bold text-[#0F172A]">Welcome Back</span>
              <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Did you finish solving this question on LeetCode?</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkSolved}
              className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm"
            >
              Yes, Solved
            </button>
            <button
              onClick={() => setShowReturnPrompt(false)}
              className="px-3.5 py-1.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0f172a] text-[11px] font-bold rounded-lg transition-colors"
            >
              Still Working
            </button>
          </div>
        </div>
      )}

      {/* Nav back trigger */}
      <div className="flex items-center justify-between">
        <Link to="/questions" className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors">
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span>Explorer</span>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-[#22C55E] rounded-lg">
          {successMsg}
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Metadata, Hints, Resources, Notes (65%) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-6">
            
            {/* Header info */}
            <QuestionHeader
              question={question}
              status={currentStatus}
              isFavorite={isFavorite}
              onFavorite={handleToggleFavorite}
            />

            {/* Parameter specifications */}
            <QuestionMetadata question={question} />

            {/* Corporate tags */}
            <CompanyTags tags={question.companyTags} />

            {/* Solve Session Trigger buttons */}
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Compass className="h-8 w-8 text-[#4F46E5]" />
                <div className="text-left">
                  <div className="text-xs font-bold text-[#0F172A]">LeetCode Target Sandbox</div>
                  <div className="text-[10px] text-[#64748B] font-medium mt-0.5">Solve this challenge on the live LeetCode editor.</div>
                </div>
              </div>
              
              <button
                onClick={() => setShowSessionModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm text-xs"
              >
                <span>Solve on LeetCode</span>
                <ExternalLink className="h-4 w-4 shrink-0" />
              </button>
            </div>

            {/* Video & Article editorial links */}
            <div className="grid grid-cols-2 gap-4">
              {question.videoSolutionUrl ? (
                <a
                  href={question.videoSolutionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg transition-colors font-semibold text-[#475569] hover:text-[#0F172A]"
                >
                  <Video className="h-4 w-4 text-[#EF4444] shrink-0" />
                  <span>Video Solution</span>
                </a>
              ) : (
                <span className="flex items-center justify-center gap-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0]/50 rounded-lg text-[#64748B] opacity-60">
                  <Video className="h-4 w-4 shrink-0" />
                  <span>No Video solution</span>
                </span>
              )}

              {question.articleUrl ? (
                <a
                  href={question.articleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg transition-colors font-semibold text-[#475569] hover:text-[#0F172A]"
                >
                  <Compass className="h-4 w-4 text-[#22C55E] shrink-0" />
                  <span>Editorial Solution</span>
                </a>
              ) : (
                <span className="flex items-center justify-center gap-2 p-3 bg-[#F8FAFC] border border-[#E2E8F0]/50 rounded-lg text-[#64748B] opacity-60">
                  <Compass className="h-4 w-4 shrink-0" />
                  <span>No Editorial review</span>
                </span>
              )}
            </div>

          </div>

          {/* Collapsible logic hint card */}
          <HintCard hint={question.hint} />

          {/* Autosaving Study Notes card */}
          <NotesCard
            value={notes}
            onChange={setNotes}
            onSave={handleAutosaveNotes}
          />

          {/* Prerequisite and recommended paths list */}
          {(question.prerequisites?.length > 0 || question.recommendedNext?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm">
              {/* Prerequisites */}
              {question.prerequisites?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Prerequisite Concepts</h4>
                  <ul className="space-y-1.5">
                    {question.prerequisites.map((p, i) => (
                      <li key={i} className="text-xs text-[#475569] font-medium">• {p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Recommended next */}
              {question.recommendedNext?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Recommended Next</h4>
                  <ul className="space-y-1.5">
                    {question.recommendedNext.map((rn, i) => (
                      <li key={i} className="text-xs text-[#475569] font-medium">• {rn}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: AI Workspace, Analysis Results, Performance Stats (35%) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Performance stats right details card */}
          <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs text-[#0F172A] border-b border-[#F1F5F9] pb-2">Status Metrics Overview</h3>
            <div className="space-y-2 text-xs font-semibold text-[#64748B]">
              <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]/50">
                <span>Solves Status</span>
                <span className="font-bold text-[#0F172A] uppercase">{currentStatus}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]/50">
                <span>Total Solved Attempts</span>
                <span className="font-bold text-[#0F172A]">{progress?.attempts_count || (currentStatus === 'SOLVED' ? 1 : 0)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]/50">
                <span>Spaced Revision Stage</span>
                <span className="font-bold text-[#4F46E5]">Stage {progress?.revision_stage || 1}</span>
              </div>
              {progress?.next_revision_at && (
                <div className="flex justify-between py-1.5 border-b border-[#F1F5F9]/50">
                  <span>Next Spaced Check</span>
                  <span className="font-bold text-[#F59E0B] flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(progress.next_revision_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* AI Code Paste Review Form */}
          <form onSubmit={handleAnalyze} className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-xs text-[#0F172A]">AI Solution Paste</span>
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>

            <CodeInput value={sourceCode} onChange={setSourceCode} language={language} />

            <div>
              <label className="block text-[10px] font-mono text-[#64748B] uppercase tracking-wider mb-1.5">Submission Link (Optional)</label>
              <input
                type="url"
                value={leetcodeUrl}
                onChange={(e) => setLeetcodeUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#4F46E5] transition-all"
                placeholder="https://leetcode.com/submissions/detail/123456789/"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={analyzing}
                className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] disabled:bg-indigo-300 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm text-xs"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span>Analyzing solution...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-indigo-200 shrink-0" />
                    <span>Analyze Code</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleMarkSolved}
                className="w-full py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] font-semibold rounded-lg transition-colors text-xs"
              >
                Mark Solved Directly
              </button>
            </div>
          </form>

          {/* AI Analysis Skeletons display */}
          {analyzing && (
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl animate-pulse space-y-4">
              <div className="h-4 bg-[#F1F5F9] rounded w-1/3" />
              <div className="h-20 bg-[#F1F5F9] rounded w-full" />
              <div className="h-10 bg-[#F1F5F9] rounded w-full" />
            </div>
          )}

          {/* AI analysis result display */}
          <AnalysisCard analysis={analysis} />

          {/* Past Analyses Comparison History block */}
          {pastAnalyses.length > 0 && (
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center gap-1.5 font-bold">
                <History className="h-4.5 w-4.5 text-[#4F46E5]" />
                <span>AI Review History</span>
              </div>
              <div className="flex flex-col gap-2">
                {pastAnalyses.slice(0, 3).map((hist, idx) => (
                  <div key={idx} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs leading-relaxed flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] text-[#64748B] font-mono">
                      <span>{new Date(hist.timestamp).toLocaleDateString()}</span>
                      <span className="font-bold text-[#4F46E5]">{hist.language}</span>
                    </div>
                    <div className="font-mono text-[#0f172a] font-bold mt-1">Time: {hist.time_complexity} | Space: {hist.space_complexity}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Confirmation Session Modal */}
      {showSessionModal && (
        <SessionModal
          question={question}
          onClose={() => setShowSessionModal(false)}
          onConfirm={handleStartSessionConfirm}
        />
      )}

    </div>
  );
};

export default WorkspacePage;
