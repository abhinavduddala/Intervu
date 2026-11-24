import React, { useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeech';

const MAX_LENGTH = 4000;

/**
 * Answer box with optional voice dictation. Dictated text lands in the box so the
 * candidate can review it before sending. Typing always works.
 */
const AnswerComposer = ({ value, onChange, onSubmit, disabled, submitting, micEnabled, suspendMic, onVoiceUsed }) => {
  const textRef = useRef(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const handleFinal = useCallback(
    (phrase) => {
      if (!phrase) return;
      const current = valueRef.current;
      const next = `${current}${current && !/\s$/.test(current) ? ' ' : ''}${phrase}`.slice(0, MAX_LENGTH);
      onChange(next);
      onVoiceUsed?.();
    },
    [onChange, onVoiceUsed]
  );

  const speech = useSpeechRecognition({ onFinal: handleFinal });
  const { listening, start, stop } = speech;

  // Pause dictation while the interviewer speaks or the box is locked, so it doesn't transcribe itself
  useEffect(() => {
    if ((disabled || suspendMic || !micEnabled) && listening) stop();
  }, [disabled, suspendMic, micEnabled, listening, stop]);

  const submit = () => {
    if (listening) stop();
    if (!disabled && value.trim()) onSubmit();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  };

  const toggleMic = () => (listening ? stop() : start());

  return (
    <div className="border-t border-[#E2E8F0] bg-white px-4 sm:px-6 py-4 space-y-2">
      {speech.error && <p className="text-[11px] text-red-600">{speech.error}</p>}
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textRef}
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={onKeyDown}
            disabled={disabled}
            rows={3}
            placeholder={listening ? 'Listening... speak your answer' : 'Type your answer. Press Ctrl+Enter to send.'}
            className="w-full resize-none rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-[13px] leading-relaxed text-[#0F172A] focus:outline-none focus:border-[#4F46E5] disabled:opacity-60"
            aria-label="Your answer"
          />
          {listening && speech.interim && (
            <p className="text-[11px] italic text-[#64748B] mt-1 line-clamp-2">{speech.interim}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {micEnabled && speech.supported && (
            <button
              type="button"
              onClick={toggleMic}
              disabled={disabled || suspendMic}
              className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-colors disabled:opacity-50 ${
                listening
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]'
              }`}
              title={listening ? 'Stop dictation' : 'Dictate your answer'}
              aria-label={listening ? 'Stop dictation' : 'Dictate your answer'}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="h-10 w-10 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white flex items-center justify-center disabled:opacity-50"
            title="Send answer (Ctrl+Enter)"
            aria-label="Send answer"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-[#64748B]">
        <span>
          {micEnabled && !speech.supported
            ? 'Voice input is not supported in this browser. Type your answer instead.'
            : listening
              ? 'Dictating. Review the text before sending.'
              : ''}
        </span>
        <span className="font-mono">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  );
};

export default AnswerComposer;
