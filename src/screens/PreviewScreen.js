import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import SceneStage, { SCENE_H, SCENE_W } from "../components/SceneStage";
import { CHAR_SIZE } from "../components/Character";
import { interpolate } from "../hooks/usePlayback";
import { useVoiceOver } from "../hooks/useVoiceOver";
import { synthesizeSound } from "../data/sounds";
import { COLORS, FONT_MONO, FONT_SERIF, SIZES, IS_WEB } from "../theme";

function defaultPos(index) {
  return {
    x: Math.min(40 + index * 120, SCENE_W - CHAR_SIZE - 10),
    y: SCENE_H / 2 - CHAR_SIZE / 2,
  };
}

function getAllActors(scene) {
  const main = {
    characterId: scene.characterId, propId: scene.propId, keyframes: scene.keyframes,
    emotionId: scene.emotionId, bubbleText: scene.bubbleText, bubbleType: scene.bubbleType,
  };
  return [main, ...(scene.extraActors || [])];
}

export default function PreviewScreen({ movie, onBack, onHome }) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [frame, setFrame] = useState(0);
  const [mainPos, setMainPos] = useState({ ...defaultPos(0) });
  const [mainMotion, setMainMotion] = useState("idle");
  const [mainFacing, setMainFacing] = useState("right");
  const [extraRenders, setExtraRenders] = useState([]);
  const [cameraProgress, setCameraProgress] = useState(0);

  const playbackRef = useRef(null);
  const prevPosRef = useRef([]);
  const histRef = useRef([]);
  const audioCtxRef = useRef(null);

  const voiceOver = useVoiceOver();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const scene = movie.scenes[currentSceneIndex];
  const playableScenes = movie.scenes.filter((s) =>
    getAllActors(s).some((a) => a.keyframes.length > 0)
  );

  useEffect(() => {
    if (isPreviewPlaying) {
      const interval = setInterval(() => setFrame((f) => (f + 1) % 1000), 33);
      return () => clearInterval(interval);
    }
  }, [isPreviewPlaying]);

  useEffect(() => {
    return () => { if (playbackRef.current) clearInterval(playbackRef.current); };
  }, []);

  // Lazy init audio context
  const getAudioCtx = () => {
    if (!audioCtxRef.current && IS_WEB) {
      try {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { /* no web audio */ }
    }
    return audioCtxRef.current;
  };

  const playScene = useCallback(
    (index) => {
      const sceneToPlay = movie.scenes[index];
      if (!sceneToPlay) {
        setIsPreviewPlaying(false);
        setFinished(true);
        return;
      }

      const actors = getAllActors(sceneToPlay);
      const hasAny = actors.some((a) => a.keyframes.length > 0);
      if (!hasAny) {
        if (index + 1 < movie.scenes.length) playScene(index + 1);
        else { setIsPreviewPlaying(false); setFinished(true); }
        return;
      }

      setCurrentSceneIndex(index);
      setCameraProgress(0);
      setMainPos(actors[0].keyframes.length > 0
        ? { x: actors[0].keyframes[0].x, y: actors[0].keyframes[0].y }
        : defaultPos(0));
      setMainMotion("idle");
      setMainFacing("right");
      setExtraRenders([]);

      prevPosRef.current = actors.map((a, i) =>
        a.keyframes.length > 0 ? { x: a.keyframes[0].x, y: a.keyframes[0].y } : defaultPos(i)
      );
      histRef.current = actors.map(() => []);

      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      ]).start(() => {
        if (sceneToPlay.voiceOverUri) voiceOver.playVoiceOver(sceneToPlay.voiceOverUri);

        // Play sound effects for this scene
        if (sceneToPlay.soundEffects && sceneToPlay.soundEffects.length > 0) {
          const ctx = getAudioCtx();
          if (ctx) {
            if (ctx.state === "suspended") ctx.resume();
            sceneToPlay.soundEffects.forEach((sid) => {
              try { synthesizeSound(ctx, sid); } catch (e) { /* ignore */ }
            });
          }
        }

        const maxDur = Math.max(
          ...actors.map((a) => a.keyframes.length > 0 ? a.keyframes[a.keyframes.length - 1].timestamp : 0)
        );
        if (maxDur === 0) {
          if (index + 1 < movie.scenes.length) playScene(index + 1);
          else { setIsPreviewPlaying(false); setFinished(true); }
          return;
        }

        const startTime = Date.now();
        playbackRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          if (elapsed >= maxDur) {
            clearInterval(playbackRef.current);
            playbackRef.current = null;
            if (index + 1 < movie.scenes.length) playScene(index + 1);
            else { setIsPreviewPlaying(false); setFinished(true); }
            return;
          }

          // Camera progress
          setCameraProgress(elapsed / maxDur);

          const extras = [];
          actors.forEach((actor, idx) => {
            const pos = actor.keyframes.length > 0
              ? interpolate(actor.keyframes, elapsed) : defaultPos(idx);

            const prev = prevPosRef.current[idx] || pos;
            const dx = pos.x - prev.x;
            const dy = pos.y - prev.y;
            const speed = Math.sqrt(dx * dx + dy * dy);
            prevPosRef.current[idx] = { ...pos };
            const hist = histRef.current[idx];
            hist.push({ speed, dy, dx });
            if (hist.length > 5) hist.shift();
            const avgSpeed = hist.reduce((s, h) => s + h.speed, 0) / hist.length;
            const avgDy = hist.reduce((s, h) => s + h.dy, 0) / hist.length;
            const avgDx = hist.reduce((s, h) => s + (h.dx || 0), 0) / hist.length;

            let mot = "idle";
            if (avgDy < -4 && avgSpeed > 3) mot = "jump";
            else if (avgSpeed > 8) mot = "run";
            else if (avgSpeed > 1.5) mot = "walk";

            let fac = avgDx > 1.5 ? "right" : avgDx < -1.5 ? "left" : undefined;

            if (idx === 0) {
              setMainPos(pos);
              setMainMotion(mot);
              if (fac) setMainFacing(fac);
            } else {
              extras.push({
                characterId: actor.characterId,
                propId: actor.propId,
                x: pos.x,
                y: pos.y,
                motion: mot,
                facing: fac || (idx % 2 === 0 ? "right" : "left"),
                emotionId: actor.emotionId,
                bubbleText: actor.bubbleText,
                bubbleType: actor.bubbleType,
              });
            }
          });
          setExtraRenders(extras);
        }, 33);
      });
    },
    [movie.scenes, fadeAnim, voiceOver]
  );

  const handlePlayAll = () => {
    setFinished(false);
    setIsPreviewPlaying(true);
    playScene(0);
  };

  const handleStop = () => {
    if (playbackRef.current) { clearInterval(playbackRef.current); playbackRef.current = null; }
    voiceOver.stopVoiceOver();
    setIsPreviewPlaying(false);
    setCameraProgress(0);
  };

  const idleExtras = !isPreviewPlaying
    ? (scene?.extraActors || []).map((a, i) => ({
        characterId: a.characterId,
        propId: a.propId,
        x: a.keyframes.length > 0 ? a.keyframes[a.keyframes.length - 1].x : defaultPos(i + 1).x,
        y: a.keyframes.length > 0 ? a.keyframes[a.keyframes.length - 1].y : defaultPos(i + 1).y,
        motion: "idle",
        facing: "left",
        emotionId: a.emotionId,
        bubbleText: a.bubbleText,
        bubbleType: a.bubbleType,
      }))
    : extraRenders;

  const currentScene = movie.scenes[currentSceneIndex];
  const mainActor = currentScene ? getAllActors(currentScene)[0] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>{"\u2190"} Studio</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{"\uD83C\uDF1F"} Preview</Text>
        <View style={{ width: 80 }} />
      </View>

      <Text style={styles.movieTitle}>{movie.title}</Text>

      {isPreviewPlaying && (
        <Text style={styles.sceneLabel}>
          Scene {currentSceneIndex + 1} of {movie.scenes.length}
        </Text>
      )}

      <Animated.View style={[styles.stageWrap, { opacity: fadeAnim }]}>
        <SceneStage
          charPos={mainPos}
          propId={scene?.propId}
          characterId={scene?.characterId}
          backgroundId={scene?.backgroundId}
          done={false}
          frame={frame}
          onTouch={() => {}}
          mode={isPreviewPlaying ? "playing" : "idle"}
          motion={mainMotion}
          facing={mainFacing}
          extraActors={idleExtras}
          emotionId={mainActor?.emotionId}
          bubbleText={mainActor?.bubbleText}
          bubbleType={mainActor?.bubbleType}
          cameraEffect={currentScene?.cameraEffect}
          cameraProgress={isPreviewPlaying ? cameraProgress : 0}
        />
      </Animated.View>

      {finished && !isPreviewPlaying && (
        <View style={styles.finishedBanner}>
          <Text style={styles.finishedEmoji}>{"\uD83C\uDF1F"}</Text>
          <Text style={styles.finishedText}>The End!</Text>
        </View>
      )}

      <View style={styles.controls}>
        {!isPreviewPlaying ? (
          <TouchableOpacity
            style={[styles.playBtn, playableScenes.length === 0 && styles.btnDisabled]}
            onPress={handlePlayAll}
            disabled={playableScenes.length === 0}
          >
            <Text style={styles.playBtnText}>
              {finished ? "\u21BA Replay" : "\u25B6 Play Movie"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
            <Text style={styles.stopBtnText}>{"\u23F9"} Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      {finished && onHome && (
        <TouchableOpacity style={styles.homeBtn} onPress={onHome}>
          <Text style={styles.homeBtnText}>{"\uD83C\uDFE0"} Back to Home</Text>
        </TouchableOpacity>
      )}

      {playableScenes.length === 0 && (
        <Text style={styles.hint}>Record at least one scene to preview your movie!</Text>
      )}

      {!isPreviewPlaying && !finished && playableScenes.length > 0 && (
        <Text style={styles.info}>
          {playableScenes.length} scene{playableScenes.length !== 1 ? "s" : ""} ready
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a0535", alignItems: "center", paddingTop: Platform.OS === "web" ? 20 : 50 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    width: "100%", maxWidth: 700, paddingHorizontal: 20, marginBottom: 12,
  },
  backBtn: { padding: 10, minHeight: SIZES.touchMin, justifyContent: "center" },
  backBtnText: { fontFamily: FONT_MONO, fontSize: SIZES.textLabel, color: COLORS.teal, fontWeight: "700" },
  title: { fontFamily: FONT_SERIF, fontSize: 28, fontWeight: "700", color: COLORS.yellow },
  movieTitle: { fontFamily: FONT_SERIF, fontSize: 22, color: COLORS.white, marginBottom: 8 },
  sceneLabel: { fontFamily: FONT_MONO, fontSize: SIZES.textBody, color: COLORS.yellow, marginBottom: 12, fontWeight: "600" },
  stageWrap: { marginBottom: 20 },
  finishedBanner: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  finishedEmoji: { fontSize: 28 },
  finishedText: { fontFamily: FONT_SERIF, fontSize: 24, fontWeight: "700", color: COLORS.yellow },
  controls: { flexDirection: "row", gap: 12 },
  playBtn: {
    backgroundColor: COLORS.coral, paddingVertical: 16, paddingHorizontal: 40,
    borderRadius: 50, shadowColor: COLORS.coral, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, minHeight: SIZES.touchMin,
  },
  playBtnText: { fontFamily: FONT_MONO, fontSize: 18, fontWeight: "700", color: "#fff" },
  stopBtn: { backgroundColor: "#333", paddingVertical: 16, paddingHorizontal: 40, borderRadius: 50, minHeight: SIZES.touchMin },
  stopBtnText: { fontFamily: FONT_MONO, fontSize: 18, fontWeight: "700", color: "#fff" },
  homeBtn: {
    marginTop: 16, paddingVertical: 12, paddingHorizontal: 30,
    borderRadius: 50, borderWidth: 2, borderColor: COLORS.teal, minHeight: SIZES.touchMin,
  },
  homeBtnText: { fontFamily: FONT_MONO, fontSize: SIZES.textBody, fontWeight: "700", color: COLORS.teal },
  btnDisabled: { opacity: 0.3 },
  hint: { fontFamily: FONT_MONO, fontSize: SIZES.textBody, color: COLORS.textMuted, marginTop: 20, textAlign: "center", paddingHorizontal: 20 },
  info: { fontFamily: FONT_MONO, fontSize: SIZES.textSmall, color: COLORS.yellow + "88", marginTop: 12 },
});
