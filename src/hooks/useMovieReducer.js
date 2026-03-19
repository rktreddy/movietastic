import { useReducer } from "react";
import { DEFAULT_BACKGROUND_ID } from "../data/backgrounds";
import { DEFAULT_CHARACTER_ID } from "../data/characters";

let nextSceneId = 1;

function createScene() {
  return {
    id: nextSceneId++,
    backgroundId: DEFAULT_BACKGROUND_ID,
    characterId: DEFAULT_CHARACTER_ID,
    propId: null,
    keyframes: [],
    voiceOverUri: null,
    duration: 0,
  };
}

const initialState = {
  movie: {
    title: "My Movie",
    scenes: [createScene()],
    activeSceneIndex: 0,
  },
  ui: {
    screen: "home", // home | studio | preview
    mode: "idle", // idle | recording | playing
    step: 0,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_SCREEN":
      return { ...state, ui: { ...state.ui, screen: action.screen } };

    case "SET_MODE":
      return { ...state, ui: { ...state.ui, mode: action.mode } };

    case "SET_STEP":
      return { ...state, ui: { ...state.ui, step: action.step } };

    case "ADVANCE_STEP":
      return {
        ...state,
        ui: { ...state.ui, step: Math.max(state.ui.step, action.step) },
      };

    case "SET_BACKGROUND": {
      const scenes = [...state.movie.scenes];
      scenes[state.movie.activeSceneIndex] = {
        ...scenes[state.movie.activeSceneIndex],
        backgroundId: action.backgroundId,
      };
      return { ...state, movie: { ...state.movie, scenes } };
    }

    case "SET_CHARACTER": {
      const scenes = [...state.movie.scenes];
      scenes[state.movie.activeSceneIndex] = {
        ...scenes[state.movie.activeSceneIndex],
        characterId: action.characterId,
      };
      return { ...state, movie: { ...state.movie, scenes } };
    }

    case "SET_PROP": {
      const scenes = [...state.movie.scenes];
      scenes[state.movie.activeSceneIndex] = {
        ...scenes[state.movie.activeSceneIndex],
        propId: action.propId,
      };
      return { ...state, movie: { ...state.movie, scenes } };
    }

    case "SET_KEYFRAMES": {
      const scenes = [...state.movie.scenes];
      const scene = scenes[state.movie.activeSceneIndex];
      scenes[state.movie.activeSceneIndex] = {
        ...scene,
        keyframes: action.keyframes,
        duration: action.keyframes.length > 0
          ? action.keyframes[action.keyframes.length - 1].timestamp
          : 0,
      };
      return { ...state, movie: { ...state.movie, scenes } };
    }

    case "SET_VOICE_OVER": {
      const scenes = [...state.movie.scenes];
      scenes[state.movie.activeSceneIndex] = {
        ...scenes[state.movie.activeSceneIndex],
        voiceOverUri: action.uri,
      };
      return { ...state, movie: { ...state.movie, scenes } };
    }

    case "ADD_SCENE": {
      const newScene = createScene();
      const scenes = [...state.movie.scenes, newScene];
      return {
        ...state,
        movie: {
          ...state.movie,
          scenes,
          activeSceneIndex: scenes.length - 1,
        },
        ui: { ...state.ui, step: 0, mode: "idle" },
      };
    }

    case "SET_ACTIVE_SCENE":
      return {
        ...state,
        movie: { ...state.movie, activeSceneIndex: action.index },
        ui: { ...state.ui, step: 0, mode: "idle" },
      };

    case "DELETE_SCENE": {
      if (state.movie.scenes.length <= 1) return state;
      const scenes = state.movie.scenes.filter((_, i) => i !== action.index);
      const activeIndex = Math.min(
        state.movie.activeSceneIndex,
        scenes.length - 1
      );
      return {
        ...state,
        movie: { ...state.movie, scenes, activeSceneIndex: activeIndex },
        ui: { ...state.ui, step: 0, mode: "idle" },
      };
    }

    case "SET_TITLE":
      return {
        ...state,
        movie: { ...state.movie, title: action.title },
      };

    case "LOAD_MOVIE": {
      nextSceneId = Math.max(...action.movie.scenes.map((s) => s.id)) + 1;
      return {
        ...state,
        movie: { ...action.movie, activeSceneIndex: 0 },
        ui: { screen: "preview", mode: "idle", step: 3 },
      };
    }

    case "RESET_MOVIE":
      nextSceneId = 1;
      return {
        ...initialState,
        movie: { ...initialState.movie, scenes: [createScene()] },
      };

    default:
      return state;
  }
}

export function useMovieReducer() {
  return useReducer(reducer, initialState);
}
