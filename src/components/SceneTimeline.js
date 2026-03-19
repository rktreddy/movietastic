import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { BACKGROUNDS } from "../data/backgrounds";
import { COLORS, FONT_MONO, SIZES } from "../theme";

export default function SceneTimeline({ scenes, activeIndex, onSelect, onAdd, onDelete }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scenes</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {scenes.map((scene, i) => {
          const bg = BACKGROUNDS.find((b) => b.id === scene.backgroundId);
          const isActive = i === activeIndex;
          return (
            <TouchableOpacity
              key={scene.id}
              style={[
                styles.card,
                { backgroundColor: bg?.skyColor || "#87CEEB" },
                isActive && styles.cardActive,
              ]}
              onPress={() => onSelect(i)}
            >
              <Text style={styles.sceneNum}>{i + 1}</Text>
              <Text style={styles.sceneEmoji}>{bg?.emoji || "\uD83C\uDFAC"}</Text>
              {scene.keyframes.length > 0 && (
                <View style={styles.recordedBadge}>
                  <Text style={styles.recordedText}>{"\u2713"}</Text>
                </View>
              )}
              {scenes.length > 1 && isActive && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onDelete(i)}
                >
                  <Text style={styles.deleteText}>{"\u00D7"}</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={styles.addCard} onPress={onAdd}>
          <Text style={styles.addText}>+</Text>
          <Text style={styles.addLabel}>Add</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textLabel,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 8,
    textAlign: "center",
  },
  scroll: {
    paddingHorizontal: 4,
    gap: 10,
    justifyContent: "center",
  },
  card: {
    width: 70,
    height: 70,
    borderRadius: SIZES.radiusSmall,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardActive: {
    borderColor: COLORS.coral,
    borderWidth: 3,
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  sceneNum: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sceneEmoji: { fontSize: 22 },
  recordedBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: COLORS.teal,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  recordedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  deleteBtn: {
    position: "absolute",
    top: -2,
    left: -2,
    backgroundColor: COLORS.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginTop: -1,
  },
  addCard: {
    width: 70,
    height: 70,
    borderRadius: SIZES.radiusSmall,
    borderWidth: 2,
    borderColor: COLORS.teal,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.teal + "11",
  },
  addText: {
    fontSize: 24,
    color: COLORS.teal,
    fontWeight: "700",
  },
  addLabel: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    color: COLORS.teal,
    fontWeight: "700",
  },
});
