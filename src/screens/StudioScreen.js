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
import EmotionPicker from "../components/EmotionPicker";
import SpeechBubbleEditor from "../components/SpeechBubbleEditor";
import SoundPicker from "../components/SoundPicker";
import StorySpark from "../components/StorySpark";
import CameraEffectPicker from "../components/CameraEffectPicker";
import { useRecorder } from "../hooks/useRecorder";
import { interpolate } from "../hooks/usePlayback";
import { useVoiceOver } from "../hooks/useVoiceOver";
import { CHARACTERS } from "../data/characters";
import { COLORS, FONT_MONO, FONT_SERIF, SIZES } from "../theme";

const DEFAULT_POS = { x: 40, y: SCENE_H / 2 - CHAR_SIZE / 2 };

function defaultPos(index) {
  return {
    x: Math.min(40 + index * 120, SCENE_W - CHAR_SIZE - 10),
    y: SCENE_H / 2 - CHAR_SIZE / 2,
  };
}

function getActorData(scene, actorIndex) {
  if (actorIndex === 0) {
    return {
      characterId: scene.characterId, propId: scene.propId, keyframes: scene.keyframes,
      emotionId: scene.emotionId, bubbleText: scene.bubbleText, bubbleType: scene.bubbleType,
    };
  }
  const extra = (scene.extraActors || [])[actorIndex - 1];
  return extra || { characterId: null, propId: null, keyframes: [], emotionId: null, bubbleText: "", bubbleType: "speech" };
}

function getAllActors(scene) {
  const main = {
    characterId: scene.characterId, propId: scene.propId, keyframes: scene.keyframes,
    emotionId: scene.emotionId, bubbleText: scene.bubbleText, bubbleType: scene.bubbleType,
  };
  return [main, ...(scene.extraActors || [])];
}

const GUIDANCE = {
  pick: "Pick a character and set up your scene below",
  ready: "Hit \"Action!\" to start recording",
  recording: "Move your mouse (or finger) to direct the character!",
  done: "Great take! Hit \"Play\" to watch, or \"Re-record\" to try again",
  voiced: "Scene complete! Add more scenes or hit \"Preview\"",
};

// Tool panels that can be expanded/collapsed
const TOOL_PANELS = [
  { id: "emotion", label: "Feelings", emoji: "\uD83D\uDE04" },
  { id: "bubble", label: "Speech", emoji: "\uD83D\uDCAC" },
  { id: "sound", label: "Sounds", emoji: "\uD83D\uDD0A" },
  { id: "camera", label: "Camera", emoji: "\uD83C\uDFA5" },
  { id: "spark", label: "Story Spark", emoji: "\uD83C\uDFB2" },
];

export default function StudioScreen({ state, dispatch, onPreview, onHome }) {
  const { movie, ui } = state;
  const scene = movie.scenes[movie.activeSceneIndex];
  const activeActorIndex = ui.activeActorIndex || 0;
  const allActors = getAllActors(scene);
  const activeActor = getActorData(scene, activeActorIndex);

  const [charPos, setCharPos] = useState({ ...DEFAULT_POS });
  const [frame, setFrame] = useState(0);
  const [done, setDone] = useState(false);
  const [showClap, setShowClap] = useState(false);
  const [motion, setMotion] = useState("idle");
  const [facing, setFacing] = useState("right");
  const [playPositions, setPlayPositions] = useState(null);
  const [playMotions, setPlayMotions] = useState([]);
  const [playFacings, setPlayFacings] = useState([]);
  const [activePanel, setActivePanel] = useState(null);

  const clapAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const prevPosRef = useRef({ ...DEFAULT_POS });
  const speedHistoryRef = useRef([]);
  const playIntervalRef = useRef(null);
  const playPrevPosRef = useRef([]);
  const playHistRef = useRef([]);

  const recorder = useRecorder();
  const voiceOver = useVoiceOver();

  useEffect(() => {
    voiceOver.loadVoiceOver(scene.voiceOverUri);
  }, [movie.activeSceneIndex]);

  const sceneId = scene.id;
  useEffect(() => {
    const currentScene = movie.scenes[movie.activeSceneIndex];
    if (!currentScene) return;
    const actor = getActorData(currentScene, activeActorIndex);
    if (actor.keyframes.length > 0) {
      const last = actor.keyframes[actor.keyframes.length - 1];
      setCharPos({ x: last.x, y: last.y });
      setDone(true);
    } else {
      setCharPos(defaultPos(activeActorIndex));
      setDone(false);
    }
    setPlayPositions(null);
    speedHistoryRef.current = [];
    prevPosRef.current = defaultPos(activeActorIndex);
  }, [sceneId, activeActorIndex]);

  useEffect(() => {
    if (ui.mode === "recording" || ui.mode === "playing") {
      const interval = setInterval(() => setFrame((f) => (f + 1) % 1000), 33);
      return () => clearInterval(interval);
    }
  }, [ui.mode]);

  useEffect(() => {
    if (ui.mode !== "recording" && ui.mode !== "playing") {
      setMotion("idle");
      return;
    }
    const dx = charPos.x - prevPosRef.current.x;
    const dy = charPos.y - prevPosRef.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    prevPosRef.current = { ...charPos };
    const hist = speedHistoryRef.current;
    hist.push({ speed, dy, dx });
    if (hist.length > 5) hist.shift();
    const avgSpeed = hist.reduce((s, h) => s + h.speed, 0) / hist.length;
    const avgDy = hist.reduce((s, h) => s + h.dy, 0) / hist.length;
    const avgDx = hist.reduce((s, h) => s + (h.dx || 0), 0) / hist.length;
    if (avgDx > 1.5) setFacing("right");
    else if (avgDx < -1.5) setFacing("left");
    if (avgDy < -4 && avgSpeed > 3) setMotion("jump");
    else if (avgSpeed > 8) setMotion("run");
    else if (avgSpeed > 1.5) setMotion("walk");
    else setMotion("idle");
  }, [charPos, ui.mode]);

  useEffect(() => {
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, []);

  const getGuidance = () => {
    if (ui.mode === "recording") return GUIDANCE.recording;
    if (done && voiceOver.hasVoiceOver) return GUIDANCE.voiced;
    if (done) return GUIDANCE.done;
    if (activeActor.characterId) return GUIDANCE.ready;
    return GUIDANCE.pick;
  };

  // ── Handlers ──

  const handlePickProp = (propId) => {
    if (ui.mode !== "idle") return;
    dispatch({ type: "SET_PROP", propId });
    setDone(false);
  };

  const handlePickBackground = (bgId) => dispatch({ type: "SET_BACKGROUND", backgroundId: bgId });
  const handlePickCharacter = (charId) => dispatch({ type: "SET_CHARACTER", characterId: charId });

  const handleSelectActor = (index) => {
    if (ui.mode !== "idle") return;
    dispatch({ type: "SET_ACTIVE_ACTOR", index });
  };

  const handleAddActor = () => {
    if (ui.mode !== "idle") return;
    dispatch({ type: "ADD_EXTRA_ACTOR" });
  };

  const handleRemoveActor = (extraIndex) => {
    if (ui.mode !== "idle") return;
    dispatch({ type: "REMOVE_EXTRA_ACTOR", index: extraIndex });
  };

  const handleStart = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setShowClap(true);
    Animated.sequence([
      Animated.timing(clapAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
      Animated.timing(clapAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start(() => {
      setShowClap(false);
      const pos = defaultPos(activeActorIndex);
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
      Animated.timing(flashAnim, { toValue: 1, duration: 100, useNativeDriver: false }),
      Animated.timing(flashAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
    ]).start();
  };

  const handlePlay = () => {
    const actors = getAllActors(scene);
    const hasAny = actors.some((a) => a.keyframes.length > 0);
    if (!hasAny) return;

    scrollRef.current?.scrollTo({ y: 0, animated: true });
    dispatch({ type: "SET_MODE", mode: "playing" });
    if (scene.voiceOverUri) voiceOver.playVoiceOver(scene.voiceOverUri);

    // Play sound effects
    if (scene.soundEffects && scene.soundEffects.length > 0) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const { synthesizeSound } = require("../data/sounds");
          scene.soundEffects.forEach((sid) => synthesizeSound(ctx, sid));
        }
      } catch (e) { /* no web audio */ }
    }

    const maxDur = Math.max(
      ...actors.map((a) => (a.keyframes.length > 0 ? a.keyframes[a.keyframes.length - 1].timestamp : 0))
    );

    playPrevPosRef.current = actors.map((a, i) =>
      a.keyframes.length > 0 ? { x: a.keyframes[0].x, y: a.keyframes[0].y } : defaultPos(i)
    );
    playHistRef.current = actors.map(() => []);

    const startTime = Date.now();
    playIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= maxDur) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
        setPlayPositions(null);
        dispatch({ type: "SET_MODE", mode: "idle" });
        return;
      }

      const positions = [];
      const motions = [];
      const facings = [];

      actors.forEach((actor, idx) => {
        if (actor.keyframes.length === 0) {
          positions.push(defaultPos(idx));
          motions.push("idle");
          facings.push(idx === 0 ? "right" : "left");
          return;
        }

        const pos = interpolate(actor.keyframes, elapsed);
        positions.push(pos);

        const prev = playPrevPosRef.current[idx] || pos;
        const dx = pos.x - prev.x;
        const dy = pos.y - prev.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        playPrevPosRef.current[idx] = { ...pos };

        const hist = playHistRef.current[idx];
        hist.push({ speed, dy, dx });
        if (hist.length > 5) hist.shift();
        const avgSpeed = hist.reduce((s, h) => s + h.speed, 0) / hist.length;
        const avgDy = hist.reduce((s, h) => s + h.dy, 0) / hist.length;
        const avgDx = hist.reduce((s, h) => s + (h.dx || 0), 0) / hist.length;

        facings.push(avgDx > 1.5 ? "right" : avgDx < -1.5 ? "left" : (facings[idx] || "right"));
        if (avgDy < -4 && avgSpeed > 3) motions.push("jump");
        else if (avgSpeed > 8) motions.push("run");
        else if (avgSpeed > 1.5) motions.push("walk");
        else motions.push("idle");
      });

      setPlayPositions(positions);
      setPlayMotions(motions);
      setPlayFacings(facings);

      if (positions[activeActorIndex]) {
        setCharPos(positions[activeActorIndex]);
      }
    }, 33);
  };

  const handleReRecord = () => {
    dispatch({ type: "SET_KEYFRAMES", keyframes: [] });
    setDone(false);
    dispatch({ type: "SET_STEP", step: 1 });
    setCharPos(defaultPos(activeActorIndex));
  };

  const handleMoveChar = (x, y) => {
    setCharPos({ x, y });
    recorder.recordPosition(x, y);
  };

  const handleRecordVoice = async () => { await voiceOver.startRecording(); };
  const handleStopVoiceRecord = async () => {
    const uri = await voiceOver.stopRecording();
    if (uri) dispatch({ type: "SET_VOICE_OVER", uri });
  };
  const handleDeleteVoice = () => {
    voiceOver.deleteVoiceOver();
    dispatch({ type: "SET_VOICE_OVER", uri: null });
  };

  const handleAddScene = () => {
    dispatch({ type: "ADD_SCENE" });
    setCharPos({ ...DEFAULT_POS });
    setDone(false);
    setPlayPositions(null);
  };

  const handleSelectScene = (index) => dispatch({ type: "SET_ACTIVE_SCENE", index });
  const handleDeleteScene = (index) => dispatch({ type: "DELETE_SCENE", index });

  // New feature handlers
  const handleSetEmotion = (emotionId) => dispatch({ type: "SET_EMOTION", emotionId });
  const handleSetBubbleText = (text) => dispatch({ type: "SET_BUBBLE_TEXT", text });
  const handleSetBubbleType = (bubbleType) => dispatch({ type: "SET_BUBBLE_TYPE", bubbleType });
  const handleToggleSound = (soundId) => dispatch({ type: "TOGGLE_SOUND_EFFECT", soundId });
  const handleSetCameraEffect = (effectId) => dispatch({ type: "SET_CAMERA_EFFECT", effectId });

  const togglePanel = (panelId) => {
    setActivePanel(activePanel === panelId ? null : panelId);
  };

  // ── Computed ──
  const canStart = ui.mode === "idle" && !done;
  const canReRecord = done && ui.mode === "idle";
  const canDone = ui.mode === "recording";
  const canPlay = allActors.some((a) => a.keyframes.length > 0) && ui.mode === "idle";
  const canPreview = movie.scenes.some((s) => getAllActors(s).some((a) => a.keyframes.length > 0));
  const isRecording = ui.mode === "recording";
  const anyDone = allActors.some((a) => a.keyframes.length > 0);

  const extraActorsToRender = allActors
    .map((actor, idx) => {
      if (idx === activeActorIndex) return null;
      let pos;
      if (playPositions && playPositions[idx]) {
        pos = playPositions[idx];
      } else if (actor.keyframes.length > 0) {
        const last = actor.keyframes[actor.keyframes.length - 1];
        pos = { x: last.x, y: last.y };
      } else {
        pos = defaultPos(idx);
      }
      return {
        characterId: actor.characterId,
        propId: actor.propId,
        x: pos.x,
        y: pos.y,
        motion: playMotions[idx] || "idle",
        facing: playFacings[idx] || (idx < activeActorIndex ? "right" : "left"),
        emotionId: actor.emotionId,
        bubbleText: actor.bubbleText,
        bubbleType: actor.bubbleType,
      };
    })
    .filter(Boolean);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.flashOverlay, { opacity: flashAnim }]} pointerEvents="none" />
      {showClap && (
        <Animated.View
          style={[styles.clapOverlay, {
            opacity: clapAnim,
            transform: [{ scale: clapAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.3, 1] }) }],
          }]}
        >
          <Text style={styles.clapEmoji}>{"\uD83C\uDFAC"}</Text>
        </Animated.View>
      )}

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onHome}>
            <Text style={styles.backBtnText}>{"<"} Home</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>Studio</Text>
          {canPreview ? (
            <TouchableOpacity style={styles.previewBtn} onPress={onPreview}>
              <Text style={styles.previewBtnText}>Preview</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 80 }} />}
        </View>

        {/* Guidance */}
        <View style={[styles.guidanceBanner, isRecording && styles.guidanceBannerRec]}>
          <Text style={[styles.guidanceText, isRecording && styles.guidanceTextRec]}>
            {getGuidance()}
          </Text>
        </View>

        <StepIndicator currentStep={ui.step} />

        {/* ── Cast Strip ── */}
        <View style={styles.castSection}>
          <Text style={styles.castTitle}>Your Cast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castScroll}>
            {allActors.map((actor, idx) => {
              const charData = CHARACTERS.find((c) => c.id === actor.characterId);
              const isActive = idx === activeActorIndex;
              const hasRecording = actor.keyframes.length > 0;
              return (
                <TouchableOpacity
                  key={`actor-${idx}-${actor.characterId}`}
                  style={[
                    styles.castCard,
                    isActive && styles.castCardActive,
                    { backgroundColor: (charData?.bodyColor || COLORS.teal) + "18" },
                  ]}
                  onPress={() => handleSelectActor(idx)}
                >
                  <View style={styles.castAvatar}>
                    <View style={[styles.castAvatarBody, { backgroundColor: charData?.bodyColor || COLORS.teal }]}>
                      <View style={[styles.castAvatarHead, { backgroundColor: charData?.skinColor || "#FFD5B8" }]} />
                    </View>
                  </View>
                  <Text style={[styles.castName, isActive && { color: COLORS.coral }]}>
                    {charData?.name || "Actor"}
                  </Text>
                  {hasRecording && (
                    <View style={styles.castCheckBadge}>
                      <Text style={styles.castCheckText}>OK</Text>
                    </View>
                  )}
                  {/* Show emotion/bubble indicators */}
                  {actor.emotionId && (
                    <View style={styles.castEmotionBadge}>
                      <Text style={{ fontSize: 8 }}>
                        {require("../data/emotions").EMOTIONS.find(e => e.id === actor.emotionId)?.emoji || ""}
                      </Text>
                    </View>
                  )}
                  {idx > 0 && ui.mode === "idle" && (
                    <TouchableOpacity
                      style={styles.castRemove}
                      onPress={() => handleRemoveActor(idx - 1)}
                    >
                      <Text style={styles.castRemoveText}>x</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.castAdd} onPress={handleAddActor}>
              <Text style={styles.castAddText}>+</Text>
              <Text style={styles.castAddLabel}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Stage */}
        <View style={styles.stageContainer}>
          <SceneStage
            charPos={charPos}
            propId={activeActor.propId}
            characterId={activeActor.characterId}
            backgroundId={scene.backgroundId}
            done={done}
            frame={frame}
            onTouch={handleMoveChar}
            onCut={handleDone}
            mode={ui.mode}
            motion={playPositions ? (playMotions[activeActorIndex] || motion) : motion}
            facing={playPositions ? (playFacings[activeActorIndex] || facing) : facing}
            extraActors={extraActorsToRender}
            emotionId={activeActor.emotionId}
            bubbleText={activeActor.bubbleText}
            bubbleType={activeActor.bubbleType}
            cameraEffect={scene.cameraEffect}
            cameraProgress={0}
          />
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {canStart && (
            <TouchableOpacity style={[styles.actionBtn, styles.startBtn]} onPress={handleStart}>
              <Text style={styles.actionBtnText}>ACTION!</Text>
            </TouchableOpacity>
          )}
          {canDone && (
            <TouchableOpacity style={[styles.actionBtn, styles.doneBtn]} onPress={handleDone}>
              <Text style={styles.actionBtnText}>CUT!</Text>
            </TouchableOpacity>
          )}
          {canPlay && (
            <TouchableOpacity style={[styles.actionBtn, styles.playBtn]} onPress={handlePlay}>
              <Text style={styles.actionBtnText}>PLAY ALL</Text>
            </TouchableOpacity>
          )}
          {canReRecord && (
            <TouchableOpacity style={[styles.actionBtn, styles.reRecordBtn]} onPress={handleReRecord}>
              <Text style={styles.reRecordBtnText}>RE-RECORD</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Voice Over */}
        {anyDone && (
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

        <SceneTimeline
          scenes={movie.scenes}
          activeIndex={movie.activeSceneIndex}
          onSelect={handleSelectScene}
          onAdd={handleAddScene}
          onDelete={handleDeleteScene}
        />

        {/* ── Creative Tools Toolbar ── */}
        {ui.mode === "idle" && (
          <View style={styles.toolbarSection}>
            <Text style={styles.toolbarTitle}>Creative Tools</Text>
            <View style={styles.toolbarRow}>
              {TOOL_PANELS.map((panel) => {
                const isActive = activePanel === panel.id;
                return (
                  <TouchableOpacity
                    key={panel.id}
                    style={[styles.toolbarBtn, isActive && styles.toolbarBtnActive]}
                    onPress={() => togglePanel(panel.id)}
                  >
                    <Text style={styles.toolbarEmoji}>{panel.emoji}</Text>
                    <Text style={[styles.toolbarLabel, isActive && styles.toolbarLabelActive]}>
                      {panel.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Expanded panel content */}
            {activePanel === "emotion" && (
              <EmotionPicker selectedId={activeActor.emotionId} onSelect={handleSetEmotion} />
            )}
            {activePanel === "bubble" && (
              <SpeechBubbleEditor
                bubbleText={activeActor.bubbleText}
                bubbleType={activeActor.bubbleType || "speech"}
                onChangeText={handleSetBubbleText}
                onChangeType={handleSetBubbleType}
              />
            )}
            {activePanel === "sound" && (
              <SoundPicker
                selectedSounds={scene.soundEffects}
                onToggleSound={handleToggleSound}
              />
            )}
            {activePanel === "camera" && (
              <CameraEffectPicker
                selectedId={scene.cameraEffect || "none"}
                onSelect={handleSetCameraEffect}
              />
            )}
            {activePanel === "spark" && (
              <StorySpark
                sceneIndex={movie.activeSceneIndex}
                totalScenes={movie.scenes.length}
              />
            )}
          </View>
        )}

        {/* Pickers for active actor */}
        {ui.mode === "idle" && (
          <>
            <BackgroundPicker selectedId={scene.backgroundId} onSelect={handlePickBackground} />
            <CharacterPicker
              selectedId={activeActor.characterId}
              onSelect={handlePickCharacter}
              label={activeActorIndex === 0 ? "Pick Your Star!" : `Pick Actor ${activeActorIndex + 1}`}
            />
            <PropPicker
              selectedId={activeActor.propId}
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
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: {
    alignItems: "center", paddingBottom: 40, paddingHorizontal: 20,
    paddingTop: Platform.OS === "web" ? 20 : 50,
  },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    width: "100%", maxWidth: 700, marginBottom: 4,
  },
  backBtn: { padding: 10, minHeight: SIZES.touchMin, justifyContent: "center" },
  backBtnText: { fontFamily: FONT_MONO, fontSize: SIZES.textLabel, color: COLORS.teal, fontWeight: "700" },
  logo: { fontFamily: FONT_SERIF, fontSize: 28, fontWeight: "700", color: COLORS.coral },
  previewBtn: {
    backgroundColor: COLORS.purple, paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 20, minHeight: SIZES.touchMin, justifyContent: "center",
  },
  previewBtnText: { fontFamily: FONT_MONO, fontSize: SIZES.textBody, fontWeight: "700", color: "#fff" },
  guidanceBanner: {
    backgroundColor: COLORS.teal + "18", borderRadius: SIZES.radiusSmall,
    paddingVertical: 10, paddingHorizontal: 16, marginBottom: 4,
    width: "100%", maxWidth: 700, borderLeftWidth: 4, borderLeftColor: COLORS.teal,
  },
  guidanceBannerRec: { backgroundColor: COLORS.danger + "18", borderLeftColor: COLORS.danger },
  guidanceText: {
    fontFamily: FONT_MONO, fontSize: SIZES.textBody, color: COLORS.textDark,
    fontWeight: "600", textAlign: "center",
  },
  guidanceTextRec: { color: COLORS.danger },
  stageContainer: { alignItems: "center", marginBottom: 12 },

  // Cast strip
  castSection: { marginBottom: 10, width: "100%", maxWidth: 700 },
  castTitle: {
    fontFamily: FONT_MONO, fontSize: SIZES.textLabel, fontWeight: "700",
    color: COLORS.purple, textAlign: "center", marginBottom: 6, letterSpacing: 1,
  },
  castScroll: { paddingHorizontal: 4, gap: 8, justifyContent: "center" },
  castCard: {
    width: 72, height: 72, borderRadius: SIZES.radiusSmall,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center", paddingVertical: 4,
  },
  castCardActive: {
    borderWidth: 3, borderColor: COLORS.coral,
    shadowColor: COLORS.coral, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  castAvatar: { alignItems: "center", marginBottom: 2 },
  castAvatarBody: { width: 26, height: 18, borderRadius: 8, alignItems: "center" },
  castAvatarHead: { width: 18, height: 18, borderRadius: 9, marginTop: -8 },
  castName: { fontFamily: FONT_MONO, fontSize: 9, fontWeight: "700", color: COLORS.textMuted, marginTop: 2 },
  castCheckBadge: {
    position: "absolute", top: 2, right: 2,
    backgroundColor: COLORS.teal, borderRadius: 6,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  castCheckText: { fontSize: 8, color: "#fff", fontWeight: "700", fontFamily: FONT_MONO },
  castEmotionBadge: {
    position: "absolute", bottom: 2, right: 2,
  },
  castRemove: {
    position: "absolute", top: -6, left: -6,
    backgroundColor: COLORS.danger, width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  castRemoveText: { color: "#fff", fontSize: 12, fontWeight: "700", marginTop: -1 },
  castAdd: {
    width: 72, height: 72, borderRadius: SIZES.radiusSmall,
    borderWidth: 2, borderColor: COLORS.teal, borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
    backgroundColor: COLORS.teal + "11",
  },
  castAddText: { fontSize: 22, color: COLORS.teal, fontWeight: "700" },
  castAddLabel: { fontFamily: FONT_MONO, fontSize: 10, color: COLORS.teal, fontWeight: "700" },

  // Actions
  actions: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: 12, marginBottom: 12, flexWrap: "wrap",
  },
  actionBtn: { borderRadius: 50, paddingVertical: 14, paddingHorizontal: 28, minHeight: SIZES.touchMin },
  actionBtnText: { fontFamily: FONT_MONO, fontSize: SIZES.textLabel, fontWeight: "700", color: "#fff", letterSpacing: 1 },
  startBtn: {
    backgroundColor: COLORS.coral, shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  doneBtn: {
    backgroundColor: COLORS.teal, shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  playBtn: {
    backgroundColor: COLORS.purple, shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  reRecordBtn: { backgroundColor: "transparent", borderWidth: 2, borderColor: COLORS.coral },
  reRecordBtnText: { fontFamily: FONT_MONO, fontSize: SIZES.textBody, fontWeight: "700", color: COLORS.coral, letterSpacing: 1 },

  // Creative Tools Toolbar
  toolbarSection: {
    width: "100%", maxWidth: 700, marginBottom: 16,
  },
  toolbarTitle: {
    fontFamily: FONT_SERIF, fontSize: SIZES.textSubtitle, fontWeight: "700",
    color: COLORS.textDark, textAlign: "center", marginBottom: 8,
  },
  toolbarRow: {
    flexDirection: "row", justifyContent: "center", gap: 6,
    flexWrap: "wrap", marginBottom: 12,
  },
  toolbarBtn: {
    flexDirection: "column", alignItems: "center", gap: 2,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: SIZES.radiusSmall, borderWidth: 2, borderColor: COLORS.border,
    backgroundColor: COLORS.white, minWidth: 58,
  },
  toolbarBtnActive: {
    borderColor: COLORS.coral, backgroundColor: COLORS.coral + "10",
    shadowColor: COLORS.coral, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  toolbarEmoji: { fontSize: 20 },
  toolbarLabel: { fontFamily: FONT_MONO, fontSize: 9, fontWeight: "700", color: COLORS.textMuted },
  toolbarLabelActive: { color: COLORS.coral },

  footer: { fontFamily: FONT_MONO, color: COLORS.textMuted, fontSize: SIZES.textSmall, letterSpacing: 2, marginTop: 8 },
  flashOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "white", zIndex: 999 },
  clapOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", zIndex: 998 },
  clapEmoji: { fontSize: 80 },
});
