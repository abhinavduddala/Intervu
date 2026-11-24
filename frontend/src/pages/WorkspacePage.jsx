import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Video,
  Compass,
  Loader2,
  Sparkles,
  Play,
  Send,
  RotateCcw,
  Calendar,
  History,
} from 'lucide-react';
import { questionsService } from '../services/questions.service';
import { workspaceService } from '../services/workspace.service';
import { companyService } from '../services/company.service';
import QuestionHeader from '../components/workspace/QuestionHeader';
import QuestionMetadata from '../components/workspace/QuestionMetadata';
import CompanyTags from '../components/workspace/CompanyTags';
import HintCard from '../components/workspace/HintCard';
import LanguageSelector from '../components/workspace/LanguageSelector';
import CodeEditor from '../components/workspace/CodeEditor';
import ProblemStatement from '../components/workspace/ProblemStatement';
import ConsolePanel from '../components/workspace/ConsolePanel';
import AnalysisCard from '../components/workspace/AnalysisCard';
import ReadinessPanel from '../components/workspace/ReadinessPanel';
import NotesCard from '../components/workspace/NotesCard';

const LANG_STORAGE_KEY = 'intervu:workspace:language';
const codeKey = (questionId, lang) => `intervu:workspace:code:${questionId}:${lang}`;

const SkeletonWorkspace = () => (
  <div className="p-8 max-w-[1500px] mx-auto space-y-6 animate-pulse select-none">
    <div className="h-4 bg-[#E2E8F0] rounded w-32 mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 space-y-6">
        <div className="h-10 bg-[#E2E8F0] rounded w-2/3" />
        <div className="h-64 bg-[#E2E8F0] rounded w-full" />
      </div>
      <div className="lg:col-span-7 space-y-6">
        <div className="h-[460px] bg-[#E2E8F0] rounded w-full" />
      </div>
    </div>
  </div>
);

// Shape a finished submission like a run result so the console can render both
const submissionToResult = (s) => ({
  mode: 'suite',
  verdict: s.statusDescription,
  statusId: s.statusId,
  passed: s.passedCount ?? 0,
  total: s.totalCount ?? 0,
  cases: s.testResults || [],
  compileOutput: s.compileOutput,
  stderr: s.stderr,
  executionTime: s.executionTime,
  executionMemory: s.executionMemory,
});

const WorkspacePage = () => {
  const { slugOrId } = useParams();

  // Question and progress
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Problem statement, tests, starter code
  const [problem, setProblem] = useState(null);
  const [problemLoading, setProblemLoading] = useState(false);

  // Editor
  const [language, setLanguage] = useState(() => localStorage.getItem(LANG_STORAGE_KEY) || 'python');
  const [sourceCode, setSourceCode] = useState('');

  // Execution
  const [running, setRunning] = useState(false);
  const [runStatus, setRunStatus] = useState('');
  const [runResult, setRunResult] = useState(null);
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [lastSubmissionId, setLastSubmissionId] = useState(null);

  // AI review and readiness
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [pastAnalyses, setPastAnalyses] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [previousReadiness, setPreviousReadiness] = useState({});

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const loadedCodeFor = useRef(null);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const refreshProgress = useCallback(async (questionId) => {
    try {
      const progressList = await questionsService.getProgress();
      const found = progressList.find((p) => p.question_id === questionId);
      if (found) {
        setProgress(found);
        setIsFavorite(found.status === 'FAVORITE' || found.favorite === true);
      }
      return found;
    } catch {
      return null;
    }
  }, []);

  const refreshReadiness = useCallback(async () => {
    setReadinessLoading(true);
    try {
      setReadiness(await companyService.getReadiness());
    } catch {
      /* readiness is optional on this page */
    } finally {
      setReadinessLoading(false);
    }
  }, []);

  const refreshHistory = useCallback(async (questionId) => {
    try {
      const history = await workspaceService.getQuestionAnalyses(questionId);
      setPastAnalyses(history.filter((h) => h.status === 'completed'));
    } catch {
      /* history is optional */
    }
  }, []);

  const loadProblem = useCallback(async (questionId, refresh = false) => {
    setProblemLoading(true);
    try {
      setProblem(await workspaceService.getProblem(questionId, { refresh }));
    } catch (err) {
      setProblem({ generated: false, error: err.message, starterCode: {}, sampleTests: [] });
    } finally {
      setProblemLoading(false);
    }
  }, []);

  // Load question, progress, problem, readiness and history
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        setAnalysis(null);
        setRunResult(null);
        setProblem(null);
        loadedCodeFor.current = null;

        let q = null;
        if (!isNaN(Number(slugOrId))) {
          q = await questionsService.getById(Number(slugOrId));
        } else {
          q = await questionsService.getBySlug(slugOrId).catch(() => null);
        }

        if (q) {
          setQuestion(q);
          const found = await refreshProgress(q.id);
          setNotes(found?.notes || '');
          loadProblem(q.id);
          refreshReadiness();
          refreshHistory(q.id);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load question details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slugOrId, refreshProgress, loadProblem, refreshReadiness, refreshHistory]);

  // Load saved code (or the starter template) when the question, problem or language changes
  useEffect(() => {
    if (!question || !problem) return;
    const key = codeKey(question.id, language);
    if (loadedCodeFor.current === key) return;
    loadedCodeFor.current = key;
    const saved = localStorage.getItem(key);
    setSourceCode(saved ?? problem.starterCode?.[language] ?? '');
  }, [question, problem, language]);

  const handleCodeChange = (code) => {
    setSourceCode(code);
    if (question) localStorage.setItem(codeKey(question.id, language), code);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    setRunResult(null);
  };

  const handleResetCode = () => {
    if (!question || !problem) return;
    localStorage.removeItem(codeKey(question.id, language));
    setSourceCode(problem.starterCode?.[language] ?? '');
  };

  const ensureCode = () => {
    if (!sourceCode.trim()) {
      setErrorMsg('Write some code first.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleRun = async () => {
    if (!question || running || !ensureCode()) return;
    setRunning(true);
    setRunStatus(useCustomInput ? 'Running with custom input...' : 'Running sample tests...');
    try {
      const result = await workspaceService.run({
        questionId: question.id,
        language,
        sourceCode,
        customInput: useCustomInput ? customInput : undefined,
      });
      setRunResult(result);
    } catch (err) {
      setRunResult({ error: err.message || 'Code execution failed.' });
    } finally {
      setRunning(false);
    }
  };

  // Ask Gemini to review the code; uses real test results when a submission id is given
  const handleAnalyze = async (submissionId = null, code = sourceCode, lang = language) => {
    if (!question || analyzing) return;
    if (!code.trim()) {
      setErrorMsg('Write some code before requesting an AI review.');
      return;
    }
    setErrorMsg('');
    setAnalyzing(true);
    setAnalysis(null);
    setPreviousReadiness(Object.fromEntries((readiness || []).map((c) => [c.company, c.readiness])));
    try {
      const res = await questionsService.pasteSolution(question.id, { sourceCode: code, language: lang, submissionId });
      setAnalysis(res.analysis);
      flash('AI review complete.');
      refreshProgress(question.id);
      refreshReadiness();
      refreshHistory(question.id);
    } catch (err) {
      setErrorMsg(err.message || 'AI review failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!question || running || !ensureCode()) return;
    const code = sourceCode;
    const lang = language;
    setRunning(true);
    setRunStatus('Submitting...');
    try {
      const s = await workspaceService.submit(
        { questionId: question.id, language: lang, sourceCode: code },
        { onStatus: (st) => setRunStatus(st === 'Processing' ? 'Running all test cases...' : `${st}...`) }
      );
      setRunResult(submissionToResult(s));
      setLastSubmissionId(s.submissionId);
      if (s.statusId === 3) flash('Accepted! Question marked as solved.');
      setRunning(false);
      refreshProgress(question.id);
      // Review every submission so the user gets feedback, the optimal solution and hints
      handleAnalyze(s.submissionId, code, lang);
    } catch (err) {
      setRunResult({ error: err.message || 'Submission failed.' });
      setRunning(false);
    }
  };

  const handleRequestHint = (level, previousHints) =>
    workspaceService.getHint({ questionId: question.id, language, code: sourceCode, level, previousHints });

  const handleToggleFavorite = async () => {
    if (!question) return;
    try {
      const p = await questionsService.favorite(question.id);
      setProgress(p);
      setIsFavorite(p.status === 'FAVORITE' || p.favorite === true);
    } catch {
      setErrorMsg('Failed to update favorite status.');
    }
  };

  const handleAutosaveNotes = async (newNotes) => {
    if (!question) return;
    await questionsService.saveNotes(question.id, newNotes);
  };

  const handleMarkSolved = async () => {
    if (!question) return;
    try {
      const p = await questionsService.markSolved(question.id, null);
      setProgress(p);
      flash('Status updated to Solved!');
      refreshReadiness();
    } catch {
      setErrorMsg('Failed to mark question as solved.');
    }
  };

  if (loading) return <SkeletonWorkspace />;

  if (!question) {
    return (
      <div className="max-w-md mx-auto text-center border border-[#E2E8F0] p-8 rounded-xl bg-white text-xs font-semibold text-[#0F172A] mt-20">
        <h2 className="text-sm font-extrabold text-[#EF4444] mb-2">Question not found</h2>
        <p className="text-[#64748B] mb-4">Could not load this question from the database.</p>
        <Link to="/questions" className="text-[#4F46E5] hover:underline font-bold">Back to Explorer</Link>
      </div>
    );
  }

  const currentStatus = progress?.status || 'NOT_STARTED';
  const busy = running || analyzing;

  return (
    <div className="p-6 lg:p-8 max-w-[1500px] mx-auto flex flex-col gap-6 pb-24 text-xs font-semibold text-[#0F172A]">
      <div className="flex items-center justify-between">
        <Link to="/questions" className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors">
          <ChevronLeft className="h-4 w-4 shrink-0" />
          <span>Explorer</span>
        </Link>
        <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
          <span>Status: <span className="font-bold text-[#0F172A]">{currentStatus}</span></span>
          {progress?.next_revision_at && (
            <span className="flex items-center gap-1 text-[#F59E0B] font-bold">
              <Calendar className="h-3.5 w-3.5" />
              Revise {new Date(progress.next_revision_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {errorMsg && <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">{errorMsg}</div>}
      {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-[#16A34A] rounded-lg">{successMsg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: problem, hints, notes */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl shadow-sm space-y-5">
            <QuestionHeader question={question} status={currentStatus} isFavorite={isFavorite} onFavorite={handleToggleFavorite} />
            <QuestionMetadata question={question} />
            <CompanyTags tags={question.companyTags} />
          </div>

          <ProblemStatement problem={problem} loading={problemLoading} onRegenerate={() => loadProblem(question.id, true)} />

          <HintCard key={question.id} hint={question.hint} onRequestHint={handleRequestHint} />

          <div className="grid grid-cols-3 gap-3">
            {question.videoSolutionUrl && (
              <a href={question.videoSolutionUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 p-2.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#475569]">
                <Video className="h-3.5 w-3.5 text-[#EF4444]" /> Video
              </a>
            )}
            {question.articleUrl && (
              <a href={question.articleUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 p-2.5 bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#475569]">
                <Compass className="h-3.5 w-3.5 text-[#22C55E]" /> Editorial
              </a>
            )}
          </div>

          <NotesCard value={notes} onChange={setNotes} onSave={handleAutosaveNotes} />
        </div>

        {/* RIGHT: editor, console, AI review, readiness */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <LanguageSelector value={language} onChange={handleLanguageChange} disabled={running} />
                <button
                  type="button"
                  onClick={handleResetCode}
                  disabled={!problem}
                  title="Reset to starter code"
                  className="p-2.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] rounded-lg text-[#64748B] disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={busy || problemLoading}
                  className="px-4 py-2.5 bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] disabled:opacity-60 text-[#0F172A] font-bold rounded-lg flex items-center gap-1.5"
                >
                  {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 text-[#16A34A]" />}
                  Run
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={busy || problemLoading}
                  className="px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => handleAnalyze(lastSubmissionId)}
                  disabled={busy}
                  className="px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-60 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {analyzing ? 'Reviewing...' : 'AI Review'}
                </button>
              </div>
            </div>

            <CodeEditor value={sourceCode} onChange={handleCodeChange} language={language} onRun={handleRun} />

            <div className="flex justify-between text-[10px] text-[#94A3B8]">
              <span>Code is saved in this browser per language. {language === 'java' && 'Java: keep the class named Main.'}</span>
              <button type="button" onClick={handleMarkSolved} className="hover:text-[#0F172A] font-bold">Mark solved manually</button>
            </div>
          </div>

          <ConsolePanel
            result={runResult}
            running={running}
            statusText={runStatus}
            customInput={customInput}
            onCustomInputChange={setCustomInput}
            useCustomInput={useCustomInput}
            onToggleCustomInput={setUseCustomInput}
          />

          {analyzing && (
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-[#64748B]">
                <Loader2 className="h-4 w-4 animate-spin text-[#4F46E5]" />
                <span>Gemini is reviewing your solution and preparing the optimal approach...</span>
              </div>
              <div className="h-20 bg-[#F1F5F9] rounded w-full animate-pulse" />
            </div>
          )}

          <AnalysisCard key={analysis?.id} analysis={analysis} onUseOptimal={(code) => handleCodeChange(code)} />

          <ReadinessPanel readiness={readiness} companyTags={question.companyTags} loading={readinessLoading} previous={previousReadiness} />

          {pastAnalyses.length > 0 && (
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-xl shadow-sm space-y-3">
              <div className="flex items-center gap-1.5 font-bold">
                <History className="h-4 w-4 text-[#4F46E5]" />
                <span>AI Review History</span>
              </div>
              <div className="flex flex-col gap-2">
                {pastAnalyses.slice(0, 5).map((hist) => (
                  <button
                    key={hist.id}
                    type="button"
                    onClick={() => setAnalysis(hist)}
                    className="text-left p-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-center text-[10px] text-[#64748B] font-mono">
                      <span>{new Date(hist.createdAt).toLocaleString()}</span>
                      <span className="font-bold text-[#4F46E5] uppercase">{hist.language}</span>
                    </div>
                    <div className="font-mono text-[#0F172A] font-bold">
                      Time: {hist.timeComplexity} | Space: {hist.spaceComplexity} | {hist.interviewFeedback?.rating}/10
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
