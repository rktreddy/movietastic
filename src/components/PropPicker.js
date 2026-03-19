import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { PROPS } from "../data/props";
import { COLORS, FONT_MONO, SIZES } from "../theme";

export default function PropPicker({ selectedId, onSelect, disabled }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick Something Fun!</Text>
      <View style={styles.grid}>
        {PROPS.map((prop) => (
          <TouchableOpacity
            key={prop.id}
            style={[
              styles.btn,
              selectedId === prop.id && styles.btnSelected,
            ]}
            onPress={() => onSelect(prop.id)}
            disabled={disabled}
          >
            <Text style={styles.emoji}>{prop.emoji}</Text>
            <Text
              style={[
                styles.label,
                selectedId === prop.id && styles.labelSelected,
              ]}
            >
              {prop.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: FONT_MONO,
    color: COLORS.purple,
    fontSize: SIZES.textLabel,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  btn: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSmall,
    padding: 10,
    alignItems: "center",
    backgroundColor: COLORS.white,
    minWidth: 72,
    minHeight: SIZES.touchMin,
  },
  btnSelected: {
    borderColor: COLORS.coral,
    backgroundColor: "#FFF0F0",
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emoji: { fontSize: 28 },
  label: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textSmall,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },
  labelSelected: { color: COLORS.coral },
});
