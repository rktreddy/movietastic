import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from "react-native";
import { SOUNDS, synthesizeSound } from "../data/sounds";
import { COLORS, FONT_MONO, SIZES } from "../theme";
import { IS_WEB } from "../theme";

export default function SoundPicker({ selectedSounds, onToggleSound }) {
  const [playingId, setPlayingId] = useState(null);
  const audioCtxRef = useRef(null);
  const bounceAnims = useRef({});

  // Lazy init audio context
  const getAudioCtx = () => {
    if (!audioCtxRef.current && IS_WEB) {
      try {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { /* no web audio */ }
    }
    return audioCtxRef.current;
  };

  const handlePreview = (soundId) => {
    const ctx = getAudioCtx();
    if (!ctx) return;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === "suspended") ctx.resume();

    setPlayingId(soundId);
    const dur = synthesizeSound(ctx, soundId);

    // Bounce animation
    if (!bounceAnims.current[soundId]) {
      bounceAnims.current[soundId] = new Animated.Value(1);
    }
    Animated.sequence([
      Animated.timing(bounceAnims.current[soundId], { toValue: 1.2, duration: 100, useNativeDriver: false }),
      Animated.timing(bounceAnims.current[soundId], { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start();

    setTimeout(() => setPlayingId(null), dur * 1000);
  };

  const handleToggle = (soundId) => {
    onToggleSound(soundId);
  };

  const selected = selectedSounds || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sound Effects</Text>
      <Text style={styles.subtitle}>Tap to preview, long-press to add to scene</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {SOUNDS.map((sound) => {
          const isSelected = selected.includes(sound.id);
          const isPlaying = playingId === sound.id;
          const scaleAnim = bounceAnims.current[sound.id] || new Animated.Value(1);

          return (
            <Animated.View key={sound.id} style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                  isPlaying && styles.cardPlaying,
                ]}
                onPress={() => handlePreview(sound.id)}
                onLongPress={() => handleToggle(sound.id)}
              >
                <Text style={styles.emoji}>{sound.emoji}</Text>
                <Text style={[styles.label, isSelected && styles.labelSelected]}>
                  {sound.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>ON</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
      {selected.length > 0 && (
        <Text style={styles.selectedCount}>
          {selected.length} sound{selected.length !== 1 ? "s" : ""} in this scene
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12, width: "100%", maxWidth: 700 },
  title: {
    fontFamily: FONT_MONO, fontSize: SIZES.textLabel, fontWeight: "700",
    color: COLORS.blue || "#60A5FA", textAlign: "center", marginBottom: 2, letterSpacing: 1,
  },
  subtitle: {
    fontFamily: FONT_MONO, fontSize: 10, color: COLORS.textMuted,
    textAlign: "center", marginBottom: 8,
  },
  scroll: { paddingHorizontal: 4, gap: 8 },
  card: {
    width: 64, height: 64, borderRadius: SIZES.radiusSmall,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  cardSelected: {
    borderColor: COLORS.blue || "#60A5FA", borderWidth: 3,
    backgroundColor: (COLORS.blue || "#60A5FA") + "15",
  },
  cardPlaying: {
    backgroundColor: COLORS.yellow + "30",
    borderColor: COLORS.yellow,
  },
  emoji: { fontSize: 22, marginBottom: 2 },
  label: {
    fontFamily: FONT_MONO, fontSize: 8, fontWeight: "700",
    color: COLORS.textMuted,
  },
  labelSelected: { color: COLORS.blue || "#60A5FA" },
  checkBadge: {
    position: "absolute", top: 2, right: 2,
    backgroundColor: COLORS.blue || "#60A5FA", borderRadius: 6,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  checkText: { fontSize: 7, color: "#fff", fontWeight: "700", fontFamily: FONT_MONO },
  selectedCount: {
    fontFamily: FONT_MONO, fontSize: 11, color: COLORS.blue || "#60A5FA",
    textAlign: "center", marginTop: 6, fontWeight: "600",
  },
});
