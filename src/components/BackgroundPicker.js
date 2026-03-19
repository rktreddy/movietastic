import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { BACKGROUNDS } from "../data/backgrounds";
import { COLORS, FONT_MONO, SIZES } from "../theme";

export default function BackgroundPicker({ selectedId, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick a Place!</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {BACKGROUNDS.map((bg) => (
          <TouchableOpacity
            key={bg.id}
            style={[
              styles.card,
              { backgroundColor: bg.skyColor },
              selectedId === bg.id && styles.cardSelected,
            ]}
            onPress={() => onSelect(bg.id)}
          >
            <Text style={styles.emoji}>{bg.emoji}</Text>
            <View style={[styles.ground, { backgroundColor: bg.groundColor }]} />
            <Text style={styles.label}>{bg.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontFamily: FONT_MONO,
    color: COLORS.teal,
    fontSize: SIZES.textLabel,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: "center",
  },
  scroll: {
    paddingHorizontal: 4,
    gap: 10,
  },
  card: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radiusSmall,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  cardSelected: {
    borderColor: COLORS.teal,
    borderWidth: 3,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
  },
  emoji: { fontSize: 28, zIndex: 1 },
  label: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    marginTop: 2,
    zIndex: 1,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
