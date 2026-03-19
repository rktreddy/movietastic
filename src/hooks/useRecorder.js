import { useRef, useCallback } from "react";

const SAMPLE_INTERVAL = 100; // ms

export function useRecorder() {
  const keyframesRef = useRef([]);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const latestPosRef = useRef({ x: 0, y: 0 });

  const startRecording = useCallback((initialPos) => {
    keyframesRef.current = [];
    latestPosRef.current = { ...initialPos };
    startTimeRef.current = Date.now();

    keyframesRef.current.push({
      timestamp: 0,
      x: initialPos.x,
      y: initialPos.y,
    });

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      keyframesRef.current.push({
        timestamp: elapsed,
        x: latestPosRef.current.x,
        y: latestPosRef.current.y,
      });
    }, SAMPLE_INTERVAL);
  }, []);

  const recordPosition = useCallback((x, y) => {
    latestPosRef.current = { x, y };
  }, []);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Add final keyframe
    const elapsed = Date.now() - startTimeRef.current;
    keyframesRef.current.push({
      timestamp: elapsed,
      x: latestPosRef.current.x,
      y: latestPosRef.current.y,
    });
    return [...keyframesRef.current];
  }, []);

  return { startRecording, recordPosition, stopRecording };
}
