import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { EMOTIONS } from "../data/emotions";
import { COLORS, FONT_MONO, SIZES } from "../theme";

export default function EmotionPicker({ selectedId, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How Do They Feel?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* "Auto" option — uses motion-based expression */}
        <TouchableOpacity
          style={[styles.card, !selectedId && styles.cardActive]}
          onPress={() => onSelect(null)}
        >
          <Text style={styles.emoji}>{"\uD83C\uDFAD"}</Text>
          <Text style={[styles.label, !selectedId && styles.labelActive]}>Auto</Text>
        </TouchableOpacity>

        {EMOTIONS.map((emotion) => (
          <TouchableOpacity
            key={emotion.id}
            style={[styles.card, selectedId === emotion.id && styles.cardActive]}
            onPress={() => onSelect(emotion.id)}
          >
            <Text style={styles.emoji}>{emotion.emoji}</Text>
            <Text style={[styles.label, selectedId === emotion.id && styles.labelActive]}>
              {emotion.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12, width: "100%", maxWidth: 700 },
  title: {
    fontFamily: FONT_MONO, fontSize: SIZES.textLabel, fontWeight: "700",
    color: COLORS.pink || "#FF8FC8", textAlign: "center", marginBottom: 8, letterSpacing: 1,
  },
  scroll: { paddingHorizontal: 4, gap: 8, justifyContent: "center" },
  card: {
    width: 64, height: 64, borderRadius: SIZES.radiusSmall,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  cardActive: {
    borderColor: COLORS.coral, borderWidth: 3,
    shadowColor: COLORS.coral, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6,
    backgroundColor: COLORS.coral + "12",
  },
  emoji: { fontSize: 24, marginBottom: 2 },
  label: {
    fontFamily: FONT_MONO, fontSize: 9, fontWeight: "700",
    color: COLORS.textMuted,
  },
  labelActive: { color: COLORS.coral },
});
