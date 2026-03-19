import { StatusBar } from "expo-status-bar";
import { useMovieReducer } from "./src/hooks/useMovieReducer";
import { DEMO_MOVIE } from "./src/data/demoMovie";
import HomeScreen from "./src/screens/HomeScreen";
import StudioScreen from "./src/screens/StudioScreen";
import PreviewScreen from "./src/screens/PreviewScreen";

export default function App() {
  const [state, dispatch] = useMovieReducer();

  const goHome = () => dispatch({ type: "SET_SCREEN", screen: "home" });
  const goStudio = () => dispatch({ type: "SET_SCREEN", screen: "studio" });
  const goPreview = () => dispatch({ type: "SET_SCREEN", screen: "preview" });

  const handleNewMovie = () => {
    dispatch({ type: "RESET_MOVIE" });
    goStudio();
  };

  const handleDemoMovie = () => {
    dispatch({ type: "LOAD_MOVIE", movie: DEMO_MOVIE });
  };

  return (
    <>
      <StatusBar style={state.ui.screen === "preview" ? "light" : "dark"} />
      {state.ui.screen === "home" && (
        <HomeScreen onNewMovie={handleNewMovie} onDemoMovie={handleDemoMovie} />
      )}
      {state.ui.screen === "studio" && (
        <StudioScreen
          state={state}
          dispatch={dispatch}
          onPreview={goPreview}
          onHome={goHome}
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
