export const CATEGORY_LABELS = {
  technical_knowledge: 'Technical Knowledge',
  problem_solving: 'Problem Solving',
  communication: 'Communication',
  logical_thinking: 'Logical Thinking',
  accuracy: 'Accuracy',
  confidence: 'Confidence',
  optimization: 'Optimization',
  time_management: 'Time Management',
};

export const READINESS_LABELS = {
  not_ready: 'Not ready yet',
  needs_practice: 'Needs more practice',
  almost_ready: 'Almost ready',
  ready: 'Interview ready',
  strong: 'Strong candidate',
};

export const VERDICT_STYLES = {
  correct: { label: 'Correct', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  partially_correct: { label: 'Partially correct', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  incorrect: { label: 'Incorrect', className: 'bg-red-50 text-red-700 border-red-200' },
  incomplete: { label: 'Incomplete', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  not_answered: { label: 'Not answered', className: 'bg-slate-50 text-slate-500 border-slate-200' },
};

export const STATUS_LABELS = {
  in_progress: 'In progress',
  paused: 'Paused',
  evaluating: 'Preparing report',
  completed: 'Completed',
  failed: 'Report failed',
  abandoned: 'Not completed',
};

export const scoreColor = (score) => {
  if (score === null || score === undefined) return '#94A3B8';
  if (score >= 75) return '#16A34A';
  if (score >= 60) return '#4F46E5';
  if (score >= 40) return '#D97706';
  return '#DC2626';
};

export const formatClock = (totalSeconds) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '';

const VOICE_KEY = 'intervu-mock-interview-voice';
export const loadVoicePrefs = () => {
  try {
    return { micEnabled: false, readAloud: true, cameraEnabled: true, ...JSON.parse(localStorage.getItem(VOICE_KEY) || '{}') };
  } catch {
    return { micEnabled: false, readAloud: true, cameraEnabled: true };
  }
};
export const saveVoicePrefs = (prefs) => {
  try {
    localStorage.setItem(VOICE_KEY, JSON.stringify(prefs));
  } catch {
    // storage unavailable
  }
};
