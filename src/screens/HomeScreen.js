import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { COLORS, FONT_MONO, FONT_SERIF, SIZES, IS_WEB } from "../theme";

// Save/Load helpers using localStorage (web) — gracefully degrade elsewhere
function getSavedMovies() {
  if (!IS_WEB) return [];
  try {
    const raw = localStorage.getItem("movietastic_saved");
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function saveMovieToStorage(movie) {
  if (!IS_WEB) return;
  try {
    const saved = getSavedMovies();
    // Strip voice over URIs (blob URLs don't persist)
    const stripped = {
      ...movie,
      savedAt: Date.now(),
      scenes: movie.scenes.map((s) => ({ ...s, voiceOverUri: null })),
    };
    // Replace if same title exists, else add
    const idx = saved.findIndex((m) => m.title === movie.title);
    if (idx >= 0) saved[idx] = stripped;
    else saved.unshift(stripped);
    // Keep max 10
    localStorage.setItem("movietastic_saved", JSON.stringify(saved.slice(0, 10)));
  } catch (e) { /* storage full or unavailable */ }
}

function deleteSavedMovie(index) {
  if (!IS_WEB) return;
  try {
    const saved = getSavedMovies();
    saved.splice(index, 1);
    localStorage.setItem("movietastic_saved", JSON.stringify(saved));
  } catch (e) { /* ignore */ }
}

function HowToGuide({ onClose }) {
  return (
    <View style={styles.guideOverlay}>
      <ScrollView contentContainerStyle={styles.guideScroll}>
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>How to Make a Movie</Text>

          <Text style={styles.guideSectionTitle}>{"\uD83C\uDFAC"} Quick Start</Text>
          <View style={styles.guideSteps}>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>1. </Text>
              <Text style={styles.guideBold}>Pick a Place</Text> - Choose a
              background (park, beach, space, castle...)
            </Text>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>2. </Text>
              <Text style={styles.guideBold}>Pick Your Star</Text> - Choose a character.
              Try Simba, Nala, or other fun characters!
            </Text>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>3. </Text>
              <Text style={styles.guideBold}>Hit "Action!"</Text> - Click and drag
              to move your character around
            </Text>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>4. </Text>
              <Text style={styles.guideBold}>Hit "Cut!"</Text> - Stop recording.
              Characters walk, run, and jump based on how fast you move them
            </Text>
          </View>

          <Text style={styles.guideSectionTitle}>{"\u2728"} Creative Tools</Text>
          <View style={styles.guideSteps}>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>5. </Text>
              <Text style={styles.guideBold}>Feelings</Text> - Give your characters
              emotions! Make them happy, sad, angry, scared, or cool
            </Text>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>6. </Text>
              <Text style={styles.guideBold}>Speech Bubbles</Text> - Make characters
              talk, think, or shout! Pick a quick phrase or type your own
            </Text>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>7. </Text>
              <Text style={styles.guideBold}>Sound Effects</Text> - Add whooshes,
              boings, magic sparkles, and more! Tap to preview, long-press to add
            </Text>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>8. </Text>
              <Text style={styles.guideBold}>Camera Magic</Text> - Make the camera
              zoom, pan, shake, or go dreamy for each scene
            </Text>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>9. </Text>
              <Text style={styles.guideBold}>Story Spark</Text> - Stuck? Roll the
              magic dice for a creative idea!
            </Text>
          </View>

          <Text style={styles.guideSectionTitle}>{"\uD83E\uDD81"} Multiple Characters</Text>
          <View style={styles.guideSteps}>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>10. </Text>
              <Text style={styles.guideBold}>Add characters</Text> - Tap + Add in
              "Your Cast" to add more characters to a scene
            </Text>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>11. </Text>
              <Text style={styles.guideBold}>Record each one</Text> - Select a
              character, hit Action, and record its path
            </Text>
          </View>

          <Text style={styles.guideSectionTitle}>{"\uD83C\uDF1F"} Finishing Up</Text>
          <View style={styles.guideSteps}>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>12. </Text>
              <Text style={styles.guideBold}>Voice Over</Text> - Record narration
            </Text>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>13. </Text>
              <Text style={styles.guideBold}>More Scenes</Text> - Add scenes for a
              longer movie
            </Text>
            <Text style={styles.guideStep}>
              <Text style={styles.guideNum}>14. </Text>
              <Text style={styles.guideBold}>Preview</Text> - Watch your whole movie!
            </Text>
          </View>

          <Text style={styles.guideTip}>
            Tip: Your movies save automatically! Find them on the home screen.
          </Text>

          <TouchableOpacity style={styles.guideCloseBtn} onPress={onClose}>
            <Text style={styles.guideCloseBtnText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export default function HomeScreen({ onNewMovie, onDemoMovie, onLoadMovie }) {
  const [showGuide, setShowGuide] = useState(false);
  const [savedMovies, setSavedMovies] = useState([]);

  useEffect(() => {
    setSavedMovies(getSavedMovies());
  }, []);

  const handleDelete = (index) => {
    deleteSavedMovie(index);
    setSavedMovies(getSavedMovies());
  };

  const handleLoad = (movie) => {
    if (onLoadMovie) onLoadMovie(movie);
  };

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
          <Text style={styles.feature}>{"\uD83E\uDD81"} 16 characters with emotions & expressions</Text>
          <Text style={styles.feature}>{"\uD83D\uDCAC"} Speech bubbles — make characters talk!</Text>
          <Text style={styles.feature}>{"\uD83D\uDD0A"} Sound effects — whoosh, boing, magic & more</Text>
          <Text style={styles.feature}>{"\uD83C\uDFA5"} Camera magic — zoom, shake, pan, dreamy</Text>
          <Text style={styles.feature}>{"\uD83C\uDFB2"} Story Spark — roll the dice for ideas</Text>
          <Text style={styles.feature}>{"\uD83C\uDFA4"} Record your own voice overs</Text>
          <Text style={styles.feature}>{"\uD83D\uDCBE"} Auto-save your movies</Text>
        </View>

        <TouchableOpacity style={styles.newBtn} onPress={onNewMovie}>
          <Text style={styles.newBtnText}>{"\uD83C\uDFAC"} New Movie</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoBtn} onPress={onDemoMovie}>
          <Text style={styles.demoBtnText}>{"\u25B6"} Watch Lion King Demo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.howToBtn}
          onPress={() => setShowGuide(true)}
        >
          <Text style={styles.howToBtnText}>{"\u2753"} How to Make a Movie</Text>
        </TouchableOpacity>

        {/* Saved movies */}
        {savedMovies.length > 0 && (
          <View style={styles.savedSection}>
            <Text style={styles.savedTitle}>{"\uD83D\uDCBE"} Your Saved Movies</Text>
            {savedMovies.map((movie, idx) => (
              <View key={idx} style={styles.savedCard}>
                <TouchableOpacity
                  style={styles.savedInfo}
                  onPress={() => handleLoad(movie)}
                >
                  <Text style={styles.savedName}>{movie.title}</Text>
                  <Text style={styles.savedMeta}>
                    {movie.scenes.length} scene{movie.scenes.length !== 1 ? "s" : ""}
                    {movie.savedAt ? ` \u00B7 ${new Date(movie.savedAt).toLocaleDateString()}` : ""}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.savedDelete}
                  onPress={() => handleDelete(idx)}
                >
                  <Text style={styles.savedDeleteText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

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

  // Saved movies
  savedSection: {
    width: "100%",
    maxWidth: 400,
    marginTop: 20,
    marginBottom: 10,
  },
  savedTitle: {
    fontFamily: FONT_SERIF,
    fontSize: SIZES.textSubtitle,
    fontWeight: "700",
    color: COLORS.purple,
    textAlign: "center",
    marginBottom: 10,
  },
  savedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusSmall,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 8,
  },
  savedInfo: { flex: 1 },
  savedName: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textBody,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  savedMeta: {
    fontFamily: FONT_MONO,
    fontSize: SIZES.textSmall,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  savedDelete: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.danger + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  savedDeleteText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: "700",
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
    zIndex: 100,
  },
  guideScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  guideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    maxWidth: 500,
    width: "100%",
  },
  guideTitle: {
    fontFamily: FONT_SERIF,
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.coral,
    textAlign: "center",
    marginBottom: 20,
  },
  guideSectionTitle: {
    fontFamily: FONT_SERIF,
    fontSize: SIZES.textLabel,
    fontWeight: "700",
    color: COLORS.purple,
    marginTop: 12,
    marginBottom: 6,
  },
  guideSteps: {
    gap: 10,
    marginBottom: 12,
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
