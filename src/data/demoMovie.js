// Pre-built demo movie: "Space Adventure"
// 3 scenes showing a character exploring different locations

// Helper to generate smooth path keyframes
function makePath(points, totalMs) {
  const keyframes = [];
  const segmentTime = totalMs / (points.length - 1);
  const stepsPerSegment = 10;

  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      keyframes.push({
        timestamp: Math.round(i * segmentTime + s * (segmentTime / stepsPerSegment)),
        x: x1 + (x2 - x1) * t,
        y: y1 + (y2 - y1) * t,
      });
    }
  }
  // Add final point
  const last = points[points.length - 1];
  keyframes.push({ timestamp: totalMs, x: last[0], y: last[1] });
  return keyframes;
}

export const DEMO_MOVIE = {
  title: "Space Adventure",
  scenes: [
    {
      id: 100,
      backgroundId: "park",
      characterId: "star",
      propId: "rocket",
      voiceOverUri: null,
      // Character walks across the park, waves, then heads right
      keyframes: makePath(
        [
          [20, 120],
          [80, 100],
          [160, 130],
          [240, 90],
          [320, 110],
          [400, 80],
          [480, 100],
        ],
        4000
      ),
      duration: 4000,
    },
    {
      id: 101,
      backgroundId: "space",
      characterId: "robot",
      propId: "star",
      voiceOverUri: null,
      // Character floats around in space
      keyframes: makePath(
        [
          [40, 60],
          [120, 30],
          [250, 80],
          [350, 20],
          [420, 100],
          [300, 130],
          [180, 70],
          [80, 100],
        ],
        5000
      ),
      duration: 5000,
    },
    {
      id: 102,
      backgroundId: "beach",
      characterId: "sunny",
      propId: "trophy",
      voiceOverUri: null,
      // Character celebrates on the beach
      keyframes: makePath(
        [
          [40, 120],
          [100, 80],
          [180, 120],
          [260, 60],
          [340, 120],
          [260, 80],
          [180, 120],
          [300, 100],
        ],
        4500
      ),
      duration: 4500,
    },
  ],
  activeSceneIndex: 0,
};
