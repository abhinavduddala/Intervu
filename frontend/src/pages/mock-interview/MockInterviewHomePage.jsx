import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Play, Loader2, Award, ListChecks, TrendingUp } from 'lucide-react';
import { mockInterviewService } from '../../services/mockInterview.service';
import ErrorBanner from '../../components/ErrorBanner';
import ScoreTrendChart from '../../components/mock-interview/ScoreTrendChart';
import ScoreBreakdown from '../../components/mock-interview/ScoreBreakdown';
import InterviewHistoryTable from '../../components/mock-interview/InterviewHistoryTable';
import { CATEGORY_LABELS, scoreColor, formatClock } from '../../components/mock-interview/constants';

const PAGE_SIZE = 10;

const Stat = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B]">
      <Icon className="h-3.5 w-3.5" /> {label}
    </div>
    <div className="text-2xl font-extrabold mt-1 font-mono" style={color ? { color } : undefined}>
      {value}
    </div>
  </div>
);

const MockInterviewHomePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState({ interviews: [], pagination: { page: 1, totalPages: 1 } });
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setError('');
      const [a, s, h] = await Promise.all([
        mockInterviewService.getActive(),
        mockInterviewService.getStats(),
        mockInterviewService.list({ page, limit: PAGE_SIZE }),
      ]);
      setActive(a);
      setStats(s);
      setHistory(h);
    } catch (err) {
      setError(err.message || 'Could not load your interviews.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (interview) => {
    if (!window.confirm('Delete this interview and its report? This cannot be undone.')) return;
    try {
      setDeletingId(interview.id);
      await mockInterviewService.remove(interview.id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-[#64748B] text-xs gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading interviews...
      </div>
    );
  }

  const categories = stats?.categories
    ? Object.keys(CATEGORY_LABELS).map((key) => ({ key, score: stats.categories[key], applicable: stats.categories[key] !== null }))
    : null;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-[#0F172A]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Mock Interview</h1>
          <p className="text-xs text-[#64748B] mt-1">
            Practise a realistic interview with an AI interviewer and get a detailed report.
          </p>
        </div>
        {!active && (
          <Link
            to="/mock-interview/new"
            className="h-10 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold inline-flex items-center gap-2"
          >
            <Video className="h-4 w-4" /> Start new interview
          </Link>
        )}
      </div>

      <ErrorBanner message={error} />

      {active && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[13px]">
            <div className="font-bold text-[#0F172A]">You have an interview in progress</div>
            <div className="text-[#475569] text-[12px] mt-0.5">
              {active.interviewTypeLabel}
              {active.companyName ? ` · ${active.companyName}` : ''} · {formatClock(active.remainingSeconds)} left
              {active.status === 'paused' ? ' (paused)' : ''}
            </div>
          </div>
          <Link
            to={`/mock-interview/${active.id}`}
            className="h-9 px-4 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Play className="h-3.5 w-3.5" /> Resume
          </Link>
        </div>
      )}

      {/* Performance overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={ListChecks} label="Interviews" value={stats?.totals.total ?? 0} />
        <Stat icon={ListChecks} label="Completed" value={stats?.totals.completed ?? 0} />
        <Stat
          icon={TrendingUp}
          label="Average score"
          value={stats?.totals.averageScore ?? '-'}
          color={scoreColor(stats?.totals.averageScore)}
        />
        <Stat icon={Award} label="Best score" value={stats?.totals.bestScore ?? '-'} color={scoreColor(stats?.totals.bestScore)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold mb-3">Score trend</h2>
          <ScoreTrendChart trend={stats?.trend} />
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold mb-3">Average by category</h2>
          {categories ? (
            <ScoreBreakdown categories={categories} />
          ) : (
            <p className="text-[12px] text-[#64748B] py-10 text-center">No completed interviews yet.</p>
          )}
        </div>
      </div>

      {stats?.companies?.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold">Mock interview score by company</h2>
          <p className="text-[11px] text-[#64748B] mt-0.5 mb-3">
            Average of your last three interviews for each company. This is separate from your practice readiness on the
            Companies page.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.companies.map((c) => (
              <div key={c.companyName} className="border border-[#F1F5F9] rounded-lg p-3">
                <div className="text-[12px] font-semibold">{c.companyName}</div>
                <div className="text-xl font-extrabold font-mono" style={{ color: scoreColor(c.mockInterviewScore) }}>
                  {c.mockInterviewScore}
                </div>
                <div className="text-[10px] text-[#64748B]">
                  {c.interviews} interview{c.interviews === 1 ? '' : 's'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold mb-3">Previous interviews and reports</h2>
        <InterviewHistoryTable interviews={history.interviews} onDelete={handleDelete} deletingId={deletingId} />
        {history.pagination.totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 pt-3 text-[12px]">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 h-8 rounded border border-[#E2E8F0] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-[#64748B]">
              Page {page} of {history.pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= history.pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 h-8 rounded border border-[#E2E8F0] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterviewHomePage;
