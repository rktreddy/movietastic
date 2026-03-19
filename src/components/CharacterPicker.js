import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { CHARACTERS } from "../data/characters";
import { COLORS, FONT_MONO, SIZES } from "../theme";

export default function CharacterPicker({ selectedId, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick Your Star!</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {CHARACTERS.map((char) => (
          <TouchableOpacity
            key={char.id}
            style={[
              styles.card,
              { backgroundColor: char.bodyColor + "22" },
              selectedId === char.id && [styles.cardSelected, { borderColor: char.bodyColor }],
            ]}
            onPress={() => onSelect(char.id)}
          >
            <View style={[styles.avatar, { backgroundColor: char.bodyColor }]}>
              <View style={[styles.head, { backgroundColor: char.skinColor }]} />
            </View>
            <Text style={[styles.label, { color: char.bodyColor }]}>{char.name}</Text>
            <Text style={styles.emoji}>{char.emoji}</Text>
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
    color: COLORS.pink,
    fontSize: SIZES.textLabel,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: "center",
  },
  scroll: {
    paddingHorizontal: 4,
    gap: 10,
    justifyContent: "center",
  },
  card: {
    width: 80,
    height: 90,
    borderRadius: SIZES.radiusSmall,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  cardSelected: {
    borderWidth: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  avatar: {
    width: 32,
    height: 24,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 2,
  },
  head: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginTop: -10,
  },
  label: {
    fontFamily: FONT_MONO,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  emoji: {
    fontSize: 14,
  },
});
