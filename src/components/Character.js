import { View, Text, StyleSheet } from "react-native";
import { CHARACTERS, DEFAULT_CHARACTER_ID } from "../data/characters";

const CHAR_SIZE = 50;

export { CHAR_SIZE };

export default function Character({ x, y, running, pickedEmoji, frame, characterId }) {
  const bob = running ? Math.sin(frame * 0.22) * 4 : 0;
  const legSwing = running ? Math.sin(frame * 0.28) * 12 : 0;

  const char = CHARACTERS.find((c) => c.id === characterId) ||
    CHARACTERS.find((c) => c.id === DEFAULT_CHARACTER_ID);

  return (
    <View style={[styles.character, { left: x, top: y + bob }]}>
      <View style={[styles.charHead, { backgroundColor: char.skinColor }]}>
        <View style={[styles.charEye, { left: 8 }]} />
        <View style={[styles.charEye, { right: 8 }]} />
        <View style={styles.charSmile} />
      </View>
      <View style={[styles.charBody, { backgroundColor: char.bodyColor }]} />
      <View
        style={[
          styles.charArm,
          styles.charArmLeft,
          { backgroundColor: char.skinColor },
          running && { transform: [{ rotate: `${legSwing}deg` }] },
        ]}
      />
      <View
        style={[
          styles.charArm,
          styles.charArmRight,
          { backgroundColor: char.skinColor },
          running && { transform: [{ rotate: `${-legSwing}deg` }] },
        ]}
      />
      <View
        style={[
          styles.charLeg,
          styles.charLegLeft,
          { backgroundColor: char.bodyColor },
          { transform: [{ rotate: `${legSwing}deg` }] },
        ]}
      />
      <View
        style={[
          styles.charLeg,
          styles.charLegRight,
          { backgroundColor: char.bodyColor },
          { transform: [{ rotate: `${-legSwing}deg` }] },
        ]}
      />
      {pickedEmoji && (
        <Text style={styles.heldObject}>{pickedEmoji}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  character: {
    position: "absolute",
    width: CHAR_SIZE,
    height: CHAR_SIZE + 20,
    alignItems: "center",
  },
  charHead: {
    width: 28, height: 28, borderRadius: 14,
    position: "relative", zIndex: 2,
  },
  charEye: {
    position: "absolute", top: 9,
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: "#1a0a2e",
  },
  charSmile: {
    position: "absolute", bottom: 6, left: 7,
    width: 14, height: 7,
    borderBottomLeftRadius: 7, borderBottomRightRadius: 7,
    borderWidth: 1.5, borderTopWidth: 0,
    borderColor: "#7a3020",
  },
  charBody: {
    width: 30, height: 28, borderRadius: 12,
    marginTop: -4, zIndex: 1,
  },
  charArm: {
    position: "absolute", top: 26,
    width: 5, height: 20, borderRadius: 3,
    zIndex: 0,
  },
  charArmLeft: { left: -2 },
  charArmRight: { right: -2 },
  charLeg: {
    position: "absolute", bottom: -8,
    width: 6, height: 18, borderRadius: 3,
    zIndex: 0,
  },
  charLegLeft: { left: 14 },
  charLegRight: { right: 14 },
  heldObject: {
    position: "absolute", right: -22, top: 14, fontSize: 22,
  },
});
