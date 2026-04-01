import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { getSparkForScene } from "../data/storyPrompts";
import { COLORS, FONT_MONO, FONT_SERIF, SIZES } from "../theme";

export default function StorySpark({ sceneIndex, totalScenes }) {
  const [spark, setSpark] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleSpark = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // Dice spin animation
    Animated.sequence([
      // Spin the dice
      Animated.parallel([
        Animated.timing(spinAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 300, useNativeDriver: false }),
      ]),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start(() => {
      spinAnim.setValue(0);
      const newSpark = getSparkForScene(sceneIndex, totalScenes);
      setSpark(newSpark);
      setIsSpinning(false);

      // Fade in the result
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
    });
  };

  const spinRotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Story Spark</Text>
        <Text style={styles.subtitle}>Need an idea? Roll the magic dice!</Text>
      </View>

      <TouchableOpacity style={styles.diceBtn} onPress={handleSpark} activeOpacity={0.7}>
        <Animated.Text
          style={[
            styles.diceEmoji,
            { transform: [{ rotate: spinRotate }, { scale: scaleAnim }] },
          ]}
        >
          {"\uD83C\uDFB2"}
        </Animated.Text>
        <Text style={styles.diceBtnText}>
          {spark ? "Roll Again!" : "Roll for an Idea!"}
        </Text>
      </TouchableOpacity>

      {spark && (
        <Animated.View style={[styles.sparkCard, { opacity: fadeAnim }]}>
          <Text style={styles.sparkEmoji}>{spark.emoji}</Text>
          <Text style={styles.sparkText}>{spark.text}</Text>
          <Text style={styles.sparkHint}>
            {sceneIndex === 0 ? "Great opening!" : sceneIndex >= totalScenes - 1 ? "Epic ending!" : "Plot twist!"}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12, width: "100%", maxWidth: 700,
    alignItems: "center",
  },
  header: { alignItems: "center", marginBottom: 8 },
  title: {
    fontFamily: FONT_MONO, fontSize: SIZES.textLabel, fontWeight: "700",
    color: COLORS.purple, letterSpacing: 1,
  },
  subtitle: {
    fontFamily: FONT_MONO, fontSize: 10, color: COLORS.textMuted,
  },
  diceBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: COLORS.purple + "18",
    paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 50, borderWidth: 2, borderColor: COLORS.purple,
  },
  diceEmoji: { fontSize: 28 },
  diceBtnText: {
    fontFamily: FONT_MONO, fontSize: SIZES.textBody, fontWeight: "700",
    color: COLORS.purple,
  },
  sparkCard: {
    marginTop: 10, padding: 14,
    backgroundColor: COLORS.purple + "12",
    borderRadius: SIZES.radius,
    borderLeftWidth: 4, borderLeftColor: COLORS.purple,
    width: "100%",
    alignItems: "center",
  },
  sparkEmoji: { fontSize: 32, marginBottom: 6 },
  sparkText: {
    fontFamily: FONT_SERIF, fontSize: 16, fontWeight: "600",
    color: COLORS.textDark, textAlign: "center", lineHeight: 22,
    fontStyle: "italic",
  },
  sparkHint: {
    fontFamily: FONT_MONO, fontSize: 10, fontWeight: "700",
    color: COLORS.purple, marginTop: 6, letterSpacing: 1,
  },
});
