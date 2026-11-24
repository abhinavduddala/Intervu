import React, { useEffect, useRef } from 'react';
import InterviewMessage, { TypingIndicator } from './InterviewMessage';

const InterviewChat = ({ messages, pendingAnswer, waiting, onSpeak }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, waiting, pendingAnswer]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
      {messages.map((m) => (
        <InterviewMessage key={m.id} message={m} onSpeak={m.sender === 'interviewer' ? onSpeak : undefined} />
      ))}
      {pendingAnswer && (
        <div className="opacity-70">
          <InterviewMessage message={{ id: 'pending', sender: 'candidate', message: pendingAnswer.answer, inputMode: pendingAnswer.inputMode }} />
        </div>
      )}
      {waiting && <TypingIndicator />}
      <div ref={endRef} />
    </div>
  );
};

export default InterviewChat;
