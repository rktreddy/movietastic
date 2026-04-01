// Camera effects — per-scene camera movements that make movies feel cinematic
// Implemented as CSS transforms on the stage container during playback

export const CAMERA_EFFECTS = [
  { id: "none", label: "Static", emoji: "\uD83D\uDCF7", description: "No camera movement" },
  { id: "slow-zoom", label: "Zoom In", emoji: "\uD83D\uDD0D", description: "Slowly zoom in for drama" },
  { id: "zoom-out", label: "Zoom Out", emoji: "\uD83D\uDD2D", description: "Pull back to reveal the scene" },
  { id: "pan-right", label: "Pan Right", emoji: "\u27A1\uFE0F", description: "Camera slides right" },
  { id: "pan-left", label: "Pan Left", emoji: "\u2B05\uFE0F", description: "Camera slides left" },
  { id: "shake", label: "Shake!", emoji: "\uD83D\uDCA5", description: "Earthquake shake effect" },
  { id: "dream", label: "Dreamy", emoji: "\uD83D\uDCAD", description: "Soft wavy dream effect" },
  { id: "spin", label: "Spin", emoji: "\uD83C\uDF00", description: "Slow dramatic spin" },
];

export const DEFAULT_CAMERA_EFFECT_ID = "none";

// Compute transform values based on effect and playback progress (0 to 1)
export function getCameraTransform(effectId, progress) {
  switch (effectId) {
    case "slow-zoom":
      return {
        scale: 1 + progress * 0.2,
        translateX: 0,
        translateY: 0,
        rotate: 0,
      };
    case "zoom-out":
      return {
        scale: 1.2 - progress * 0.2,
        translateX: 0,
        translateY: 0,
        rotate: 0,
      };
    case "pan-right":
      return {
        scale: 1.05,
        translateX: -progress * 40,
        translateY: 0,
        rotate: 0,
      };
    case "pan-left":
      return {
        scale: 1.05,
        translateX: progress * 40,
        translateY: 0,
        rotate: 0,
      };
    case "shake":
      // Rapid shake that decays over time
      const intensity = Math.max(0, 1 - progress * 0.5);
      return {
        scale: 1,
        translateX: Math.sin(progress * 60) * 4 * intensity,
        translateY: Math.cos(progress * 45) * 3 * intensity,
        rotate: Math.sin(progress * 50) * 1.5 * intensity,
      };
    case "dream":
      return {
        scale: 1 + Math.sin(progress * 4) * 0.03,
        translateX: Math.sin(progress * 3) * 5,
        translateY: Math.cos(progress * 2.5) * 3,
        rotate: Math.sin(progress * 2) * 0.8,
      };
    case "spin":
      // Very slow subtle rotation
      return {
        scale: 1,
        translateX: 0,
        translateY: 0,
        rotate: progress * 5 - 2.5, // -2.5 to +2.5 degrees
      };
    case "none":
    default:
      return { scale: 1, translateX: 0, translateY: 0, rotate: 0 };
  }
}
