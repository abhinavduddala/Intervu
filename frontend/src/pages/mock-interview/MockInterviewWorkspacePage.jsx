import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Loader2, RotateCcw, Pause, AlertTriangle } from 'lucide-react';
import { mockInterviewService, newClientMessageId } from '../../services/mockInterview.service';
import { useCamera } from '../../hooks/useCamera';
import { useSpeechSynthesis } from '../../hooks/useSpeech';
import ErrorBanner from '../../components/ErrorBanner';
import InterviewChat from '../../components/mock-interview/InterviewChat';
import AnswerComposer from '../../components/mock-interview/AnswerComposer';
import InterviewSidebar from '../../components/mock-interview/InterviewSidebar';
import { loadVoicePrefs, saveVoicePrefs } from '../../components/mock-interview/constants';

const TIME_UP_GRACE_SECONDS = 60;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isActive = (interview) => interview && ['in_progress', 'paused'].includes(interview.status);

const MockInterviewWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const camera = useCamera();
  const tts = useSpeechSynthesis();
  const sttSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const [interview, setInterview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [draft, setDraft] = useState('');
  const [draftIsVoice, setDraftIsVoice] = useState(false);
  const [pending, setPending] = useState(null); // { answer, clientMessageId, inputMode }
  const [waiting, setWaiting] = useState(false);
  const [turnError, setTurnError] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [prefs, setPrefs] = useState(loadVoicePrefs);
  const [ended, setEnded] = useState(false);

  const deadlineRef = useRef(null);
  const timeUpHandledRef = useRef(false);
  const submittingRef = useRef(false);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const applyInterview = useCallback((next) => {
    setInterview(next);
    deadlineRef.current = Date.now() + next.remainingSeconds * 1000;
    setRemaining(next.remainingSeconds);
  }, []);

  const speakIfEnabled = useCallback(
    (text) => {
      if (prefsRef.current.readAloud && tts.supported) tts.speak(text);
    },
    [tts]
  );

  const goToReport = useCallback(() => navigate(`/mock-interview/${id}/report`, { replace: true }), [navigate, id]);

  // Wait out a turn that is still being processed (for example after a page reload)
  const waitForTurn = useCallback(async () => {
    setWaiting(true);
    for (let i = 0; i < 60; i += 1) {
      await sleep(3000);
      try {
        const { interview: status } = await mockInterviewService.getStatus(id);
        if (status.turnState !== 'processing') break;
      } catch {
        // keep waiting through brief network errors
      }
    }
    const data = await mockInterviewService.get(id);
    setWaiting(false);
    return data;
  }, [id]);

  const hydrate = useCallback(
    (data) => {
      applyInterview(data.interview);
      setMessages(data.messages);
      if (!isActive(data.interview)) {
        goToReport();
        return;
      }
      // An answer whose reply failed earlier is offered for retry
      const last = data.messages[data.messages.length - 1];
      if (data.interview.turnState === 'reply_failed' && last?.sender === 'candidate') {
        setTurnError({
          message: 'The interviewer did not respond to your last answer. Retry to continue.',
          retry: { answer: last.message, clientMessageId: last.clientMessageId, inputMode: last.inputMode, saved: true },
        });
      }
    },
    [applyInterview, goToReport]
  );

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let data = await mockInterviewService.get(id);
        if (data.interview.turnState === 'processing') data = await waitForTurn();
        if (cancelled) return;
        hydrate(data);
        const lastInterviewer = [...data.messages].reverse().find((m) => m.sender === 'interviewer');
        if (location.state?.fresh && lastInterviewer) speakIfEnabled(lastInterviewer.message);
      } catch (err) {
        if (!cancelled) setLoadError(err.status === 404 || err.status === 403 ? 'Interview not found.' : err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Camera on/off
  useEffect(() => {
    if (prefs.cameraEnabled) camera.start();
    else camera.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.cameraEnabled]);

  useEffect(() => saveVoicePrefs(prefs), [prefs]);
  useEffect(() => {
    if (!prefs.readAloud) tts.cancel();
  }, [prefs.readAloud, tts]);

  const endInterview = useCallback(
    async (reason = 'user_ended') => {
      setActionBusy(true);
      tts.cancel();
      try {
        await mockInterviewService.end(id, reason);
        camera.stop();
        goToReport();
      } catch (err) {
        setTurnError({ message: err.message || 'Could not end the interview. Please try again.' });
        setActionBusy(false);
      }
    },
    [id, camera, goToReport, tts]
  );

  // Countdown from the server's deadline; frozen while paused
  useEffect(() => {
    if (!interview || !isActive(interview)) return undefined;
    if (interview.status === 'paused') {
      setRemaining(interview.remainingSeconds);
      return undefined;
    }
    const tick = () => {
      const left = Math.round((deadlineRef.current - Date.now()) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= -TIME_UP_GRACE_SECONDS && !timeUpHandledRef.current && !submittingRef.current) {
        timeUpHandledRef.current = true;
        endInterview('time_up');
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [interview, endInterview]);

  const sendAnswer = async (attempt) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setTurnError(null);
    setWaiting(true);
    tts.cancel();
    if (!attempt.saved) setPending(attempt);
    if (attempt.fromDraft) {
      setDraft('');
      setDraftIsVoice(false);
    }

    try {
      const result = await mockInterviewService.answer(id, attempt);
      setMessages((prev) => {
        const next = attempt.saved
          ? prev
          : [
              ...prev,
              {
                id: `local-${attempt.clientMessageId}`,
                sender: 'candidate',
                message: attempt.answer,
                inputMode: attempt.inputMode,
              },
            ];
        return next.some((m) => m.id === result.reply.id) ? next : [...next, result.reply];
      });
      setPending(null);
      applyInterview(result.interview);
      speakIfEnabled(result.reply.message);
      if (!isActive(result.interview)) {
        setEnded(true);
        camera.stop();
      }
    } catch (err) {
      if (err.code === 'TURN_IN_PROGRESS') {
        hydrate(await waitForTurn());
        setPending(null);
      } else if (err.code === 'REPLY_PENDING') {
        const data = await mockInterviewService.get(id);
        setPending(null);
        hydrate(data);
      } else if (err.status === 409) {
        // Paused or ended elsewhere
        setPending(null);
        setDraft(attempt.answer);
        const data = await mockInterviewService.get(id);
        hydrate(data);
        setTurnError({ message: err.message });
      } else {
        setTurnError({
          message:
            err.status >= 500 || err.code === 'SERVER_ERROR'
              ? `${err.message} Your answer is safe.`
              : err.message || 'Something went wrong.',
          retry: attempt,
        });
      }
    } finally {
      submittingRef.current = false;
      setWaiting(false);
    }
  };

  const submitDraft = () => {
    const answer = draft.trim();
    if (!answer || waiting) return;
    sendAnswer({ answer, clientMessageId: newClientMessageId(), inputMode: draftIsVoice ? 'voice' : 'text', fromDraft: true });
  };

  const togglePref = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const pause = async () => {
    setActionBusy(true);
    tts.cancel();
    try {
      applyInterview(await mockInterviewService.pause(id));
    } catch (err) {
      setTurnError({ message: err.message });
    } finally {
      setActionBusy(false);
    }
  };

  const resume = async () => {
    setActionBusy(true);
    try {
      applyInterview(await mockInterviewService.resume(id));
    } catch (err) {
      setTurnError({ message: err.message });
    } finally {
      setActionBusy(false);
    }
  };

  const confirmEnd = () => {
    if (window.confirm('End the interview now? Your report will be based on the answers so far.')) endInterview('user_ended');
  };

  if (loadError) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <ErrorBanner message={loadError} />
      </div>
    );
  }
  if (!interview) {
    return (
      <div className="p-8 flex items-center justify-center text-[#64748B] text-xs gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading interview...
      </div>
    );
  }

  const paused = interview.status === 'paused';
  const timeUp = remaining <= 0 && isActive(interview);
  const composerLocked = waiting || paused || ended || Boolean(turnError?.retry) || actionBusy;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] text-[#0F172A]">
      <section className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#F8FAFC]">
        <header className="px-4 sm:px-6 py-3 border-b border-[#E2E8F0] bg-white flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-sm font-bold truncate">
              {interview.interviewTypeLabel}
              {interview.companyName ? ` · ${interview.companyName}` : ''}
            </h1>
            <p className="text-[11px] text-[#64748B] truncate">
              {interview.jobRole} · {interview.currentSection || 'Interview'}
            </p>
          </div>
          {tts.speaking && (
            <button type="button" onClick={tts.cancel} className="text-[11px] font-semibold text-[#4F46E5] shrink-0">
              Stop speaking
            </button>
          )}
        </header>

        <InterviewChat
          messages={messages}
          pendingAnswer={pending}
          waiting={waiting}
          onSpeak={tts.supported ? (text) => tts.speak(text) : undefined}
        />

        <div className="px-4 sm:px-6 space-y-2">
          {paused && (
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-[12px] text-[#334155] flex items-center gap-2">
              <Pause className="h-3.5 w-3.5 text-[#4F46E5]" /> The interview is paused and the clock is stopped. Resume when
              you are ready.
            </div>
          )}
          {timeUp && !ended && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[12px] text-amber-800 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" /> Time is up. Send a final answer or finish now.
              </span>
              <button type="button" onClick={() => endInterview('time_up')} className="font-semibold underline">
                Finish interview
              </button>
            </div>
          )}
          {turnError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-700 flex items-center justify-between gap-3">
              <span>{turnError.message}</span>
              {turnError.retry && (
                <button
                  type="button"
                  onClick={() => sendAnswer(turnError.retry)}
                  disabled={waiting}
                  className="shrink-0 inline-flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Retry
                </button>
              )}
            </div>
          )}
          {ended && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-700 flex items-center justify-between gap-3">
              <span>The interview is complete. Your report is being prepared.</span>
              <button type="button" onClick={goToReport} className="font-semibold underline shrink-0">
                View report
              </button>
            </div>
          )}
        </div>

        {!ended && (
          <AnswerComposer
            value={draft}
            onChange={setDraft}
            onSubmit={submitDraft}
            disabled={composerLocked}
            submitting={waiting}
            micEnabled={prefs.micEnabled}
            suspendMic={tts.speaking}
            onVoiceUsed={() => setDraftIsVoice(true)}
          />
        )}
      </section>

      <InterviewSidebar
        interview={interview}
        remaining={remaining}
        camera={camera}
        prefs={prefs}
        onTogglePref={togglePref}
        ttsSupported={tts.supported}
        sttSupported={sttSupported}
        onPause={pause}
        onResume={resume}
        onEnd={confirmEnd}
        busy={actionBusy || waiting || ended}
        ended={ended}
      />
    </div>
  );
};

export default MockInterviewWorkspacePage;
