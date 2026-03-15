import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const { width: SCREEN_W } = Dimensions.get("window");
const SCENE_W = Math.min(SCREEN_W - 40, 700);
const SCENE_H = SCENE_W * 0.55;
const CHAR_SIZE = 50;

const PRESET_OBJECTS = [
  { id: "camera", emoji: "\uD83C\uDFA5", label: "Camera" },
  { id: "clapper", emoji: "\uD83C\uDFAC", label: "Clapper" },
  { id: "mic", emoji: "\uD83C\uDFA4", label: "Mic" },
  { id: "spotlight", emoji: "\uD83D\uDD26", label: "Spotlight" },
  { id: "film", emoji: "\uD83C\uDF9E\uFE0F", label: "Film Reel" },
  { id: "popcorn", emoji: "\uD83C\uDF7F", label: "Popcorn" },
  { id: "star", emoji: "\u2B50", label: "Star" },
  { id: "trophy", emoji: "\uD83C\uDFC6", label: "Trophy" },
];

const IS_WEB = Platform.OS === "web";
const FONT_MONO = Platform.select({ ios: "Courier", default: "monospace" });
const FONT_SERIF = Platform.select({ ios: "Georgia", default: "serif" });

// ── Character Component ──
function Character({ x, y, running, pickedEmoji, frame }) {
  const bob = running ? Math.sin(frame * 0.22) * 4 : 0;
  const legSwing = running ? Math.sin(frame * 0.28) * 12 : 0;

  return (
    <View style={[styles.character, { left: x, top: y + bob }]}>
      <View style={styles.charHead}>
        <View style={[styles.charEye, { left: 8 }]} />
        <View style={[styles.charEye, { right: 8 }]} />
        <View style={styles.charSmile} />
      </View>
      <View style={styles.charBody} />
      <View
        style={[
          styles.charArm,
          styles.charArmLeft,
          running && { transform: [{ rotate: `${legSwing}deg` }] },
        ]}
      />
      <View
        style={[
          styles.charArm,
          styles.charArmRight,
          running && { transform: [{ rotate: `${-legSwing}deg` }] },
        ]}
      />
      <View
        style={[
          styles.charLeg,
          styles.charLegLeft,
          { transform: [{ rotate: `${legSwing}deg` }] },
        ]}
      />
      <View
        style={[
          styles.charLeg,
          styles.charLegRight,
          { transform: [{ rotate: `${-legSwing}deg` }] },
        ]}
      />
      {pickedEmoji && (
        <Text style={styles.heldObject}>{pickedEmoji}</Text>
      )}
    </View>
  );
}

// ── Scene Stage ──
function SceneStage({ charPos, running, picked, done, frame, onTouch, sceneRef }) {
  const pickedEmoji = picked
    ? PRESET_OBJECTS.find((o) => o.id === picked)?.emoji
    : null;

  const handlePointer = (e) => {
    if (!running) return;
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

  return (
    <View ref={sceneRef} style={styles.scene} {...webProps}>
      <View style={styles.stageFloor} />
      <View style={[styles.spotlight, { left: "10%" }]} />
      <View style={[styles.spotlight, styles.spotlightPink, { left: "40%" }]} />
      <View style={[styles.spotlight, styles.spotlightBlue, { right: "10%" }]} />

      {[
        [20, 15], [80, 25], [150, 10], [220, 30],
        [SCENE_W - 60, 20], [SCENE_W - 120, 12],
      ].map(([sx, sy], i) => (
        <View key={i} style={[styles.star, { left: sx, top: sy }]} />
      ))}

      <View style={styles.filmBorderTop} />
      <View style={styles.filmBorderBottom} />

      <Character
        x={charPos.x}
        y={charPos.y}
        running={running}
        pickedEmoji={pickedEmoji}
        frame={frame}
      />

      {done && !running && (
        <View style={styles.doneOverlay}>
          <Text style={styles.doneStarEmoji}>{"\u2B50"}</Text>
          <Text style={styles.doneTitle}>Scene Complete!</Text>
          <Text style={styles.doneSubtitle}>THAT'S A WRAP!</Text>
        </View>
      )}

      {running && (
        <View style={styles.touchHint}>
          <Text style={styles.touchHintText}>
            {IS_WEB ? "Move mouse to control your character" : "Touch & drag to move your character"}
          </Text>
        </View>
      )}

      {!running && !done && !picked && (
        <View style={styles.pickHint}>
          <Text style={styles.pickHintText}>
            Pick an object below to begin
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Main App ──
export default function App() {
  const [picked, setPicked] = useState(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(0);
  const [showClap, setShowClap] = useState(false);
  const [frame, setFrame] = useState(0);
  const [charPos, setCharPos] = useState({
    x: 40,
    y: SCENE_H / 2 - CHAR_SIZE / 2,
  });

  const sceneRef = useRef(null);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const clapAnim = useRef(new Animated.Value(0)).current;

  // Animation loop
  useEffect(() => {
    if (running) {
      const interval = setInterval(() => {
        setFrame((f) => (f + 1) % 1000);
      }, 33);
      return () => clearInterval(interval);
    }
  }, [running]);

  const handlePickObject = (id) => {
    if (running) return;
    setPicked(id);
    setStep((s) => Math.max(s, 1));
    setDone(false);
  };

  const handleStart = () => {
    if (!picked) return;
    setShowClap(true);
    Animated.sequence([
      Animated.timing(clapAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.timing(clapAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowClap(false);
      setRunning(true);
      setDone(false);
      setStep(2);
    });
  };

  const handleDone = () => {
    setRunning(false);
    setDone(true);
    setStep(3);
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleReset = () => {
    setRunning(false);
    setDone(false);
    setPicked(null);
    setStep(0);
    setCharPos({ x: 40, y: SCENE_H / 2 - CHAR_SIZE / 2 });
  };

  const handleMoveChar = (x, y) => {
    setCharPos({ x, y });
  };

  const canStart = picked && !running;
  const canDone = running;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Flash overlay */}
      <Animated.View
        style={[styles.flashOverlay, { opacity: flashAnim }]}
        pointerEvents="none"
      />

      {/* Clapper overlay */}
      {showClap && (
        <Animated.View
          style={[
            styles.clapOverlay,
            {
              opacity: clapAnim,
              transform: [
                {
                  scale: clapAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1.3, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.clapEmoji}>{"\uD83C\uDFAC"}</Text>
        </Animated.View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Text style={styles.logo}>{"\uD83C\uDFA5"} Movietastic</Text>
        <Text style={styles.tagline}>Lights · Camera · Action</Text>

        {/* Film ticker */}
        <View style={styles.ticker}>
          <Text style={styles.tickerText}>
            {"\uD83C\uDFAC"} Pick · Start · Move · Done · Cut! · {"\uD83C\uDF9E\uFE0F"}{" "}
            {"\uD83C\uDFAC"} Pick · Start · Move · Done · Cut!
          </Text>
        </View>

        {/* Scene */}
        <SceneStage
          charPos={charPos}
          running={running}
          picked={picked}
          done={done}
          frame={frame}
          onTouch={handleMoveChar}
          sceneRef={sceneRef}
        />

        {/* Step indicator */}
        <View style={styles.steps}>
          {["Pick Object", "Start Scene", "Press Done"].map((label, i) => (
            <View key={i} style={styles.stepRow}>
              <View
                style={[
                  styles.stepCircle,
                  step >= i + 1 && styles.stepCircleActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepNum,
                    step >= i + 1 && styles.stepNumActive,
                  ]}
                >
                  {i + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  step >= i + 1 && styles.stepLabelActive,
                ]}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>

        {/* Object picker */}
        <Text style={styles.propsTitle}>— Props —</Text>
        <View style={styles.propsGrid}>
          {PRESET_OBJECTS.map((obj) => (
            <TouchableOpacity
              key={obj.id}
              style={[
                styles.propBtn,
                picked === obj.id && styles.propBtnSelected,
              ]}
              onPress={() => handlePickObject(obj.id)}
              disabled={running}
            >
              <Text style={styles.propEmoji}>{obj.emoji}</Text>
              <Text
                style={[
                  styles.propLabel,
                  picked === obj.id && styles.propLabelSelected,
                ]}
              >
                {obj.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.startBtn, !canStart && styles.btnDisabled]}
            onPress={handleStart}
            disabled={!canStart}
          >
            <Text style={styles.startBtnText}>{"\u25B6"} Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.doneBtn, !canDone && styles.btnDisabled]}
            onPress={handleDone}
            disabled={!canDone}
          >
            <Text style={styles.doneBtnText}>{"\u2713"} Done</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.resetBtn]} onPress={handleReset}>
            <Text style={styles.resetBtnText}>{"\u21BA"} Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Info for web users */}
        {IS_WEB && (
          <Text style={styles.webNote}>
            For camera capture & save, use the Expo Go app on your phone
          </Text>
        )}

        <Text style={styles.footer}>MOVIETASTIC · EST. 2026</Text>
      </ScrollView>
    </View>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07020f",
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "web" ? 20 : 50,
  },
  logo: {
    fontFamily: FONT_SERIF,
    fontSize: 38,
    fontWeight: "700",
    color: "#ffe066",
    marginTop: 16,
    textShadowColor: "#ffe06688",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  tagline: {
    fontFamily: FONT_MONO,
    color: "#ff8fc8aa",
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  ticker: {
    width: "100%",
    maxWidth: 740,
    backgroundColor: "#ffe06611",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ffe06622",
    paddingVertical: 5,
    marginBottom: 16,
    overflow: "hidden",
  },
  tickerText: {
    fontFamily: FONT_MONO,
    color: "#ffe06688",
    fontSize: 12,
    textAlign: "center",
  },
  // Scene
  scene: {
    width: SCENE_W,
    height: SCENE_H,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#1a0535",
    borderWidth: 2,
    borderColor: "#ffe06633",
    position: "relative",
    ...(IS_WEB ? { cursor: "crosshair" } : {}),
  },
  stageFloor: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "#0d0515",
  },
  spotlight: {
    position: "absolute",
    top: 0,
    width: 100,
    height: "70%",
    backgroundColor: "#ffe06615",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  spotlightPink: { backgroundColor: "#ff8fc815" },
  spotlightBlue: { backgroundColor: "#80e8ff15" },
  star: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  filmBorderTop: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 10,
    backgroundColor: "#ffe06612",
  },
  filmBorderBottom: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 10,
    backgroundColor: "#ffe06612",
  },
  // Character
  character: {
    position: "absolute",
    width: CHAR_SIZE,
    height: CHAR_SIZE + 20,
    alignItems: "center",
  },
  charHead: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#f0b07a",
    position: "relative", zIndex: 2,
  },
  charEye: {
    position: "absolute", top: 9,
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: "#1a0a2e",
  },
  charSmile: {
    position: "absolute", bottom: 6, left: 7,
    width: 14, height: 7,
    borderBottomLeftRadius: 7, borderBottomRightRadius: 7,
    borderWidth: 1.5, borderTopWidth: 0,
    borderColor: "#7a3020",
  },
  charBody: {
    width: 30, height: 28, borderRadius: 12,
    backgroundColor: "#c94080", marginTop: -4, zIndex: 1,
  },
  charArm: {
    position: "absolute", top: 26,
    width: 5, height: 20, borderRadius: 3,
    backgroundColor: "#f0b07a", zIndex: 0,
  },
  charArmLeft: { left: -2 },
  charArmRight: { right: -2 },
  charLeg: {
    position: "absolute", bottom: -8,
    width: 6, height: 18, borderRadius: 3,
    backgroundColor: "#c94080", zIndex: 0,
  },
  charLegLeft: { left: 14 },
  charLegRight: { right: 14 },
  heldObject: {
    position: "absolute", right: -22, top: 14, fontSize: 22,
  },
  // Overlays
  doneOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(7,2,20,0.75)",
    alignItems: "center", justifyContent: "center",
  },
  doneStarEmoji: { fontSize: 48, marginBottom: 8 },
  doneTitle: {
    fontFamily: FONT_SERIF,
    color: "#ffe066", fontSize: 26, fontStyle: "italic",
  },
  doneSubtitle: {
    fontFamily: FONT_MONO,
    color: "#ff8fc8", fontSize: 13, letterSpacing: 2, marginTop: 4,
  },
  touchHint: {
    position: "absolute", bottom: 14, left: 0, right: 0,
    alignItems: "center",
  },
  touchHintText: {
    fontFamily: FONT_MONO, color: "#ffe066aa", fontSize: 11,
    backgroundColor: "rgba(7,2,20,0.6)",
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 6, overflow: "hidden", letterSpacing: 1,
  },
  pickHint: {
    position: "absolute", bottom: 14, left: 0, right: 0,
    alignItems: "center",
  },
  pickHintText: {
    fontFamily: FONT_MONO, color: "#ffe066aa", fontSize: 11,
    backgroundColor: "rgba(7,2,20,0.6)",
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 6, overflow: "hidden", letterSpacing: 1,
  },
  // Steps
  steps: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", gap: 12,
    marginTop: 16, marginBottom: 16,
  },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  stepCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#ffe06622",
    alignItems: "center", justifyContent: "center",
  },
  stepCircleActive: { backgroundColor: "#ffe066" },
  stepNum: {
    fontFamily: FONT_MONO, fontSize: 12, fontWeight: "700",
    color: "#ffe06655",
  },
  stepNumActive: { color: "#1a0a2e" },
  stepLabel: {
    fontFamily: FONT_MONO, fontSize: 10,
    color: "#ffe06633", letterSpacing: 1, textTransform: "uppercase",
  },
  stepLabelActive: { color: "#ffe066cc" },
  // Props
  propsTitle: {
    fontFamily: FONT_MONO, color: "#ff8fc8aa", fontSize: 12,
    letterSpacing: 3, textTransform: "uppercase", marginBottom: 10,
  },
  propsGrid: {
    flexDirection: "row", flexWrap: "wrap",
    justifyContent: "center", gap: 10, marginBottom: 16,
  },
  propBtn: {
    borderWidth: 2, borderColor: "transparent", borderRadius: 14,
    padding: 10, alignItems: "center",
    backgroundColor: "#1a0a2e", minWidth: 72,
  },
  propBtnSelected: {
    borderColor: "#ffe066", backgroundColor: "#2a1050",
    shadowColor: "#ffe066",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 12,
  },
  propEmoji: { fontSize: 28 },
  propLabel: {
    fontFamily: FONT_MONO, fontSize: 10,
    color: "#ffe06677", letterSpacing: 1, marginTop: 4,
  },
  propLabelSelected: { color: "#ffe066" },
  // Actions
  actions: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", gap: 12, marginBottom: 16,
  },
  actionBtn: { borderRadius: 10, paddingVertical: 13, paddingHorizontal: 28 },
  startBtn: {
    backgroundColor: "#ffe066",
    shadowColor: "#ffe066",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },
  startBtnText: {
    fontFamily: FONT_MONO, fontSize: 15, fontWeight: "700",
    color: "#1a0a2e", letterSpacing: 2, textTransform: "uppercase",
  },
  doneBtn: {
    backgroundColor: "#4060ff",
    shadowColor: "#80e8ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12,
  },
  doneBtnText: {
    fontFamily: FONT_MONO, fontSize: 15, fontWeight: "700",
    color: "white", letterSpacing: 2, textTransform: "uppercase",
  },
  resetBtn: {
    borderWidth: 1, borderColor: "#ffe06644",
    backgroundColor: "transparent",
    paddingVertical: 8, paddingHorizontal: 18,
  },
  resetBtnText: {
    fontFamily: FONT_MONO, fontSize: 13,
    color: "#ffe066aa", letterSpacing: 1,
  },
  btnDisabled: { opacity: 0.3 },
  // Footer
  webNote: {
    fontFamily: FONT_MONO, color: "#80e8ff66", fontSize: 11,
    letterSpacing: 1, marginBottom: 8, textAlign: "center",
  },
  footer: {
    fontFamily: FONT_MONO, color: "#ffe06633", fontSize: 12,
    letterSpacing: 2, marginTop: 8,
  },
  // Flash
  flashOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "white", zIndex: 999,
  },
  // Clapper
  clapOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center", zIndex: 998,
  },
  clapEmoji: { fontSize: 80 },
});
