import React, { useEffect, useRef } from 'react';
import { VideoOff, Video, Loader2 } from 'lucide-react';

/** Mirrored local webcam preview. Nothing is recorded or uploaded. */
const CameraPreview = ({ camera, enabled, onToggle, compact = false, label = 'You', stopped = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = camera.stream || null;
  }, [camera.stream]);

  return (
    <div className="relative bg-[#0F172A] rounded-xl overflow-hidden aspect-video w-full border border-[#E2E8F0]">
      {camera.active ? (
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#94A3B8] px-4 text-center">
          {camera.starting ? <Loader2 className="h-5 w-5 animate-spin" /> : <VideoOff className="h-5 w-5" />}
          <span className="text-[11px] font-medium">
            {!camera.supported
              ? 'Camera is not supported in this browser'
              : camera.error || (enabled && !stopped ? 'Starting camera...' : 'Camera is off')}
          </span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/50 text-[10px] font-semibold text-slate-100">
        {label}
      </div>
      {camera.supported && onToggle && !stopped && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-slate-100"
          title={enabled ? 'Turn camera off' : 'Turn camera on'}
          aria-label={enabled ? 'Turn camera off' : 'Turn camera on'}
        >
          {enabled ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
        </button>
      )}
      {!compact && camera.active && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/50 text-[10px] text-slate-200">
          Preview only, not recorded
        </div>
      )}
    </div>
  );
};

export default CameraPreview;
