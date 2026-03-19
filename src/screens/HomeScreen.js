import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { COLORS, FONT_MONO, FONT_SERIF, SIZES } from "../theme";

function HowToGuide({ onClose }) {
  return (
    <View style={styles.guideOverlay}>
      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>How to Make a Movie</Text>

        <View style={styles.guideSteps}>
          <Text style={styles.guideStep}>
            <Text style={styles.guideNum}>1. </Text>
            <Text style={styles.guideBold}>Pick a Place</Text> - Choose where your
            scene happens (park, beach, space...)
          </Text>
          <Text style={styles.guideStep}>
            <Text style={styles.guideNum}>2. </Text>
            <Text style={styles.guideBold}>Pick Your Star</Text> - Choose a character
            to be in your movie
          </Text>
          <Text style={styles.guideStep}>
            <Text style={styles.guideNum}>3. </Text>
            <Text style={styles.guideBold}>Pick a Prop</Text> - Give your character
            something cool to hold
          </Text>
          <Text style={styles.guideStep}>
            <Text style={styles.guideNum}>4. </Text>
            <Text style={styles.guideBold}>Hit "Action!"</Text> - Start recording!
            Move your mouse (or finger) to direct the character around the stage
          </Text>
          <Text style={styles.guideStep}>
            <Text style={styles.guideNum}>5. </Text>
            <Text style={styles.guideBold}>Hit "Cut!"</Text> - Stop recording when
            your scene is done
          </Text>
          <Text style={styles.guideStep}>
            <Text style={styles.guideNum}>6. </Text>
            <Text style={styles.guideBold}>Add Voice</Text> - Record a voice over to
            narrate what's happening
          </Text>
          <Text style={styles.guideStep}>
            <Text style={styles.guideNum}>7. </Text>
            <Text style={styles.guideBold}>Add More Scenes</Text> - Tap the + button
            to add new scenes with different places and characters
          </Text>
          <Text style={styles.guideStep}>
            <Text style={styles.guideNum}>8. </Text>
            <Text style={styles.guideBold}>Preview</Text> - Watch your whole movie
            play from start to finish!
          </Text>
        </View>

        <Text style={styles.guideTip}>
          Tip: Try the demo movie first to see how it all works!
        </Text>

        <TouchableOpacity style={styles.guideCloseBtn} onPress={onClose}>
          <Text style={styles.guideCloseBtnText}>Got it!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen({ onNewMovie, onDemoMovie }) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.emoji}>{"\uD83C\uDFAC"}</Text>
        <Text style={styles.title}>Movietastic!</Text>
        <Text style={styles.tagline}>Make your own movies!</Text>

        <View style={styles.features}>
          <Text style={styles.feature}>{"\u2B50"} 10 cool characters to choose from</Text>
          <Text style={styles.feature}>{"\uD83C\uDFDE\uFE0F"} 6 awesome places to explore</Text>
          <Text style={styles.feature}>{"\uD83C\uDFA4"} Record your own voice overs</Text>
          <Text style={styles.feature}>{"\uD83C\uDFAC"} Direct the action with your finger</Text>
          <Text style={styles.feature}>{"\uD83C\uDF1F"} Add multiple scenes to tell a story</Text>
        </View>

        <TouchableOpacity style={styles.newBtn} onPress={onNewMovie}>
          <Text style={styles.newBtnText}>{"\uD83C\uDFAC"} New Movie</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoBtn} onPress={onDemoMovie}>
          <Text style={styles.demoBtnText}>{"\u25B6"} Watch Demo Movie</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.howToBtn}
          onPress={() => setShowGuide(true)}
        >
          <Text style={styles.howToBtnText}>{"\u2753"} How to Make a Movie</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>MOVIETASTIC {"\u00B7"} EST. 2026</Text>
      </ScrollView>

      {showGuide && <HowToGuide onClose={() => setShowGuide(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "web" ? 40 : 60,
    paddingBottom: 40,
    minHeight: "100%",
  },
  emoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  title: {
    fontFamily: FONT_SERIF,
    fontSize: 44,
    fontWeight: "700",
    color: COLORS.coral,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textSubtitle,
    color: COLORS.teal,
    marginBottom: 30,
    fontWeight: "600",
  },
  features: {
    alignItems: "flex-start",
    marginBottom: 36,
    gap: 10,
  },
  feature: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  newBtn: {
    backgroundColor: COLORS.coral,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 50,
    shadowColor: COLORS.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    minHeight: SIZES.touchMin,
    marginBottom: 14,
  },
  newBtnText: {
    fontFamily: FONT_MONO,
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  demoBtn: {
    backgroundColor: COLORS.purple,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 50,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    minHeight: SIZES.touchMin,
    marginBottom: 14,
  },
  demoBtnText: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textLabel,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  howToBtn: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: COLORS.teal,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    minHeight: SIZES.touchMin,
    marginBottom: 14,
  },
  howToBtnText: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    fontWeight: "700",
    color: COLORS.teal,
  },
  footer: {
    fontFamily: FONT_MONO,
    color: COLORS.textMuted,
    fontSize: SIZES.textSmall,
    letterSpacing: 2,
    marginTop: 20,
  },
  // How-to guide overlay
  guideOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 100,
  },
  guideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    maxWidth: 500,
    width: "100%",
    maxHeight: "85%",
  },
  guideTitle: {
    fontFamily: FONT_SERIF,
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.coral,
    textAlign: "center",
    marginBottom: 20,
  },
  guideSteps: {
    gap: 12,
    marginBottom: 16,
  },
  guideStep: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    color: COLORS.textDark,
    lineHeight: 22,
  },
  guideNum: {
    fontWeight: "700",
    color: COLORS.teal,
    fontSize: SIZES.textLabel,
  },
  guideBold: {
    fontWeight: "700",
    color: COLORS.coral,
  },
  guideTip: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textSmall,
    color: COLORS.purple,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  guideCloseBtn: {
    backgroundColor: COLORS.teal,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 50,
    alignSelf: "center",
    minHeight: SIZES.touchMin,
  },
  guideCloseBtnText: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textLabel,
    fontWeight: "700",
    color: "#fff",
  },
});
