// Pre-built demo movie: "The Lion King Adventure"
// 3 scenes showing Lion King characters interacting across locations

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
  const last = points[points.length - 1];
  keyframes.push({ timestamp: totalMs, x: last[0], y: last[1] });
  return keyframes;
}

export const DEMO_MOVIE = {
  title: "The Lion King Adventure",
  scenes: [
    {
      id: 100,
      backgroundId: "park",
      characterId: "simba",
      propId: "star",
      voiceOverUri: null,
      // Simba explores the Pride Lands
      keyframes: makePath(
        [
          [20, 130],
          [100, 100],
          [200, 130],
          [300, 80],
          [380, 120],
          [300, 100],
          [200, 130],
        ],
        4500
      ),
      extraActors: [
        {
          id: 1,
          characterId: "nala",
          propId: "flower",
          // Nala follows along
          keyframes: makePath(
            [
              [350, 130],
              [280, 110],
              [200, 80],
              [140, 110],
              [200, 130],
              [280, 100],
              [350, 120],
            ],
            4500
          ),
        },
      ],
      duration: 4500,
    },
    {
      id: 101,
      backgroundId: "castle",
      characterId: "mufasa",
      propId: "crown",
      voiceOverUri: null,
      // Mufasa at Pride Rock
      keyframes: makePath(
        [
          [40, 100],
          [120, 80],
          [220, 100],
          [320, 70],
          [400, 100],
          [320, 120],
          [220, 90],
        ],
        5000
      ),
      extraActors: [
        {
          id: 2,
          characterId: "scar",
          propId: null,
          // Scar lurks in the shadows
          keyframes: makePath(
            [
              [420, 130],
              [380, 120],
              [340, 130],
              [300, 110],
              [340, 130],
              [380, 120],
              [420, 130],
            ],
            5000
          ),
        },
        {
          id: 3,
          characterId: "robot",
          propId: "star",
          // Zazu (robot stand-in) flies above
          keyframes: makePath(
            [
              [60, 20],
              [160, 10],
              [280, 30],
              [380, 10],
              [280, 25],
              [160, 15],
              [60, 20],
            ],
            5000
          ),
        },
      ],
      duration: 5000,
    },
    {
      id: 102,
      backgroundId: "beach",
      characterId: "timon",
      propId: "guitar",
      voiceOverUri: null,
      // Timon and Pumbaa celebrate Hakuna Matata
      keyframes: makePath(
        [
          [40, 120],
          [120, 80],
          [200, 120],
          [280, 60],
          [360, 120],
          [280, 80],
          [200, 120],
          [120, 100],
        ],
        4500
      ),
      extraActors: [
        {
          id: 4,
          characterId: "pumbaa",
          propId: "popcorn",
          // Pumbaa dances along
          keyframes: makePath(
            [
              [300, 130],
              [240, 100],
              [180, 130],
              [120, 80],
              [180, 130],
              [240, 100],
              [300, 130],
              [360, 110],
            ],
            4500
          ),
        },
        {
          id: 5,
          characterId: "simba",
          propId: "trophy",
          // Grown Simba joins the party
          keyframes: makePath(
            [
              [420, 100],
              [360, 80],
              [300, 100],
              [240, 130],
              [180, 100],
              [240, 80],
              [320, 100],
              [400, 120],
            ],
            4500
          ),
        },
      ],
      duration: 4500,
    },
  ],
  activeSceneIndex: 0,
};
