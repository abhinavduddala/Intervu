import React from 'react';
import { Clock, Pause, Play, Square, Volume2, VolumeX, Mic, MicOff, CheckCircle2, Circle } from 'lucide-react';
import CameraPreview from './CameraPreview';
import { formatClock } from './constants';

const Toggle = ({ on, onClick, iconOn: IconOn, iconOff: IconOff, label, disabled, hint }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={hint}
    className={`flex-1 h-9 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 ${
      on ? 'bg-indigo-50 border-indigo-200 text-[#4F46E5]' : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
    }`}
  >
    {on ? <IconOn className="h-3.5 w-3.5" /> : <IconOff className="h-3.5 w-3.5" />}
    {label}
  </button>
);

const InterviewSidebar = ({
  interview,
  remaining,
  camera,
  prefs,
  onTogglePref,
  ttsSupported,
  sttSupported,
  onPause,
  onResume,
  onEnd,
  busy,
  ended = false,
}) => {
  const paused = interview.status === 'paused';
  const total = interview.durationMinutes * 60;
  const lowTime = remaining <= 120;
  const progress = Math.min(100, Math.round((Math.min(interview.questionsAsked, interview.questionTarget) / interview.questionTarget) * 100));
  const currentIndex = interview.sections.indexOf(interview.currentSection);

  return (
    <aside className="w-full lg:w-80 shrink-0 max-h-[45vh] lg:max-h-none border-t lg:border-t-0 lg:border-l border-[#E2E8F0] bg-white overflow-y-auto">
      <div className="p-4 space-y-5">
        <CameraPreview camera={camera} enabled={prefs.cameraEnabled} onToggle={() => onTogglePref('cameraEnabled')} compact stopped={ended} />

        {/* Timer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B]">
              <Clock className="h-3.5 w-3.5" /> {paused ? 'Paused' : 'Time remaining'}
            </span>
            <span className={`font-mono text-lg font-bold ${lowTime ? 'text-red-600' : 'text-[#0F172A]'}`}>
              {formatClock(remaining)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div
              className={`h-full ${lowTime ? 'bg-red-500' : 'bg-[#4F46E5]'} transition-all`}
              style={{ width: `${Math.max(0, Math.min(100, (remaining / total) * 100))}%` }}
            />
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B]">
            <span>Questions</span>
            <span className="font-mono text-[#0F172A]">
              {Math.min(interview.questionsAsked, interview.questionTarget)} / {interview.questionTarget}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          {interview.sections.length > 0 && (
            <ol className="space-y-1.5 pt-1">
              {interview.sections.map((section, i) => {
                const done = currentIndex > -1 && i < currentIndex;
                const current = section === interview.currentSection;
                return (
                  <li
                    key={section}
                    className={`flex items-center gap-2 text-[12px] ${current ? 'font-semibold text-[#0F172A]' : 'text-[#64748B]'}`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Circle className={`h-3.5 w-3.5 ${current ? 'text-[#4F46E5]' : ''}`} />
                    )}
                    {section}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Voice controls */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-[#64748B]">Voice</span>
          <div className="flex gap-2">
            <Toggle
              on={prefs.micEnabled}
              onClick={() => onTogglePref('micEnabled')}
              iconOn={Mic}
              iconOff={MicOff}
              label="Microphone"
              disabled={!sttSupported}
              hint={sttSupported ? 'Answer by voice' : 'Voice input is not supported in this browser'}
            />
            <Toggle
              on={prefs.readAloud}
              onClick={() => onTogglePref('readAloud')}
              iconOn={Volume2}
              iconOff={VolumeX}
              label="Read aloud"
              disabled={!ttsSupported}
              hint={ttsSupported ? 'Hear the interviewer' : 'Speech output is not supported in this browser'}
            />
          </div>
        </div>

        {/* Configuration */}
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] border-t border-[#F1F5F9] pt-4">
          {[
            ['Type', interview.interviewTypeLabel],
            ['Company', interview.companyName || 'General'],
            ['Role', interview.jobRole],
            ['Level', interview.experienceLevel, true],
            ['Difficulty', interview.difficulty, true],
            ['Mode', interview.mode, true],
            ['Duration', `${interview.durationMinutes} min`],
            ...(interview.programmingLanguage ? [['Language', interview.programmingLanguage, true]] : []),
          ].map(([k, v, cap]) => (
            <div key={k} className="min-w-0">
              <dt className="text-[#64748B]">{k}</dt>
              <dd className={`font-semibold text-[#0F172A] truncate ${cap ? 'capitalize' : ''}`} title={v}>
                {v}
              </dd>
            </div>
          ))}
        </dl>

        {/* Actions */}
        <div className="flex gap-2 border-t border-[#F1F5F9] pt-4">
          {paused ? (
            <button
              type="button"
              onClick={onResume}
              disabled={busy}
              className="flex-1 h-9 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[12px] font-semibold text-[#0F172A] flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" /> Resume
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              disabled={busy || interview.pauseSecondsLeft <= 0}
              title={interview.pauseSecondsLeft <= 0 ? 'No pause time left' : `${Math.floor(interview.pauseSecondsLeft / 60)} min of pause left`}
              className="flex-1 h-9 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] text-[12px] font-semibold text-[#0F172A] flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Pause className="h-3.5 w-3.5" /> Pause
            </button>
          )}
          <button
            type="button"
            onClick={onEnd}
            disabled={busy}
            className="flex-1 h-9 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Square className="h-3.5 w-3.5" /> End interview
          </button>
        </div>
      </div>
    </aside>
  );
};

export default InterviewSidebar;
