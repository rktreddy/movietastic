import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import SceneStage, { SCENE_H, SCENE_W } from "../components/SceneStage";
import { CHAR_SIZE } from "../components/Character";
import PropPicker from "../components/PropPicker";
import BackgroundPicker from "../components/BackgroundPicker";
import CharacterPicker from "../components/CharacterPicker";
import StepIndicator from "../components/StepIndicator";
import VoiceOverBar from "../components/VoiceOverBar";
import SceneTimeline from "../components/SceneTimeline";
import { useRecorder } from "../hooks/useRecorder";
import { usePlayback } from "../hooks/usePlayback";
import { useVoiceOver } from "../hooks/useVoiceOver";
import { COLORS, FONT_MONO, FONT_SERIF, SIZES } from "../theme";

const GUIDANCE = {
  pick: "Pick a place, character, and prop below to set up your scene",
  ready: "All set! Hit \"Action!\" to start recording your scene",
  recording: "Move your mouse (or finger) to direct the character around!",
  done: "Great take! Hit \"Play\" to watch it back, or \"Re-record\" to try again",
  voiced: "Scene complete! Add more scenes or hit \"Preview\" to watch your movie",
};

export default function StudioScreen({ state, dispatch, onPreview, onHome }) {
  const { movie, ui } = state;
  const scene = movie.scenes[movie.activeSceneIndex];

  const [charPos, setCharPos] = useState({
    x: 40,
    y: SCENE_H / 2 - CHAR_SIZE / 2,
  });
  const [frame, setFrame] = useState(0);
  const [done, setDone] = useState(false);
  const [showClap, setShowClap] = useState(false);

  const clapAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  const recorder = useRecorder();
  const playback = usePlayback();
  const voiceOver = useVoiceOver();

  // Load voice over when scene changes
  useEffect(() => {
    voiceOver.loadVoiceOver(scene.voiceOverUri);
  }, [movie.activeSceneIndex]);

  // Reset position when scene changes
  useEffect(() => {
    setCharPos({ x: 40, y: SCENE_H / 2 - CHAR_SIZE / 2 });
    setDone(scene.keyframes.length > 0);
    dispatch({ type: "SET_MODE", mode: "idle" });
    dispatch({
      type: "SET_STEP",
      step: scene.keyframes.length > 0 ? 3 : scene.propId ? 1 : 0,
    });
  }, [movie.activeSceneIndex]);

  // Animation loop
  useEffect(() => {
    if (ui.mode === "recording" || ui.mode === "playing") {
      const interval = setInterval(() => {
        setFrame((f) => (f + 1) % 1000);
      }, 33);
      return () => clearInterval(interval);
    }
  }, [ui.mode]);

  // Update char position during playback
  useEffect(() => {
    if (playback.isPlaying) {
      setCharPos(playback.playbackPos);
    }
  }, [playback.playbackPos, playback.isPlaying]);

  // Determine guidance text
  const getGuidance = () => {
    if (ui.mode === "recording") return GUIDANCE.recording;
    if (done && voiceOver.hasVoiceOver) return GUIDANCE.voiced;
    if (done) return GUIDANCE.done;
    if (scene.propId) return GUIDANCE.ready;
    return GUIDANCE.pick;
  };

  const handlePickProp = (propId) => {
    if (ui.mode !== "idle") return;
    dispatch({ type: "SET_PROP", propId });
    dispatch({ type: "ADVANCE_STEP", step: 1 });
    setDone(false);
  };

  const handlePickBackground = (bgId) => {
    dispatch({ type: "SET_BACKGROUND", backgroundId: bgId });
  };

  const handlePickCharacter = (charId) => {
    dispatch({ type: "SET_CHARACTER", characterId: charId });
  };

  const handleStart = () => {
    if (!scene.propId) return;

    // Scroll to top so stage is visible
    scrollRef.current?.scrollTo({ y: 0, animated: true });

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
      const pos = { x: 40, y: SCENE_H / 2 - CHAR_SIZE / 2 };
      setCharPos(pos);
      dispatch({ type: "SET_MODE", mode: "recording" });
      dispatch({ type: "SET_STEP", step: 2 });
      setDone(false);
      recorder.startRecording(pos);
    });
  };

  const handleDone = () => {
    const keyframes = recorder.stopRecording();
    dispatch({ type: "SET_KEYFRAMES", keyframes });
    dispatch({ type: "SET_MODE", mode: "idle" });
    dispatch({ type: "SET_STEP", step: 3 });
    setDone(true);

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

  const handlePlay = () => {
    if (scene.keyframes.length === 0) return;
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    dispatch({ type: "SET_MODE", mode: "playing" });
    if (scene.voiceOverUri) {
      voiceOver.playVoiceOver(scene.voiceOverUri);
    }
    playback.startPlayback(scene.keyframes, () => {
      dispatch({ type: "SET_MODE", mode: "idle" });
    });
  };

  const handleReRecord = () => {
    dispatch({ type: "SET_KEYFRAMES", keyframes: [] });
    setDone(false);
    dispatch({ type: "SET_STEP", step: 1 });
    setCharPos({ x: 40, y: SCENE_H / 2 - CHAR_SIZE / 2 });
  };

  const handleMoveChar = (x, y) => {
    setCharPos({ x, y });
    recorder.recordPosition(x, y);
  };

  const handleRecordVoice = async () => {
    await voiceOver.startRecording();
  };

  const handleStopVoiceRecord = async () => {
    const uri = await voiceOver.stopRecording();
    if (uri) {
      dispatch({ type: "SET_VOICE_OVER", uri });
    }
  };

  const handleDeleteVoice = () => {
    voiceOver.deleteVoiceOver();
    dispatch({ type: "SET_VOICE_OVER", uri: null });
  };

  const handleAddScene = () => {
    dispatch({ type: "ADD_SCENE" });
    setCharPos({ x: 40, y: SCENE_H / 2 - CHAR_SIZE / 2 });
    setDone(false);
  };

  const handleSelectScene = (index) => {
    dispatch({ type: "SET_ACTIVE_SCENE", index });
  };

  const handleDeleteScene = (index) => {
    dispatch({ type: "DELETE_SCENE", index });
  };

  const canStart = scene.propId && ui.mode === "idle" && !done;
  const canReRecord = done && ui.mode === "idle";
  const canDone = ui.mode === "recording";
  const canPlay = scene.keyframes.length > 0 && ui.mode === "idle";
  const canPreview = movie.scenes.some((s) => s.keyframes.length > 0);
  const isRecording = ui.mode === "recording";

  return (
    <View style={styles.container}>
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
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onHome}>
            <Text style={styles.backBtnText}>{"\u2190"} Home</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>{"\uD83C\uDFA5"} Studio</Text>
          {canPreview ? (
            <TouchableOpacity style={styles.previewBtn} onPress={onPreview}>
              <Text style={styles.previewBtnText}>{"\u25B6"} Preview</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </View>

        {/* Guidance banner */}
        <View style={[
          styles.guidanceBanner,
          isRecording && styles.guidanceBannerRecording,
        ]}>
          <Text style={[
            styles.guidanceText,
            isRecording && styles.guidanceTextRecording,
          ]}>
            {getGuidance()}
          </Text>
        </View>

        {/* Step indicator */}
        <StepIndicator currentStep={ui.step} />

        {/* Scene — always visible at top */}
        <View style={styles.stageContainer}>
          <SceneStage
            charPos={charPos}
            running={ui.mode !== "idle"}
            propId={scene.propId}
            characterId={scene.characterId}
            backgroundId={scene.backgroundId}
            done={done}
            frame={frame}
            onTouch={handleMoveChar}
            mode={ui.mode}
          />
        </View>

        {/* Action buttons — right below stage */}
        <View style={styles.actions}>
          {canStart && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.startBtn]}
              onPress={handleStart}
            >
              <Text style={styles.actionBtnText}>{"\uD83C\uDFAC"} Action!</Text>
            </TouchableOpacity>
          )}
          {canDone && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.doneBtn]}
              onPress={handleDone}
            >
              <Text style={styles.actionBtnText}>{"\u2702\uFE0F"} Cut!</Text>
            </TouchableOpacity>
          )}
          {canPlay && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.playBtn]}
              onPress={handlePlay}
            >
              <Text style={styles.actionBtnText}>{"\u25B6"} Play</Text>
            </TouchableOpacity>
          )}
          {canReRecord && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.reRecordBtn]}
              onPress={handleReRecord}
            >
              <Text style={styles.reRecordBtnText}>{"\u21BA"} Re-record</Text>
            </TouchableOpacity>
          )}
          {!scene.propId && ui.mode === "idle" && (
            <View style={styles.disabledActionWrap}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.startBtn, styles.btnDisabled]}
                disabled
              >
                <Text style={styles.actionBtnText}>{"\uD83C\uDFAC"} Action!</Text>
              </TouchableOpacity>
              <Text style={styles.disabledHint}>Pick a prop first!</Text>
            </View>
          )}
        </View>

        {/* Voice Over — show when scene is recorded */}
        {done && (
          <VoiceOverBar
            isRecording={voiceOver.isRecording}
            isPlaying={voiceOver.isPlayingVoice}
            hasVoiceOver={voiceOver.hasVoiceOver}
            supported={voiceOver.supported}
            onRecord={handleRecordVoice}
            onStopRecord={handleStopVoiceRecord}
            onPlay={() => voiceOver.playVoiceOver()}
            onDelete={handleDeleteVoice}
          />
        )}

        {/* Scene Timeline */}
        <SceneTimeline
          scenes={movie.scenes}
          activeIndex={movie.activeSceneIndex}
          onSelect={handleSelectScene}
          onAdd={handleAddScene}
          onDelete={handleDeleteScene}
        />

        {/* Pickers — below stage so setup doesn't crowd the action */}
        {ui.mode === "idle" && (
          <>
            <BackgroundPicker
              selectedId={scene.backgroundId}
              onSelect={handlePickBackground}
            />
            <CharacterPicker
              selectedId={scene.characterId}
              onSelect={handlePickCharacter}
            />
            <PropPicker
              selectedId={scene.propId}
              onSelect={handlePickProp}
              disabled={ui.mode !== "idle"}
            />
          </>
        )}

        <Text style={styles.footer}>MOVIETASTIC {"\u00B7"} EST. 2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "web" ? 20 : 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 700,
    marginBottom: 4,
  },
  backBtn: {
    padding: 10,
    minHeight: SIZES.touchMin,
    justifyContent: "center",
  },
  backBtnText: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textLabel,
    color: COLORS.teal,
    fontWeight: "700",
  },
  logo: {
    fontFamily: FONT_SERIF,
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.coral,
  },
  previewBtn: {
    backgroundColor: COLORS.purple,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: SIZES.touchMin,
    justifyContent: "center",
  },
  previewBtnText: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    fontWeight: "700",
    color: "#fff",
  },
  // Guidance banner
  guidanceBanner: {
    backgroundColor: COLORS.teal + "18",
    borderRadius: SIZES.radiusSmall,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 4,
    width: "100%",
    maxWidth: 700,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
  },
  guidanceBannerRecording: {
    backgroundColor: COLORS.danger + "18",
    borderLeftColor: COLORS.danger,
  },
  guidanceText: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    color: COLORS.textDark,
    fontWeight: "600",
    textAlign: "center",
  },
  guidanceTextRecording: {
    color: COLORS.danger,
  },
  stageContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  // Actions
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  actionBtn: {
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minHeight: SIZES.touchMin,
  },
  actionBtnText: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textLabel,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  startBtn: {
    backgroundColor: COLORS.coral,
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  doneBtn: {
    backgroundColor: COLORS.teal,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  playBtn: {
    backgroundColor: COLORS.purple,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  reRecordBtn: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.coral,
  },
  reRecordBtnText: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    fontWeight: "700",
    color: COLORS.coral,
    letterSpacing: 1,
  },
  btnDisabled: { opacity: 0.3 },
  disabledActionWrap: {
    alignItems: "center",
    gap: 4,
  },
  disabledHint: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textSmall,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
  footer: {
    fontFamily: FONT_MONO,
    color: COLORS.textMuted,
    fontSize: SIZES.textSmall,
    letterSpacing: 2,
    marginTop: 8,
  },
  flashOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "white",
    zIndex: 999,
  },
  clapOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 998,
  },
  clapEmoji: { fontSize: 80 },
});
