import { useState, useRef, useCallback, useEffect } from "react";

const FRAME_INTERVAL = 33; // ~30fps

function interpolate(keyframes, time) {
  if (!keyframes || keyframes.length === 0) return { x: 0, y: 0 };
  if (keyframes.length === 1) return { x: keyframes[0].x, y: keyframes[0].y };

  // Clamp to last keyframe
  const last = keyframes[keyframes.length - 1];
  if (time >= last.timestamp) return { x: last.x, y: last.y };

  // Find surrounding keyframes
  let i = 0;
  while (i < keyframes.length - 1 && keyframes[i + 1].timestamp <= time) {
    i++;
  }

  const a = keyframes[i];
  const b = keyframes[i + 1];
  if (!b) return { x: a.x, y: a.y };

  const t = (time - a.timestamp) / (b.timestamp - a.timestamp);
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

export function usePlayback() {
  const [playbackPos, setPlaybackPos] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const onCompleteRef = useRef(null);

  const startPlayback = useCallback((keyframes, onComplete) => {
    if (!keyframes || keyframes.length === 0) {
      onComplete?.();
      return;
    }

    onCompleteRef.current = onComplete;
    const duration = keyframes[keyframes.length - 1].timestamp;

    setPlaybackPos({ x: keyframes[0].x, y: keyframes[0].y });
    setIsPlaying(true);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= duration) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setPlaybackPos({ x: keyframes[keyframes.length - 1].x, y: keyframes[keyframes.length - 1].y });
        setIsPlaying(false);
        onCompleteRef.current?.();
        return;
      }
      setPlaybackPos(interpolate(keyframes, elapsed));
    }, FRAME_INTERVAL);
  }, []);

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { playbackPos, isPlaying, startPlayback, stopPlayback };
}
