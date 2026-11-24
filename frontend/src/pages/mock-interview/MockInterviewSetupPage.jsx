import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Video, Mic, Volume2, ShieldCheck } from 'lucide-react';
import { mockInterviewService } from '../../services/mockInterview.service';
import { useCamera } from '../../hooks/useCamera';
import { useSpeechSynthesis } from '../../hooks/useSpeech';
import ErrorBanner from '../../components/ErrorBanner';
import CameraPreview from '../../components/mock-interview/CameraPreview';
import { loadVoicePrefs, saveVoicePrefs } from '../../components/mock-interview/constants';

const LANGUAGE_LABELS = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  javascript: 'JavaScript',
  go: 'Go',
  csharp: 'C#',
};

const Segmented = ({ options, value, onChange, format = (v) => v, capitalize = true }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={`h-9 px-3 rounded-lg border text-[12px] font-semibold transition-colors ${capitalize ? 'capitalize' : ''} ${
          value === opt
            ? 'bg-indigo-50 border-indigo-200 text-[#4F46E5]'
            : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
        }`}
      >
        {format(opt)}
      </button>
    ))}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div className="space-y-2">
    <div>
      <div className="text-[12px] font-bold text-[#0F172A]">{label}</div>
      {hint && <div className="text-[11px] text-[#64748B]">{hint}</div>}
    </div>
    {children}
  </div>
);

const selectClass =
  'w-full h-10 rounded-lg border border-[#E2E8F0] bg-white px-3 text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5]';

const MockInterviewSetupPage = () => {
  const navigate = useNavigate();
  const camera = useCamera();
  const tts = useSpeechSynthesis();
  const sttSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const [options, setOptions] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [prefs, setPrefs] = useState(loadVoicePrefs);

  const [form, setForm] = useState({
    interviewType: 'dsa',
    companyName: '',
    jobRole: 'Software Development Engineer',
    experienceLevel: 'beginner',
    durationMinutes: 30,
    difficulty: 'adaptive',
    mode: 'realistic',
    questionCount: 6,
    programmingLanguage: '',
    includeProjectQuestions: false,
    candidateContext: '',
  });
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    mockInterviewService
      .getOptions()
      .then(setOptions)
      .catch((err) => setLoadError(err.message || 'Could not load interview options.'));
    mockInterviewService
      .getActive()
      .then((a) => a && setActiveId(a.id))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (prefs.cameraEnabled) camera.start();
    else camera.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.cameraEnabled]);

  useEffect(() => saveVoicePrefs(prefs), [prefs]);

  const typeInfo = useMemo(
    () => options?.interviewTypes.find((t) => t.key === form.interviewType),
    [options, form.interviewType]
  );

  const onDurationChange = (minutes) => {
    setForm((f) => ({ ...f, durationMinutes: minutes, questionCount: options?.defaultQuestions?.[minutes] || f.questionCount }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    if (typeInfo?.requiresLanguage && !form.programmingLanguage) {
      setError('Choose a programming language for this interview type.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        companyName: form.companyName || null,
        programmingLanguage: typeInfo?.usesLanguage && form.programmingLanguage ? form.programmingLanguage : null,
        candidateContext: form.candidateContext.trim() || null,
        questionCount: Number(form.questionCount) || null,
      };
      const data = await mockInterviewService.create(payload);
      camera.stop();
      navigate(`/mock-interview/${data.interview.id}`, { state: { fresh: true } });
    } catch (err) {
      if (err.code === 'INTERVIEW_ACTIVE') setActiveId(err.details?.activeInterviewId || activeId);
      setError(
        err.details && Array.isArray(err.details)
          ? err.details.map((d) => d.message).join(' ')
          : err.message || 'Could not start the interview.'
      );
      setSubmitting(false);
    }
  };

  const endActive = async () => {
    try {
      await mockInterviewService.end(activeId);
      setActiveId(null);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loadError) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <ErrorBanner message={loadError} />
      </div>
    );
  }
  if (!options) {
    return (
      <div className="p-8 flex items-center justify-center text-[#64748B] text-xs gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto text-[#0F172A]">
      <Link to="/mock-interview" className="inline-flex items-center gap-1 text-[12px] text-[#64748B] hover:text-[#4F46E5] mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Mock Interview
      </Link>
      <h1 className="text-2xl font-extrabold tracking-tight">Set up your interview</h1>
      <p className="text-xs text-[#64748B] mt-1 mb-6">
        The interviewer adapts its questions to your answers, the company and the role you choose.
      </p>

      {activeId && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>You already have an interview in progress. Resume it, or end it to start a new one.</span>
          <div className="flex gap-2">
            <Link
              to={`/mock-interview/${activeId}`}
              className="h-8 px-3 rounded-lg bg-[#4F46E5] text-white font-semibold inline-flex items-center"
            >
              Resume
            </Link>
            <button type="button" onClick={endActive} className="h-8 px-3 rounded-lg border border-amber-200 bg-white font-semibold">
              End it
            </button>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
          <Field label="Interview type">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.interviewTypes.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => set('interviewType', t.key)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-[12px] font-semibold transition-colors ${
                    form.interviewType === t.key
                      ? 'bg-indigo-50 border-indigo-200 text-[#4F46E5]'
                      : 'bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Company" hint="Questions follow publicly known interview styles.">
              <select value={form.companyName} onChange={(e) => set('companyName', e.target.value)} className={selectClass}>
                <option value="">No specific company</option>
                {options.companies.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Job role">
              <select value={form.jobRole} onChange={(e) => set('jobRole', e.target.value)} className={selectClass}>
                {options.jobRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Experience level">
            <Segmented options={options.experienceLevels} value={form.experienceLevel} onChange={(v) => set('experienceLevel', v)} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Duration">
              <Segmented options={options.durations} value={form.durationMinutes} onChange={onDurationChange} format={(v) => `${v} min`} capitalize={false} />
            </Field>
            <Field label="Number of questions" hint="Main questions. Follow-ups are extra.">
              <input
                type="number"
                min={3}
                max={20}
                value={form.questionCount}
                onChange={(e) => set('questionCount', e.target.value)}
                className={selectClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Difficulty" hint="Adaptive adjusts to how you answer.">
              <Segmented options={options.difficulties} value={form.difficulty} onChange={(v) => set('difficulty', v)} />
            </Field>
            <Field label="Mode" hint={form.mode === 'practice' ? 'Brief feedback after each answer.' : 'No feedback until the report.'}>
              <Segmented options={options.modes} value={form.mode} onChange={(v) => set('mode', v)} />
            </Field>
          </div>

          {typeInfo?.usesLanguage && (
            <Field label={`Programming language${typeInfo.requiresLanguage ? '' : ' (optional)'}`}>
              <select
                value={form.programmingLanguage}
                onChange={(e) => set('programmingLanguage', e.target.value)}
                className={selectClass}
              >
                <option value="">{typeInfo.requiresLanguage ? 'Choose a language' : 'Any language'}</option>
                {Object.entries(LANGUAGE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <label className="flex items-center gap-2 text-[12px] font-semibold text-[#334155] cursor-pointer">
            <input
              type="checkbox"
              checked={form.includeProjectQuestions}
              onChange={(e) => set('includeProjectQuestions', e.target.checked)}
              className="h-4 w-4 accent-[#4F46E5]"
            />
            Include questions about my projects
          </label>

          <Field
            label="Resume or project notes (optional)"
            hint="Paste a short summary to personalise the questions. Leave out phone numbers and addresses. It is stored only with this interview and deleted with it."
          >
            <textarea
              value={form.candidateContext}
              onChange={(e) => set('candidateContext', e.target.value.slice(0, 6000))}
              rows={4}
              placeholder="For example: Final-year CSE student. Built a MERN expense tracker with JWT auth and Redis caching..."
              className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5] resize-y"
            />
            <div className="text-right text-[10px] text-[#64748B] font-mono">{form.candidateContext.length}/6000</div>
          </Field>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold">Camera and voice check</h2>
            <CameraPreview
              camera={camera}
              enabled={prefs.cameraEnabled}
              onToggle={() => setPrefs((p) => ({ ...p, cameraEnabled: !p.cameraEnabled }))}
            />
            <div className="space-y-2 text-[12px]">
              <label className={`flex items-center gap-2 ${sttSupported ? 'cursor-pointer' : 'opacity-60'}`}>
                <input
                  type="checkbox"
                  disabled={!sttSupported}
                  checked={prefs.micEnabled && sttSupported}
                  onChange={(e) => setPrefs((p) => ({ ...p, micEnabled: e.target.checked }))}
                  className="h-4 w-4 accent-[#4F46E5]"
                />
                <Mic className="h-3.5 w-3.5 text-[#64748B]" /> Answer by voice
              </label>
              {!sttSupported && <p className="text-[11px] text-[#64748B] pl-6">Voice input needs Chrome or Edge. You can type instead.</p>}
              <label className={`flex items-center gap-2 ${tts.supported ? 'cursor-pointer' : 'opacity-60'}`}>
                <input
                  type="checkbox"
                  disabled={!tts.supported}
                  checked={prefs.readAloud && tts.supported}
                  onChange={(e) => setPrefs((p) => ({ ...p, readAloud: e.target.checked }))}
                  className="h-4 w-4 accent-[#4F46E5]"
                />
                <Volume2 className="h-3.5 w-3.5 text-[#64748B]" /> Read the interviewer's questions aloud
              </label>
              {tts.supported && (
                <button
                  type="button"
                  onClick={() => tts.speak('Hello. This is how your interviewer will sound.')}
                  className="text-[11px] text-[#4F46E5] font-semibold pl-6"
                >
                  Test speaker
                </button>
              )}
            </div>
            <p className="flex gap-1.5 text-[11px] text-[#64748B] leading-relaxed">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              Your video is a local preview only. It is never recorded or uploaded. Voice answers are turned into text by
              your browser, and only the text is saved.
            </p>
          </div>

          <ErrorBanner message={error} />

          <button
            type="submit"
            disabled={submitting || Boolean(activeId)}
            className="w-full h-11 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing your interviewer...
              </>
            ) : (
              <>
                <Video className="h-4 w-4" /> Start interview
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MockInterviewSetupPage;
