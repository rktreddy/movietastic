import { View, Text, StyleSheet } from "react-native";
import { FONT_MONO, COLORS } from "../theme";

// Speech bubble types: "speech" (talk), "thought" (think), "shout" (yell)
export default function SpeechBubble({ text, type = "speech", x, y, facing = "right" }) {
  if (!text) return null;

  const isLeft = facing === "left";
  const bubbleStyle = type === "thought" ? styles.thoughtBubble
    : type === "shout" ? styles.shoutBubble
    : styles.speechBubble;

  const textStyle = type === "shout" ? styles.shoutText : styles.bubbleText;

  return (
    <View
      style={[
        styles.container,
        { left: x, top: Math.max(0, y - 55) },
        isLeft && { alignItems: "flex-start" },
      ]}
      pointerEvents="none"
    >
      <View style={[bubbleStyle, type === "shout" && styles.shoutBorder]}>
        <Text style={textStyle} numberOfLines={2}>
          {text}
        </Text>
      </View>

      {/* Tail / dots */}
      {type === "thought" ? (
        <View style={[styles.thoughtDots, isLeft && { alignSelf: "flex-start", marginLeft: 8 }]}>
          <View style={styles.dot1} />
          <View style={styles.dot2} />
          <View style={styles.dot3} />
        </View>
      ) : (
        <View
          style={[
            styles.tail,
            isLeft && { alignSelf: "flex-start", marginLeft: 12, transform: [{ scaleX: -1 }] },
            !isLeft && { alignSelf: "flex-end", marginRight: 12 },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 50,
    maxWidth: 160,
    minWidth: 40,
    alignItems: "flex-end",
  },
  speechBubble: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: COLORS.textDark,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  thoughtBubble: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    borderStyle: "dashed",
  },
  shoutBubble: {
    backgroundColor: COLORS.yellow,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2.5,
    borderColor: COLORS.coral,
  },
  shoutBorder: {
    transform: [{ rotate: "-1deg" }],
  },
  bubbleText: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textDark,
    textAlign: "center",
  },
  shoutText: {
    fontFamily: FONT_MONO,
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.coral,
    textAlign: "center",
    textTransform: "uppercase",
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLORS.textDark,
    marginTop: -1,
  },
  thoughtDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
    alignSelf: "flex-end",
    marginRight: 8,
  },
  dot1: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.textMuted },
  dot2: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted, opacity: 0.6 },
  dot3: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textMuted, opacity: 0.3 },
});
