import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { COLORS, FONT_MONO, SIZES } from "../theme";

const BUBBLE_TYPES = [
  { id: "speech", label: "Talk", emoji: "\uD83D\uDCAC" },
  { id: "thought", label: "Think", emoji: "\uD83D\uDCAD" },
  { id: "shout", label: "Shout", emoji: "\uD83D\uDCA5" },
];

const QUICK_PHRASES = [
  "Hello!", "Oh no!", "Wow!", "Let's go!", "Help!",
  "I did it!", "Look!", "Haha!", "Hmm...", "Yay!",
  "Wait!", "Cool!", "Uh oh!", "Follow me!", "Watch this!",
  "I'm scared!", "Over here!", "Amazing!", "Run!", "Hooray!",
];

export default function SpeechBubbleEditor({ bubbleText, bubbleType, onChangeText, onChangeType }) {
  const [showQuick, setShowQuick] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Make Them Talk!</Text>

      {/* Bubble type picker */}
      <View style={styles.typeRow}>
        {BUBBLE_TYPES.map((bt) => (
          <TouchableOpacity
            key={bt.id}
            style={[styles.typeBtn, bubbleType === bt.id && styles.typeBtnActive]}
            onPress={() => onChangeType(bt.id)}
          >
            <Text style={styles.typeEmoji}>{bt.emoji}</Text>
            <Text style={[styles.typeLabel, bubbleType === bt.id && styles.typeLabelActive]}>
              {bt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Text input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type what they say..."
          placeholderTextColor={COLORS.textMuted}
          value={bubbleText || ""}
          onChangeText={onChangeText}
          maxLength={60}
          multiline={false}
        />
        {bubbleText ? (
          <TouchableOpacity style={styles.clearBtn} onPress={() => onChangeText("")}>
            <Text style={styles.clearBtnText}>X</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Quick phrases */}
      <TouchableOpacity
        style={styles.quickToggle}
        onPress={() => setShowQuick(!showQuick)}
      >
        <Text style={styles.quickToggleText}>
          {showQuick ? "Hide Quick Phrases" : "Quick Phrases"}
        </Text>
      </TouchableOpacity>

      {showQuick && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickScroll}>
          {QUICK_PHRASES.map((phrase) => (
            <TouchableOpacity
              key={phrase}
              style={[styles.quickChip, bubbleText === phrase && styles.quickChipActive]}
              onPress={() => onChangeText(phrase)}
            >
              <Text style={[styles.quickChipText, bubbleText === phrase && styles.quickChipTextActive]}>
                {phrase}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12, width: "100%", maxWidth: 700 },
  title: {
    fontFamily: FONT_MONO, fontSize: SIZES.textLabel, fontWeight: "700",
    color: COLORS.coral, textAlign: "center", marginBottom: 8, letterSpacing: 1,
  },
  typeRow: {
    flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 10,
  },
  typeBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 2, borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  typeBtnActive: {
    borderColor: COLORS.coral, backgroundColor: COLORS.coral + "12",
  },
  typeEmoji: { fontSize: 16 },
  typeLabel: { fontFamily: FONT_MONO, fontSize: 12, fontWeight: "700", color: COLORS.textMuted },
  typeLabelActive: { color: COLORS.coral },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.white, borderRadius: SIZES.radiusSmall,
    borderWidth: 2, borderColor: COLORS.border,
    paddingHorizontal: 12, marginBottom: 8,
  },
  input: {
    flex: 1, fontFamily: FONT_MONO, fontSize: SIZES.textBody,
    color: COLORS.textDark, paddingVertical: 10, fontWeight: "600",
  },
  clearBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.danger, alignItems: "center", justifyContent: "center",
  },
  clearBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  quickToggle: {
    alignSelf: "center", paddingVertical: 4, paddingHorizontal: 12,
  },
  quickToggleText: {
    fontFamily: FONT_MONO, fontSize: 11, fontWeight: "700",
    color: COLORS.teal, textDecorationLine: "underline",
  },
  quickScroll: { paddingVertical: 6, paddingHorizontal: 4, gap: 6 },
  quickChip: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 16, backgroundColor: COLORS.yellow + "30",
    borderWidth: 1.5, borderColor: COLORS.yellow,
  },
  quickChipActive: {
    backgroundColor: COLORS.coral + "20",
    borderColor: COLORS.coral,
  },
  quickChipText: {
    fontFamily: FONT_MONO, fontSize: 12, fontWeight: "700",
    color: COLORS.textDark,
  },
  quickChipTextActive: { color: COLORS.coral },
});
