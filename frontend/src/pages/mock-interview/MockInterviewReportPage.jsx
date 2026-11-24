import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RotateCcw, ChevronDown, ChevronRight, Building2, BookOpen, Map, MessageSquare, Video } from 'lucide-react';
import { mockInterviewService } from '../../services/mockInterview.service';
import ErrorBanner from '../../components/ErrorBanner';
import ScoreRing from '../../components/mock-interview/ScoreRing';
import ScoreBreakdown from '../../components/mock-interview/ScoreBreakdown';
import InterviewMessage from '../../components/mock-interview/InterviewMessage';
import { READINESS_LABELS, VERDICT_STYLES, scoreColor, formatDate } from '../../components/mock-interview/constants';

const Card = ({ title, icon: Icon, children, className = '' }) => (
  <section className={`bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm ${className}`}>
    {title && (
      <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
        {Icon && <Icon className="h-4 w-4 text-[#64748B]" />}
        {title}
      </h2>
    )}
    {children}
  </section>
);

const AnswerReview = ({ review, highlight }) => {
  const [open, setOpen] = useState(false);
  const verdict = VERDICT_STYLES[review.verdict] || VERDICT_STYLES.incomplete;
  return (
    <div className="border border-[#F1F5F9] rounded-lg">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[#F8FAFC]"
        aria-expanded={open}
      >
        {open ? <ChevronDown className="h-4 w-4 mt-0.5 text-[#64748B]" /> : <ChevronRight className="h-4 w-4 mt-0.5 text-[#64748B]" />}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-[#64748B]">Q{review.questionNumber}</span>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${verdict.className}`}>{verdict.label}</span>
            {highlight && <span className="text-[10px] font-semibold text-[#64748B]">{highlight}</span>}
          </div>
          <div className="text-[13px] font-semibold text-[#0F172A] mt-1">{review.question}</div>
        </div>
        <span className="font-mono text-[12px] font-bold" style={{ color: scoreColor(review.score) }}>
          {review.score}
        </span>
      </button>
      {open && (
        <div className="px-11 pb-4 space-y-3 text-[12px] leading-relaxed text-[#475569]">
          {review.evidence && (
            <div>
              <div className="font-semibold text-[#0F172A] mb-0.5">What you said</div>
              <p>{review.evidence}</p>
            </div>
          )}
          {review.suggestedAnswer && (
            <div>
              <div className="font-semibold text-[#0F172A] mb-0.5">A stronger answer</div>
              <p className="whitespace-pre-wrap">{review.suggestedAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MockInterviewReportPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const load = useCallback(async () => {
    try {
      const status = await mockInterviewService.getStatus(id);
      if (!status.evaluation) {
        setData({ status: status.interview.status === 'abandoned' ? 'none' : 'pending', interview: status.interview });
        return 'done';
      }
      if (status.evaluation.status === 'completed') {
        setData(await mockInterviewService.getReport(id));
        return 'done';
      }
      setData({ status: status.evaluation.status, errorMessage: status.evaluation.errorMessage, interview: status.interview });
      return status.evaluation.status === 'failed' ? 'done' : 'poll';
    } catch (err) {
      setError(err.status === 404 || err.status === 403 ? 'Interview not found.' : err.message);
      return 'done';
    }
  }, [id]);

  useEffect(() => {
    let timer;
    let cancelled = false;
    const run = async () => {
      const next = await load();
      if (!cancelled && next === 'poll') timer = setTimeout(run, 3000);
    };
    run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [load]);

  const retry = async () => {
    setRetrying(true);
    try {
      await mockInterviewService.retryEvaluation(id);
      setData((d) => ({ ...d, status: 'pending', errorMessage: null }));
      const poll = async () => {
        if ((await load()) === 'poll') setTimeout(poll, 3000);
      };
      poll();
    } catch (err) {
      setError(err.message);
    } finally {
      setRetrying(false);
    }
  };

  const back = (
    <Link to="/mock-interview" className="inline-flex items-center gap-1 text-[12px] text-[#64748B] hover:text-[#4F46E5] mb-4">
      <ArrowLeft className="h-3.5 w-3.5" /> Mock Interview
    </Link>
  );

  if (error) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        {back}
        <ErrorBanner message={error} />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="p-8 flex items-center justify-center text-[#64748B] text-xs gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading report...
      </div>
    );
  }

  if (data.status === 'none') {
    return (
      <div className="p-8 max-w-3xl mx-auto text-[#0F172A]">
        {back}
        <Card>
          <p className="text-[13px] text-[#475569]">
            This interview ended before any answers were given, so there is no report.
          </p>
          <Link to="/mock-interview/new" className="inline-flex mt-4 h-9 px-4 rounded-lg bg-[#4F46E5] text-white text-[12px] font-semibold items-center gap-1.5">
            <Video className="h-3.5 w-3.5" /> Start a new interview
          </Link>
        </Card>
      </div>
    );
  }

  if (data.status !== 'completed') {
    const failed = data.status === 'failed';
    return (
      <div className="p-8 max-w-3xl mx-auto text-[#0F172A]">
        {back}
        <Card>
          {failed ? (
            <div className="space-y-3">
              <ErrorBanner message={data.errorMessage || 'The report could not be generated.'} />
              <p className="text-[12px] text-[#475569]">Your answers are saved. You can try generating the report again.</p>
              <button
                type="button"
                onClick={retry}
                disabled={retrying}
                className="h-9 px-4 rounded-lg bg-[#4F46E5] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Retry report
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#4F46E5]" />
              <div>
                <div className="text-[13px] font-bold">Preparing your report</div>
                <div className="text-[12px] text-[#64748B]">
                  The AI is reviewing your whole interview. This usually takes under a minute.
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  const { report, interview, company, recommendedQuestions, transcript } = data;
  const highlightFor = (n) =>
    report.strongestAnswers?.includes(n) ? 'Strongest answer' : report.weakestAnswers?.includes(n) ? 'Needs work' : null;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-[#0F172A]">
      {back}

      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 md:items-center">
        <div className="shrink-0 self-center">
          <ScoreRing score={report.overallScore} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight">Interview report</h1>
            <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-[11px] font-semibold text-[#4F46E5]">
              {READINESS_LABELS[report.readinessLevel] || report.readinessLevel}
            </span>
          </div>
          <p className="text-[12px] text-[#64748B]">
            {interview.interviewTypeLabel}
            {interview.companyName ? ` · ${interview.companyName}` : ''} · {interview.jobRole} · {interview.experienceLevel} ·{' '}
            {formatDate(interview.completedAt || report.completedAt)}
          </p>
          <p className="text-[13px] leading-relaxed text-[#334155]">{report.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Category scores" className="lg:col-span-2">
          <ScoreBreakdown categories={report.categories} detailed />
        </Card>

        <div className="space-y-6">
          <Card title="Interview readiness">
            <p className="text-[12px] leading-relaxed text-[#475569]">{report.readinessAssessment}</p>
          </Card>

          {company && (
            <Card title={`${company.name} preparation`} icon={Building2}>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#F1F5F9] rounded-lg p-3">
                  <div className="text-[10px] text-[#64748B] font-semibold">Mock interview score</div>
                  <div className="text-xl font-extrabold font-mono" style={{ color: scoreColor(company.mockInterviewScore) }}>
                    {company.mockInterviewScore ?? '-'}
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    Last {Math.min(3, company.mockInterviews)} interview{company.mockInterviews === 1 ? '' : 's'}
                  </div>
                </div>
                <div className="border border-[#F1F5F9] rounded-lg p-3">
                  <div className="text-[10px] text-[#64748B] font-semibold">Practice readiness</div>
                  <div className="text-xl font-extrabold font-mono" style={{ color: scoreColor(company.practiceReadiness) }}>
                    {company.hasReadiness ? (company.practiceReadiness ?? '-') : 'N/A'}
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    {company.hasReadiness && company.practiceReadiness === null
                      ? 'Open Companies to calculate'
                      : 'From solved questions'}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#64748B] mt-3 leading-relaxed">
                The mock interview score reflects how you performed when interviewed. Practice readiness comes from the
                questions you have solved and is calculated separately.
              </p>
              {company.hasReadiness && (
                <Link to="/company" className="text-[11px] font-semibold text-[#4F46E5] mt-2 inline-block">
                  Open company preparation
                </Link>
              )}
            </Card>
          )}

          <Card title="Communication" icon={MessageSquare}>
            <p className="text-[12px] leading-relaxed text-[#475569]">{report.communicationFeedback}</p>
          </Card>
        </div>
      </div>

      <Card title="Answer by answer">
        <div className="space-y-2">
          {(report.answerReviews || []).map((r) => (
            <AnswerReview key={`${r.questionNumber}-${r.question}`} review={r} highlight={highlightFor(r.questionNumber)} />
          ))}
          {!report.answerReviews?.length && <p className="text-[12px] text-[#64748B]">No answers to review.</p>}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Missed concepts and revision topics" icon={BookOpen}>
          {report.missedConcepts?.length > 0 && (
            <ul className="list-disc pl-5 text-[12px] text-[#475569] space-y-1 mb-3">
              {report.missedConcepts.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            {(report.revisionTopics || []).map((t) => (
              <span key={t} className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[11px] font-semibold text-[#334155]">
                {t}
              </span>
            ))}
          </div>
          {recommendedQuestions?.length > 0 && (
            <div className="mt-4">
              <div className="text-[12px] font-bold mb-2">Recommended practice from the question bank</div>
              <ul className="space-y-1.5">
                {recommendedQuestions.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-2 text-[12px]">
                    <Link to={`/workspace/${q.slug || q.id}`} className="font-semibold text-[#0F172A] hover:text-[#4F46E5] truncate">
                      {q.title}
                    </Link>
                    <span className="text-[10px] text-[#64748B] shrink-0 capitalize">
                      {q.difficulty} · {q.topic}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card title="Improvement roadmap" icon={Map}>
          <ol className="space-y-4">
            {(report.roadmap || []).map((step, i) => (
              <li key={`${step.title}-${i}`} className="flex gap-3">
                <span className="h-6 w-6 shrink-0 rounded-full bg-indigo-50 border border-indigo-200 text-[#4F46E5] text-[11px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="text-[12px]">
                  <div className="font-bold text-[#0F172A]">
                    {step.title} {step.timeframe && <span className="font-normal text-[#64748B]">· {step.timeframe}</span>}
                  </div>
                  <ul className="list-disc pl-4 text-[#475569] mt-1 space-y-0.5">
                    {step.actions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card>
        <button
          type="button"
          onClick={() => setShowTranscript((s) => !s)}
          className="text-sm font-bold flex items-center gap-1.5"
          aria-expanded={showTranscript}
        >
          {showTranscript ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          Full transcript ({transcript.length} messages)
        </button>
        {showTranscript && (
          <div className="space-y-5 mt-4">
            {transcript.map((m) => (
              <InterviewMessage key={m.id} message={m} />
            ))}
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Link
          to="/mock-interview/new"
          className="h-10 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold inline-flex items-center gap-2"
        >
          <Video className="h-4 w-4" /> Start another interview
        </Link>
      </div>
    </div>
  );
};

export default MockInterviewReportPage;
