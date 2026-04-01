// Emotion system — gives characters expressive faces
// Each emotion overrides the default mouth/brow/eye animations

export const EMOTIONS = [
  { id: "happy", label: "Happy", emoji: "\uD83D\uDE04", mouth: "grin", browUp: 0, eyeScale: 1, cheekGlow: true },
  { id: "sad", label: "Sad", emoji: "\uD83D\uDE22", mouth: "frown", browUp: -3, eyeScale: 0.9, cheekGlow: false },
  { id: "angry", label: "Angry", emoji: "\uD83D\uDE20", mouth: "grr", browUp: -4, eyeScale: 0.85, cheekGlow: false },
  { id: "surprised", label: "Surprised", emoji: "\uD83D\uDE32", mouth: "wow", browUp: 6, eyeScale: 1.2, cheekGlow: false },
  { id: "scared", label: "Scared", emoji: "\uD83D\uDE28", mouth: "wavy", browUp: 5, eyeScale: 1.15, cheekGlow: false },
  { id: "cool", label: "Cool", emoji: "\uD83D\uDE0E", mouth: "smirk", browUp: 0, eyeScale: 0.95, cheekGlow: false },
  { id: "love", label: "Love", emoji: "\uD83D\uDE0D", mouth: "grin", browUp: 2, eyeScale: 1.1, cheekGlow: true, heartEyes: true },
  { id: "sleepy", label: "Sleepy", emoji: "\uD83D\uDE34", mouth: "ooo", browUp: -2, eyeScale: 0.5, cheekGlow: false },
];

export const DEFAULT_EMOTION_ID = null; // null = use motion-based defaults
