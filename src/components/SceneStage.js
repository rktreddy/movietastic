import { View, Text, StyleSheet, Dimensions } from "react-native";
import Character, { CHAR_SIZE } from "./Character";
import { BACKGROUNDS, DEFAULT_BACKGROUND_ID } from "../data/backgrounds";
import { PROPS } from "../data/props";
import { IS_WEB, COLORS, FONT_MONO } from "../theme";

const { width: SCREEN_W } = Dimensions.get("window");
export const SCENE_W = Math.min(SCREEN_W - 40, 700);
export const SCENE_H = SCENE_W * 0.55;

export default function SceneStage({
  charPos,
  running,
  propId,
  characterId,
  backgroundId,
  done,
  frame,
  onTouch,
  mode,
}) {
  const pickedEmoji = propId
    ? PROPS.find((o) => o.id === propId)?.emoji
    : null;

  const bg = BACKGROUNDS.find((b) => b.id === backgroundId) ||
    BACKGROUNDS.find((b) => b.id === DEFAULT_BACKGROUND_ID);

  const handlePointer = (e) => {
    if (mode !== "recording") return;
    if (IS_WEB) {
      const rect = e.currentTarget.getBoundingClientRect();
      const lx = e.clientX - rect.left - CHAR_SIZE / 2;
      const ly = e.clientY - rect.top - CHAR_SIZE / 2;
      onTouch(
        Math.max(0, Math.min(lx, SCENE_W - CHAR_SIZE)),
        Math.max(0, Math.min(ly, SCENE_H - CHAR_SIZE))
      );
    } else {
      const touch = e.nativeEvent;
      const lx = touch.locationX - CHAR_SIZE / 2;
      const ly = touch.locationY - CHAR_SIZE / 2;
      onTouch(
        Math.max(0, Math.min(lx, SCENE_W - CHAR_SIZE)),
        Math.max(0, Math.min(ly, SCENE_H - CHAR_SIZE))
      );
    }
  };

  const webProps = IS_WEB
    ? { onMouseMove: handlePointer, onClick: handlePointer }
    : { onTouchMove: handlePointer, onTouchStart: handlePointer };

  const isInteractive = mode === "recording";

  return (
    <View
      style={[
        styles.scene,
        { backgroundColor: bg.skyColor },
        isInteractive && IS_WEB && { cursor: "crosshair" },
      ]}
      {...(isInteractive ? webProps : {})}
    >
      <View style={[styles.stageFloor, { backgroundColor: bg.groundColor }]} />

      {/* Decorative emojis */}
      {bg.decorEmoji.map((emoji, i) => (
        <Text
          key={i}
          style={[
            styles.decorEmoji,
            {
              left: `${20 + i * 30}%`,
              top: bg.id === "space" ? `${10 + i * 15}%` : `${5 + i * 8}%`,
              fontSize: 24 + i * 4,
              opacity: 0.3,
            },
          ]}
        >
          {emoji}
        </Text>
      ))}

      <Character
        x={charPos.x}
        y={charPos.y}
        running={mode === "recording" || mode === "playing"}
        pickedEmoji={pickedEmoji}
        frame={frame}
        characterId={characterId}
      />

      {done && mode === "idle" && (
        <View style={styles.doneOverlay}>
          <Text style={styles.doneStarEmoji}>{"\u2B50"}</Text>
          <Text style={styles.doneTitle}>Scene Complete!</Text>
          <Text style={styles.doneSubtitle}>THAT'S A WRAP!</Text>
        </View>
      )}

      {mode === "recording" && (
        <View style={styles.touchHint}>
          <Text style={styles.touchHintText}>
            {IS_WEB ? "Move mouse to direct your character!" : "Touch & drag to direct your character!"}
          </Text>
          <View style={styles.recDot} />
        </View>
      )}

      {mode === "playing" && (
        <View style={styles.touchHint}>
          <Text style={styles.touchHintText}>Playing back...</Text>
        </View>
      )}

      {mode === "idle" && !done && !propId && (
        <View style={styles.pickHint}>
          <Text style={styles.pickHintText}>
            Pick something fun below to get started!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: SCENE_W,
    height: SCENE_H,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: COLORS.yellow,
    position: "relative",
  },
  stageFloor: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
  },
  decorEmoji: {
    position: "absolute",
  },
  doneOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  doneStarEmoji: { fontSize: 48, marginBottom: 8 },
  doneTitle: {
    fontFamily: "Georgia",
    color: COLORS.yellow, fontSize: 26, fontWeight: "700",
  },
  doneSubtitle: {
    fontFamily: FONT_MONO,
    color: COLORS.coral, fontSize: 14, letterSpacing: 2, marginTop: 4,
  },
  touchHint: {
    position: "absolute", bottom: 14, left: 0, right: 0,
    alignItems: "center", flexDirection: "row", justifyContent: "center",
  },
  touchHintText: {
    fontFamily: FONT_MONO, color: "#fff", fontSize: 13,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, overflow: "hidden", fontWeight: "600",
  },
  recDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.danger,
    marginLeft: 8,
  },
  pickHint: {
    position: "absolute", bottom: 14, left: 0, right: 0,
    alignItems: "center",
  },
  pickHintText: {
    fontFamily: FONT_MONO, color: "#fff", fontSize: 13,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, overflow: "hidden",
  },
});
