# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Movietastic is a mobile/web app that can be used to make short movies with animations or pictures/videos, add voice overs. It is a fun app for kids and beginners to develop story telling skills

## Quick Start

```bash
npm install         # Install dependencies
npm run web         # Run in browser (fastest way to try it)
```

Open http://localhost:8081 in your browser. You can:
- **Watch the demo** — Hit "Watch Demo Movie" to see a pre-built 3-scene "Space Adventure" movie
- **Make your own** — Hit "New Movie", pick a background/character/prop, hit "Action!" and move your mouse to direct the character, then hit "Cut!" to finish. Add voice over, add more scenes, and hit "Preview" to watch your movie
- **Read the guide** — Hit "How to Make a Movie" for step-by-step instructions

## Commands

```bash
npm start           # Start Expo dev server (Metro bundler on port 8081)
npm run ios         # Run on iOS simulator (requires Xcode)
npm run android     # Run on Android emulator
npm run web         # Run in browser via react-native-web
```


## Architecture

**Entry point**: `index.js` → registers `App.js` via Expo's `registerRootComponent`.

**App.js** — Thin screen router using state-based navigation (home | studio | preview). Uses `useMovieReducer` for all state management.

**Screens** (`src/screens/`):
- `HomeScreen` — Welcome screen with "New Movie", "Watch Demo", and "How To" buttons
- `StudioScreen` — Main creation screen with contextual guidance, stage, pickers, timeline, voice over
- `PreviewScreen` — Full movie playback with scene transitions and "The End" card

**Components** (`src/components/`):
- `Character` — Multi-skin animated stick figure with configurable colors
- `SceneStage` — Interactive stage with dynamic backgrounds based on selection
- `PropPicker` — Emoji prop grid (16 props)
- `BackgroundPicker` — Horizontal scrollable background selector (6 backgrounds)
- `CharacterPicker` — Horizontal scrollable character skin selector (10 characters)
- `StepIndicator` — 3-step progress dots
- `VoiceOverBar` — Record/play/delete voice over controls
- `SceneTimeline` — Horizontal scene strip with add/delete

**Hooks** (`src/hooks/`):
- `useMovieReducer` — Single reducer for all movie + UI state (including LOAD_MOVIE for demo)
- `useRecorder` — Keyframe capture (samples position every 100ms during recording)
- `usePlayback` — Keyframe interpolation at 30fps for playback
- `useVoiceOver` — expo-av Audio.Recording/Sound wrapper with web MediaRecorder fallback

**Data** (`src/data/`):
- `characters.js` — 10 character skins (Star, Cool, Nature, Magic, Sunny, Robot, Fire, Ocean, Ninja, Candy)
- `backgrounds.js` — 6 backgrounds (Park, Beach, Space, Castle, Ocean, Stage)
- `props.js` — 16 emoji props
- `demoMovie.js` — Pre-built 3-scene "Space Adventure" demo movie with keyframe paths

**Theme** (`src/theme.js`) — Kid-friendly colors, fonts, shared constants

## Key Technical Details

- **Platform branching**: `IS_WEB` constant in `src/theme.js` controls web vs native behavior
- **Animations**: Uses `useNativeDriver: false` for all Animated API calls (required for web compatibility). Frame-based animation runs at ~30fps via `setInterval`.
- **Keyframe recording**: Character position sampled every 100ms during recording, interpolated at 30fps during playback
- **Demo movie**: Pre-built keyframe paths generated with `makePath()` helper in `demoMovie.js`
- **Voice over**: expo-av on native, browser MediaRecorder on web with graceful fallback
- **Scene model**: `{ id, backgroundId, characterId, propId, keyframes[], voiceOverUri, duration }`
- **Studio UX flow**: Contextual guidance banner tells user what to do next; pickers hide during recording; re-record button after first take; auto-scroll to stage on Action
- **Expo SDK 55** with React 19.2 and React Native 0.83
- **Kid-friendly theme**: Cream background `#FFF8E7`, coral `#FF6B6B`, teal `#4ECDC4`, yellow `#FFE66D`
- **Fonts**: Serif (Georgia) for titles, Monospace (Courier) for UI text — uses `Platform.select` for cross-platform font families
