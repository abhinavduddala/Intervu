import React from 'react';
import { Mic, MessageSquareText } from 'lucide-react';

const InterviewMessage = ({ message, onSpeak }) => {
  const isInterviewer = message.sender === 'interviewer';

  if (isInterviewer) {
    return (
      <div className="flex gap-3 items-start max-w-3xl">
        <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] text-[11px] font-bold">
          AI
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-[#64748B] font-semibold">
            <span>Interviewer</span>
            {message.questionNumber && message.intent !== 'closing' ? <span className="font-mono">Q{message.questionNumber}</span> : null}
            {message.section ? <span className="font-normal">· {message.section}</span> : null}
          </div>
          {message.feedback && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[12px] leading-relaxed text-amber-800">
              <div className="flex items-center gap-1.5 font-semibold mb-1">
                <MessageSquareText className="h-3.5 w-3.5" /> Feedback on your answer
              </div>
              {message.feedback}
            </div>
          )}
          <div className="bg-white border border-[#E2E8F0] rounded-xl rounded-tl-sm px-4 py-3 text-[13px] leading-relaxed text-[#0F172A] whitespace-pre-wrap shadow-sm">
            {message.message}
          </div>
          {onSpeak && (
            <button
              type="button"
              onClick={() => onSpeak(message.message)}
              className="text-[11px] text-[#64748B] hover:text-[#4F46E5] font-medium"
            >
              Read aloud
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div className="max-w-2xl space-y-1">
        <div className="flex items-center justify-end gap-1.5 text-[11px] text-[#64748B] font-semibold">
          {message.inputMode === 'voice' && <Mic className="h-3 w-3" />}
          <span>You</span>
        </div>
        <div className="bg-[#4F46E5] text-white rounded-xl rounded-tr-sm px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap">
          {message.message}
        </div>
      </div>
    </div>
  );
};

export const TypingIndicator = () => (
  <div className="flex gap-3 items-center" aria-live="polite">
    <div className="h-8 w-8 shrink-0 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] text-[11px] font-bold">
      AI
    </div>
    <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 flex gap-1 shadow-sm">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 rounded-full bg-[#94A3B8] animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
      <span className="sr-only">The interviewer is typing</span>
    </div>
  </div>
);

export default InterviewMessage;
