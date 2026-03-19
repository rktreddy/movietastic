import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_MONO, SIZES } from "../theme";

const STEPS = ["Pick Stuff", "Action!", "Cut!"];

export default function StepIndicator({ currentStep }) {
  return (
    <View style={styles.container}>
      {STEPS.map((label, i) => (
        <View key={i} style={styles.stepRow}>
          <View
            style={[
              styles.circle,
              currentStep >= i + 1 && styles.circleActive,
            ]}
          >
            <Text
              style={[
                styles.num,
                currentStep >= i + 1 && styles.numActive,
              ]}
            >
              {currentStep > i + 1 ? "\u2713" : i + 1}
            </Text>
          </View>
          <Text
            style={[
              styles.label,
              currentStep >= i + 1 && styles.labelActive,
            ]}
          >
            {label}
          </Text>
          {i < STEPS.length - 1 && (
            <View style={[styles.line, currentStep > i + 1 && styles.lineActive]} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    gap: 4,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  circleActive: {
    backgroundColor: COLORS.teal,
  },
  num: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  numActive: { color: COLORS.white },
  label: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textSmall,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  labelActive: { color: COLORS.teal },
  line: {
    width: 20,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 2,
  },
  lineActive: {
    backgroundColor: COLORS.teal,
  },
});
