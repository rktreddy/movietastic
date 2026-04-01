import { useReducer } from "react";
import { DEFAULT_BACKGROUND_ID } from "../data/backgrounds";
import { DEFAULT_CHARACTER_ID } from "../data/characters";

let nextSceneId = 1;
let nextActorId = 1;

function createScene() {
  return {
    id: nextSceneId++,
    backgroundId: DEFAULT_BACKGROUND_ID,
    characterId: DEFAULT_CHARACTER_ID,
    propId: null,
    keyframes: [],
    extraActors: [],
    voiceOverUri: null,
    duration: 0,
    // New features
    emotionId: null,          // character emotion override (null = auto from motion)
    bubbleText: "",           // speech/thought bubble text
    bubbleType: "speech",     // "speech" | "thought" | "shout"
    soundEffects: [],         // array of sound IDs to play during scene
    cameraEffect: "none",     // camera effect ID
  };
}

const initialState = {
  movie: {
    title: "My Movie",
    scenes: [createScene()],
    activeSceneIndex: 0,
  },
  ui: {
    screen: "home",
    mode: "idle",
    step: 0,
    activeActorIndex: 0,
  },
};

function computeDuration(scene) {
  let maxDur = scene.keyframes.length > 0
    ? scene.keyframes[scene.keyframes.length - 1].timestamp : 0;
  for (const a of (scene.extraActors || [])) {
    if (a.keyframes.length > 0) {
      maxDur = Math.max(maxDur, a.keyframes[a.keyframes.length - 1].timestamp);
    }
  }
  return maxDur;
}

function reducer(state, action) {
  const actorIdx = state.ui.activeActorIndex || 0;

  switch (action.type) {
    case "SET_SCREEN":
      return { ...state, ui: { ...state.ui, screen: action.screen } };

    case "SET_MODE":
      return { ...state, ui: { ...state.ui, mode: action.mode } };

    case "SET_STEP":
      return { ...state, ui: { ...state.ui, step: action.step } };

    case "ADVANCE_STEP":
      return { ...state, ui: { ...state.ui, step: Math.max(state.ui.step, action.step) } };

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
      const scene = { ...scenes[state.movie.activeSceneIndex] };
      if (actorIdx === 0) {
        scene.characterId = action.characterId;
      } else {
        const extras = [...(scene.extraActors || [])];
        if (extras[actorIdx - 1]) {
          extras[actorIdx - 1] = { ...extras[actorIdx - 1], characterId: action.characterId };
          scene.extraActors = extras;
        }
      }
      scenes[state.movie.activeSceneIndex] = scene;
      return { ...state, movie: { ...state.movie, scenes } };
    }

    case "SET_PROP": {
      const scenes = [...state.movie.scenes];
      const scene = { ...scenes[state.movie.activeSceneIndex] };
      if (actorIdx === 0) {
        scene.propId = action.propId;
      } else {
        const extras = [...(scene.extraActors || [])];
        if (extras[actorIdx - 1]) {
          extras[actorIdx - 1] = { ...extras[actorIdx - 1], propId: action.propId };
          scene.extraActors = extras;
        }
      }
      scenes[state.movie.activeSceneIndex] = scene;
      return { ...state, movie: { ...state.movie, scenes } };
    }

    case "SET_KEYFRAMES": {
      const scenes = [...state.movie.scenes];
      const scene = { ...scenes[state.movie.activeSceneIndex] };
      if (actorIdx === 0) {
        scene.keyframes = action.keyframes;
      } else {
        const extras = [...(scene.extraActors || [])];
        if (extras[actorIdx - 1]) {
          extras[actorIdx - 1] = { ...extras[actorIdx - 1], keyframes: action.keyframes };
          scene.extraActors = extras;
        }
      }
      scene.duration = computeDuration(scene);
      scenes[state.movie.activeSceneIndex] = scene;
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

    // ── New feature actions ──

    case "SET_EMOTION": {
      const scenes = [...state.movie.scenes];
      const scene = { ...scenes[state.movie.activeSceneIndex] };
      if (actorIdx === 0) {
        scene.emotionId = action.emotionId;
      } else {
        const extras = [...(scene.extraActors || [])];
        if (extras[actorIdx - 1]) {
          extras[actorIdx - 1] = { ...extras[actorIdx - 1], emotionId: action.emotionId };
          scene.extraActors = extras;
        }
      }
      scenes[state.movie.activeSceneIndex] = scene;
      return { ...state, movie: { ...state.movie, scenes } };
    }

    case "SET_BUBBLE_TEXT": {
      const scenes = [...state.movie.scenes];
      const scene = { ...scenes[state.movie.activeSceneIndex] };
      if (actorIdx === 0) {
        scene.bubbleText = action.text;
      } else {
        const extras = [...(scene.extraActors || [])];
        if (extras[actorIdx - 1]) {
          extras[actorIdx - 1] = { ...extras[actorIdx - 1], bubbleText: action.text };
          scene.extraActors = extras;
        }
      }
      scenes[state.movie.activeSceneIndex] = scene;
      return { ...state, movie: { ...state.movie, scenes } };
    }

    case "SET_BUBBLE_TYPE": {
      const scenes = [...state.movie.scenes];
      const scene = { ...scenes[state.movie.activeSceneIndex] };
      if (actorIdx === 0) {
        scene.bubbleType = action.bubbleType;
      } else {
        const extras = [...(scene.extraActors || [])];
        if (extras[actorIdx - 1]) {
          extras[actorIdx - 1] = { ...extras[actorIdx - 1], bubbleType: action.bubbleType };
          scene.extraActors = extras;
        }
      }
      scenes[state.movie.activeSceneIndex] = scene;
      return { ...state, movie: { ...state.movie, scenes } };
    }

    case "TOGGLE_SOUND_EFFECT": {
      const scenes = [...state.movie.scenes];
      const scene = { ...scenes[state.movie.activeSceneIndex] };
      const current = scene.soundEffects || [];
      if (current.includes(action.soundId)) {
        scene.soundEffects = current.filter((s) => s !== action.soundId);
      } else {
        scene.soundEffects = [...current, action.soundId];
      }
      scenes[state.movie.activeSceneIndex] = scene;
      return { ...state, movie: { ...state.movie, scenes } };
    }

    case "SET_CAMERA_EFFECT": {
      const scenes = [...state.movie.scenes];
      scenes[state.movie.activeSceneIndex] = {
        ...scenes[state.movie.activeSceneIndex],
        cameraEffect: action.effectId,
      };
      return { ...state, movie: { ...state.movie, scenes } };
    }

    // ── Existing actor/scene management ──

    case "ADD_EXTRA_ACTOR": {
      const scenes = [...state.movie.scenes];
      const scene = { ...scenes[state.movie.activeSceneIndex] };
      const extras = [...(scene.extraActors || [])];
      const usedIds = [scene.characterId, ...extras.map((a) => a.characterId)];
      const { CHARACTERS: allChars } = require("../data/characters");
      const available = allChars.filter((c) => !usedIds.includes(c.id));
      const pickChar = available.length > 0 ? available[0].id : DEFAULT_CHARACTER_ID;
      extras.push({
        id: nextActorId++,
        characterId: action.characterId || pickChar,
        propId: null,
        keyframes: [],
        emotionId: null,
        bubbleText: "",
        bubbleType: "speech",
      });
      scene.extraActors = extras;
      scenes[state.movie.activeSceneIndex] = scene;
      const newActorIndex = extras.length;
      return {
        ...state,
        movie: { ...state.movie, scenes },
        ui: { ...state.ui, activeActorIndex: newActorIndex, step: 0 },
      };
    }

    case "REMOVE_EXTRA_ACTOR": {
      const scenes = [...state.movie.scenes];
      const scene = { ...scenes[state.movie.activeSceneIndex] };
      const extras = [...(scene.extraActors || [])];
      extras.splice(action.index, 1);
      scene.extraActors = extras;
      scene.duration = computeDuration(scene);
      scenes[state.movie.activeSceneIndex] = scene;
      return {
        ...state,
        movie: { ...state.movie, scenes },
        ui: { ...state.ui, activeActorIndex: 0, step: 0, mode: "idle" },
      };
    }

    case "SET_ACTIVE_ACTOR":
      return { ...state, ui: { ...state.ui, activeActorIndex: action.index } };

    case "ADD_SCENE": {
      const newScene = createScene();
      const scenes = [...state.movie.scenes, newScene];
      return {
        ...state,
        movie: { ...state.movie, scenes, activeSceneIndex: scenes.length - 1 },
        ui: { ...state.ui, step: 0, mode: "idle", activeActorIndex: 0 },
      };
    }

    case "SET_ACTIVE_SCENE":
      return {
        ...state,
        movie: { ...state.movie, activeSceneIndex: action.index },
        ui: { ...state.ui, step: 0, mode: "idle", activeActorIndex: 0 },
      };

    case "DELETE_SCENE": {
      if (state.movie.scenes.length <= 1) return state;
      const scenes = state.movie.scenes.filter((_, i) => i !== action.index);
      const activeIndex = Math.min(state.movie.activeSceneIndex, scenes.length - 1);
      return {
        ...state,
        movie: { ...state.movie, scenes, activeSceneIndex: activeIndex },
        ui: { ...state.ui, step: 0, mode: "idle", activeActorIndex: 0 },
      };
    }

    case "SET_TITLE":
      return { ...state, movie: { ...state.movie, title: action.title } };

    case "LOAD_MOVIE": {
      nextSceneId = Math.max(...action.movie.scenes.map((s) => s.id)) + 1;
      return {
        ...state,
        movie: { ...action.movie, activeSceneIndex: 0 },
        ui: { screen: "preview", mode: "idle", step: 3, activeActorIndex: 0 },
      };
    }

    case "RESET_MOVIE":
      nextSceneId = 1;
      nextActorId = 1;
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
