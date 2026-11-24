import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Local webcam preview. Video stays in the browser: nothing is recorded or uploaded.
 */
export const useCamera = () => {
  const supported = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const start = useCallback(async () => {
    if (!supported || streamRef.current) return;
    setStarting(true);
    setError(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = media;
      setStream(media);
    } catch (err) {
      setError(
        err?.name === 'NotAllowedError'
          ? 'Camera access was blocked. You can allow it in your browser settings or continue without video.'
          : err?.name === 'NotFoundError'
            ? 'No camera was found. You can continue without video.'
            : 'The camera could not be started. You can continue without video.'
      );
    } finally {
      setStarting(false);
    }
  }, [supported]);

  useEffect(() => stop, [stop]);

  return useMemo(
    () => ({ supported, stream, active: Boolean(stream), error, starting, start, stop }),
    [supported, stream, error, starting, start, stop]
  );
};
