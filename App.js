import { StatusBar } from "expo-status-bar";
import { useMovieReducer } from "./src/hooks/useMovieReducer";
import { DEMO_MOVIE } from "./src/data/demoMovie";
import HomeScreen from "./src/screens/HomeScreen";
import StudioScreen from "./src/screens/StudioScreen";
import PreviewScreen from "./src/screens/PreviewScreen";
import { IS_WEB } from "./src/theme";

// Auto-save helper
function autoSave(movie) {
  if (!IS_WEB) return;
  try {
    const stripped = {
      ...movie,
      savedAt: Date.now(),
      scenes: movie.scenes.map((s) => ({ ...s, voiceOverUri: null })),
    };
    const raw = localStorage.getItem("movietastic_saved");
    const saved = raw ? JSON.parse(raw) : [];
    const idx = saved.findIndex((m) => m.title === movie.title);
    if (idx >= 0) saved[idx] = stripped;
    else saved.unshift(stripped);
    localStorage.setItem("movietastic_saved", JSON.stringify(saved.slice(0, 10)));
  } catch (e) { /* ignore */ }
}

export default function App() {
  const [state, dispatch] = useMovieReducer();

  const goHome = () => dispatch({ type: "SET_SCREEN", screen: "home" });
  const goStudio = () => dispatch({ type: "SET_SCREEN", screen: "studio" });
  const goPreview = () => {
    // Auto-save when previewing
    autoSave(state.movie);
    dispatch({ type: "SET_SCREEN", screen: "preview" });
  };

  const handleNewMovie = () => {
    dispatch({ type: "RESET_MOVIE" });
    goStudio();
  };

  const handleDemoMovie = () => {
    dispatch({ type: "LOAD_MOVIE", movie: DEMO_MOVIE });
  };

  const handleLoadMovie = (movie) => {
    dispatch({ type: "LOAD_MOVIE", movie });
  };

  return (
    <>
      <StatusBar style={state.ui.screen === "preview" ? "light" : "dark"} />
      {state.ui.screen === "home" && (
        <HomeScreen
          onNewMovie={handleNewMovie}
          onDemoMovie={handleDemoMovie}
          onLoadMovie={handleLoadMovie}
        />
      )}
      {state.ui.screen === "studio" && (
        <StudioScreen
          state={state}
          dispatch={dispatch}
          onPreview={goPreview}
          onHome={() => {
            // Auto-save when leaving studio
            const hasContent = state.movie.scenes.some(s =>
              s.keyframes.length > 0 || (s.extraActors || []).some(a => a.keyframes.length > 0)
            );
            if (hasContent) autoSave(state.movie);
            goHome();
          }}
        />
      )}
      {state.ui.screen === "preview" && (
        <PreviewScreen
          movie={state.movie}
          onBack={goStudio}
          onHome={goHome}
        />
      )}
    </>
  );
}
