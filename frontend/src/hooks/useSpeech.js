import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const getRecognitionCtor = () =>
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition || null : null;

/**
 * Browser speech-to-text. Optional: `supported` is false where the browser has no
 * speech recognition, and callers fall back to typing.
 * `onFinal(text)` receives each finalised phrase; `interim` holds the phrase in progress.
 */
export const useSpeechRecognition = ({ onFinal, lang } = {}) => {
  const Ctor = getRecognitionCtor();
  const supported = Boolean(Ctor);
  const recognitionRef = useRef(null);
  const wantListeningRef = useRef(false);
  const onFinalRef = useRef(onFinal);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    setInterim('');
    try {
      recognitionRef.current?.stop();
    } catch {
      // already stopped
    }
  }, []);

  const start = useCallback(() => {
    if (!Ctor) return;
    setError(null);
    wantListeningRef.current = true;

    if (!recognitionRef.current) {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = lang || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

      rec.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result.isFinal) onFinalRef.current?.(result[0].transcript.trim());
          else interimText += result[0].transcript;
        }
        setInterim(interimText);
      };
      rec.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        wantListeningRef.current = false;
        setError(
          event.error === 'not-allowed' || event.error === 'service-not-allowed'
            ? 'Microphone access was blocked. Allow it in your browser settings, or type your answer.'
            : 'Voice input stopped unexpectedly. You can try again or type your answer.'
        );
      };
      rec.onstart = () => setListening(true);
      rec.onend = () => {
        setListening(false);
        setInterim('');
        // Browsers end recognition after silence; restart while the user still wants it
        if (wantListeningRef.current) {
          try {
            rec.start();
          } catch {
            wantListeningRef.current = false;
          }
        }
      };
      recognitionRef.current = rec;
    }

    try {
      recognitionRef.current.start();
    } catch {
      // start() throws if already running
    }
  }, [Ctor, lang]);

  useEffect(
    () => () => {
      wantListeningRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch {
        // ignore
      }
    },
    []
  );

  return useMemo(() => ({ supported, listening, interim, error, start, stop }), [supported, listening, interim, error, start, stop]);
};

/** Browser text-to-speech for interviewer messages, with graceful no-op fallback. */
export const useSpeechSynthesis = () => {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef(null);

  useEffect(() => {
    if (!supported) return undefined;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const lang = (navigator.language || 'en-US').toLowerCase();
      voiceRef.current =
        voices.find((v) => v.lang.toLowerCase() === lang && v.localService) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en') && v.localService) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
        null;
    };
    pickVoice();
    window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', pickVoice);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text, { onEnd } = {}) => {
      if (!supported || !text) {
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.rate = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setSpeaking(false);
        onEnd?.();
      };
      window.speechSynthesis.speak(utterance);
    },
    [supported]
  );

  return useMemo(() => ({ supported, speaking, speak, cancel }), [supported, speaking, speak, cancel]);
};
