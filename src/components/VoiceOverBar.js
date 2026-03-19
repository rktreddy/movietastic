import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONT_MONO, SIZES } from "../theme";

export default function VoiceOverBar({
  isRecording,
  isPlaying,
  hasVoiceOver,
  supported,
  onRecord,
  onStopRecord,
  onPlay,
  onDelete,
}) {
  if (!supported) {
    return (
      <View style={styles.container}>
        <Text style={styles.unsupported}>
          Voice over not available on this device
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Over</Text>
      <View style={styles.row}>
        {!isRecording ? (
          <TouchableOpacity
            style={[styles.btn, styles.recordBtn]}
            onPress={onRecord}
            disabled={isPlaying}
          >
            <View style={styles.recDot} />
            <Text style={styles.btnText}>Record</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, styles.stopBtn]}
            onPress={onStopRecord}
          >
            <View style={styles.stopSquare} />
            <Text style={styles.btnTextLight}>Stop</Text>
          </TouchableOpacity>
        )}

        {hasVoiceOver && (
          <>
            <TouchableOpacity
              style={[styles.btn, styles.playBtn]}
              onPress={onPlay}
              disabled={isRecording}
            >
              <Text style={styles.btnText}>
                {isPlaying ? "\u23F8" : "\u25B6"} Play
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.deleteBtn]}
              onPress={onDelete}
              disabled={isRecording || isPlaying}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 12,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: SIZES.radiusSmall,
    minHeight: SIZES.touchMin,
    gap: 6,
  },
  recordBtn: {
    backgroundColor: COLORS.danger,
  },
  stopBtn: {
    backgroundColor: "#333",
  },
  playBtn: {
    backgroundColor: COLORS.teal,
  },
  deleteBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  stopSquare: {
    width: 10,
    height: 10,
    backgroundColor: "#fff",
  },
  btnText: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    fontWeight: "700",
    color: "#fff",
  },
  btnTextLight: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    fontWeight: "700",
    color: "#fff",
  },
  deleteBtnText: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  unsupported: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
});
