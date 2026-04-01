import { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Character, { CHAR_SIZE } from "./Character";
import SpeechBubble from "./SpeechBubble";
import { BACKGROUNDS, DEFAULT_BACKGROUND_ID } from "../data/backgrounds";
import { PROPS } from "../data/props";
import { getCameraTransform } from "../data/cameraEffects";
import { IS_WEB, COLORS, FONT_MONO } from "../theme";

const { width: SCREEN_W } = Dimensions.get("window");
export const SCENE_W = Math.min(SCREEN_W - 40, 700);
export const SCENE_H = SCENE_W * 0.55;

export default function SceneStage({
  charPos,
  propId,
  characterId,
  backgroundId,
  done,
  frame,
  onTouch,
  onCut,
  mode,
  motion,
  facing,
  extraActors, // [{characterId, propId, x, y, motion, facing, emotionId, bubbleText, bubbleType}]
  // New props
  emotionId,
  bubbleText,
  bubbleType,
  cameraEffect,
  cameraProgress, // 0 to 1 during playback
}) {
  const pickedEmoji = propId
    ? PROPS.find((o) => o.id === propId)?.emoji
    : null;

  const bg = BACKGROUNDS.find((b) => b.id === backgroundId) ||
    BACKGROUNDS.find((b) => b.id === DEFAULT_BACKGROUND_ID);

  const isDraggingRef = useRef(false);

  const clampPos = (lx, ly) => ({
    x: Math.max(0, Math.min(lx, SCENE_W - CHAR_SIZE)),
    y: Math.max(0, Math.min(ly, SCENE_H - CHAR_SIZE)),
  });

  const getWebPos = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      lx: e.clientX - rect.left - CHAR_SIZE / 2,
      ly: e.clientY - rect.top - CHAR_SIZE / 2,
    };
  };

  const handleWebMouseDown = (e) => {
    if (mode !== "recording") return;
    isDraggingRef.current = true;
    const { lx, ly } = getWebPos(e);
    const pos = clampPos(lx, ly);
    onTouch(pos.x, pos.y);
  };

  const handleWebMouseMove = (e) => {
    if (mode !== "recording" || !isDraggingRef.current) return;
    const { lx, ly } = getWebPos(e);
    const pos = clampPos(lx, ly);
    onTouch(pos.x, pos.y);
  };

  const handleWebMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleNativeTouch = (e) => {
    if (mode !== "recording") return;
    const touch = e.nativeEvent;
    const pos = clampPos(
      touch.locationX - CHAR_SIZE / 2,
      touch.locationY - CHAR_SIZE / 2
    );
    onTouch(pos.x, pos.y);
  };

  const webProps = IS_WEB
    ? {
        onMouseDown: handleWebMouseDown,
        onMouseMove: handleWebMouseMove,
        onMouseUp: handleWebMouseUp,
        onMouseLeave: handleWebMouseUp,
      }
    : {
        onTouchMove: handleNativeTouch,
        onTouchStart: handleNativeTouch,
      };

  const isInteractive = mode === "recording";

  // Camera transform during playback
  const cam = getCameraTransform(cameraEffect || "none", cameraProgress || 0);
  const hasCameraEffect = cameraEffect && cameraEffect !== "none" && (mode === "playing" || cameraProgress > 0);
  const cameraStyle = hasCameraEffect ? {
    transform: [
      { scale: cam.scale },
      { translateX: cam.translateX },
      { translateY: cam.translateY },
      { rotate: `${cam.rotate}deg` },
    ],
  } : {};

  return (
    <View style={[styles.sceneOuter]}>
      <View
        style={[
          styles.scene,
          { backgroundColor: bg.skyColor },
          isInteractive && IS_WEB && { cursor: "crosshair", userSelect: "none" },
          cameraStyle,
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

        {/* Extra actors + their speech bubbles */}
        {(extraActors || []).map((actor, i) => (
          <View key={actor.characterId + i}>
            <Character
              x={actor.x}
              y={actor.y}
              pickedEmoji={actor.propId ? PROPS.find((o) => o.id === actor.propId)?.emoji : null}
              frame={frame}
              characterId={actor.characterId}
              motion={actor.motion || "idle"}
              facing={actor.facing || "right"}
              emotionId={actor.emotionId}
            />
            {actor.bubbleText ? (
              <SpeechBubble
                text={actor.bubbleText}
                type={actor.bubbleType || "speech"}
                x={Math.min(actor.x, SCENE_W - 120)}
                y={actor.y}
                facing={actor.facing || "right"}
              />
            ) : null}
          </View>
        ))}

        {/* Main character */}
        <Character
          x={charPos.x}
          y={charPos.y}
          pickedEmoji={pickedEmoji}
          frame={frame}
          characterId={characterId}
          motion={motion}
          facing={facing}
          emotionId={emotionId}
        />

        {/* Main character speech bubble */}
        {bubbleText ? (
          <SpeechBubble
            text={bubbleText}
            type={bubbleType || "speech"}
            x={Math.min(charPos.x, SCENE_W - 120)}
            y={charPos.y}
            facing={facing}
          />
        ) : null}

        {done && mode === "idle" && (
          <View style={styles.doneOverlay}>
            <View style={styles.doneStarIcon}><Text style={styles.doneStarText}>*</Text></View>
            <Text style={styles.doneTitle}>Scene Complete!</Text>
            <Text style={styles.doneSubtitle}>THAT'S A WRAP!</Text>
          </View>
        )}

        {/* Floating Cut button inside stage during recording */}
        {mode === "recording" && onCut && (
          <TouchableOpacity
            style={styles.floatingCut}
            onPress={onCut}
          >
            <Text style={styles.floatingCutText}>CUT!</Text>
          </TouchableOpacity>
        )}

        {mode === "recording" && (
          <View style={styles.touchHint}>
            <Text style={styles.touchHintText}>
              {IS_WEB ? "Click & drag to direct your character!" : "Touch & drag to direct your character!"}
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
    </View>
  );
}

const styles = StyleSheet.create({
  sceneOuter: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: COLORS.yellow,
  },
  scene: {
    width: SCENE_W,
    height: SCENE_H,
    position: "relative",
    overflow: "hidden",
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
  doneStarIcon: {
    width: 48, height: 48, borderRadius: 24, marginBottom: 8,
    backgroundColor: COLORS.yellow, alignItems: "center", justifyContent: "center",
  },
  doneStarText: { fontSize: 28, color: COLORS.coral, fontWeight: "700" },
  doneTitle: {
    fontFamily: "Georgia",
    color: COLORS.yellow, fontSize: 26, fontWeight: "700",
  },
  doneSubtitle: {
    fontFamily: FONT_MONO,
    color: COLORS.coral, fontSize: 14, letterSpacing: 2, marginTop: 4,
  },
  floatingCut: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: COLORS.teal,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  floatingCutText: {
    fontFamily: FONT_MONO,
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
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
