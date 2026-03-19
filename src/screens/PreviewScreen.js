import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import SceneStage, { SCENE_H } from "../components/SceneStage";
import { CHAR_SIZE } from "../components/Character";
import { usePlayback } from "../hooks/usePlayback";
import { useVoiceOver } from "../hooks/useVoiceOver";
import { COLORS, FONT_MONO, FONT_SERIF, SIZES } from "../theme";

export default function PreviewScreen({ movie, onBack, onHome }) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [frame, setFrame] = useState(0);
  const [charPos, setCharPos] = useState({
    x: 40,
    y: SCENE_H / 2 - CHAR_SIZE / 2,
  });

  const playback = usePlayback();
  const voiceOver = useVoiceOver();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const scene = movie.scenes[currentSceneIndex];
  const playableScenes = movie.scenes.filter((s) => s.keyframes.length > 0);

  // Animation loop
  useEffect(() => {
    if (isPreviewPlaying) {
      const interval = setInterval(() => {
        setFrame((f) => (f + 1) % 1000);
      }, 33);
      return () => clearInterval(interval);
    }
  }, [isPreviewPlaying]);

  // Update char pos from playback
  useEffect(() => {
    if (playback.isPlaying) {
      setCharPos(playback.playbackPos);
    }
  }, [playback.playbackPos, playback.isPlaying]);

  const playScene = useCallback(
    (index) => {
      const sceneToPlay = movie.scenes[index];
      if (!sceneToPlay || sceneToPlay.keyframes.length === 0) {
        // Skip scenes without keyframes
        const nextIndex = index + 1;
        if (nextIndex < movie.scenes.length) {
          playScene(nextIndex);
        } else {
          setIsPreviewPlaying(false);
          setFinished(true);
        }
        return;
      }

      setCurrentSceneIndex(index);
      setCharPos({
        x: sceneToPlay.keyframes[0].x,
        y: sceneToPlay.keyframes[0].y,
      });

      // Fade transition
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        if (sceneToPlay.voiceOverUri) {
          voiceOver.playVoiceOver(sceneToPlay.voiceOverUri);
        }
        playback.startPlayback(sceneToPlay.keyframes, () => {
          const nextIndex = index + 1;
          if (nextIndex < movie.scenes.length) {
            playScene(nextIndex);
          } else {
            setIsPreviewPlaying(false);
            setFinished(true);
          }
        });
      });
    },
    [movie.scenes, fadeAnim, playback, voiceOver]
  );

  const handlePlayAll = () => {
    setFinished(false);
    setIsPreviewPlaying(true);
    setCurrentSceneIndex(0);
    playScene(0);
  };

  const handleStop = () => {
    playback.stopPlayback();
    voiceOver.stopVoiceOver();
    setIsPreviewPlaying(false);
  };

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
          charPos={charPos}
          running={isPreviewPlaying}
          propId={scene?.propId}
          characterId={scene?.characterId}
          backgroundId={scene?.backgroundId}
          done={false}
          frame={frame}
          onTouch={() => {}}
          mode={isPreviewPlaying ? "playing" : "idle"}
        />
      </Animated.View>

      {/* Finished overlay */}
      {finished && !isPreviewPlaying && (
        <View style={styles.finishedBanner}>
          <Text style={styles.finishedEmoji}>{"\uD83C\uDF1F"}</Text>
          <Text style={styles.finishedText}>The End!</Text>
        </View>
      )}

      <View style={styles.controls}>
        {!isPreviewPlaying ? (
          <TouchableOpacity
            style={[
              styles.playBtn,
              playableScenes.length === 0 && styles.btnDisabled,
            ]}
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
        <Text style={styles.hint}>
          Record at least one scene to preview your movie!
        </Text>
      )}

      {!isPreviewPlaying && !finished && playableScenes.length > 0 && (
        <Text style={styles.info}>
          {playableScenes.length} scene{playableScenes.length !== 1 ? "s" : ""} ready to play
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a0535",
    alignItems: "center",
    paddingTop: Platform.OS === "web" ? 20 : 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 700,
    paddingHorizontal: 20,
    marginBottom: 12,
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
  title: {
    fontFamily: FONT_SERIF,
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.yellow,
  },
  movieTitle: {
    fontFamily: FONT_SERIF,
    fontSize: 22,
    color: COLORS.white,
    marginBottom: 8,
  },
  sceneLabel: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    color: COLORS.yellow,
    marginBottom: 12,
    fontWeight: "600",
  },
  stageWrap: {
    marginBottom: 20,
  },
  finishedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  finishedEmoji: { fontSize: 28 },
  finishedText: {
    fontFamily: FONT_SERIF,
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.yellow,
  },
  controls: {
    flexDirection: "row",
    gap: 12,
  },
  playBtn: {
    backgroundColor: COLORS.coral,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    minHeight: SIZES.touchMin,
  },
  playBtnText: {
    fontFamily: FONT_MONO,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  stopBtn: {
    backgroundColor: "#333",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    minHeight: SIZES.touchMin,
  },
  stopBtnText: {
    fontFamily: FONT_MONO,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  homeBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.teal,
    minHeight: SIZES.touchMin,
  },
  homeBtnText: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    fontWeight: "700",
    color: COLORS.teal,
  },
  btnDisabled: { opacity: 0.3 },
  hint: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    color: COLORS.textMuted,
    marginTop: 20,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  info: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textSmall,
    color: COLORS.yellow + "88",
    marginTop: 12,
  },
});
