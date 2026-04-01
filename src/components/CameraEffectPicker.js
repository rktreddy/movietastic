import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { CAMERA_EFFECTS } from "../data/cameraEffects";
import { COLORS, FONT_MONO, SIZES } from "../theme";

export default function CameraEffectPicker({ selectedId, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Magic</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {CAMERA_EFFECTS.map((effect) => {
          const isSelected = selectedId === effect.id;
          return (
            <TouchableOpacity
              key={effect.id}
              style={[styles.card, isSelected && styles.cardActive]}
              onPress={() => onSelect(effect.id)}
            >
              <Text style={styles.emoji}>{effect.emoji}</Text>
              <Text style={[styles.label, isSelected && styles.labelActive]}>
                {effect.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12, width: "100%", maxWidth: 700 },
  title: {
    fontFamily: FONT_MONO, fontSize: SIZES.textLabel, fontWeight: "700",
    color: COLORS.teal, textAlign: "center", marginBottom: 8, letterSpacing: 1,
  },
  scroll: { paddingHorizontal: 4, gap: 8, justifyContent: "center" },
  card: {
    width: 64, height: 64, borderRadius: SIZES.radiusSmall,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  cardActive: {
    borderColor: COLORS.teal, borderWidth: 3,
    backgroundColor: COLORS.teal + "15",
    shadowColor: COLORS.teal, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 6,
  },
  emoji: { fontSize: 22, marginBottom: 2 },
  label: {
    fontFamily: FONT_MONO, fontSize: 9, fontWeight: "700",
    color: COLORS.textMuted,
  },
  labelActive: { color: COLORS.teal },
});
