# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Movietastic is a React Native + Expo mobile/web app for creating interactive short movie scenes. Users pick props, control an animated character on a stage, and create scenes with cinematic effects.

## Commands

```bash
npm start           # Start Expo dev server (Metro bundler on port 8081)
npm run ios         # Run on iOS simulator (requires Xcode)
npm run android     # Run on Android emulator
npm run web         # Run in browser via react-native-web
```

No test runner, linter, or build pipeline is configured. The project uses Expo CLI defaults with no custom Babel/Metro config.

## Architecture

**Entry point**: `index.js` → registers `App.js` via Expo's `registerRootComponent`.

**App.js** — The entire app lives in a single file with three components:
- `Character` — Animated stick figure built from RN Views, with walking/bobbing animations driven by a frame counter
- `SceneStage` — The interactive movie stage; handles touch (native) and mouse (web) events for character movement
- `App` (default export) — Main orchestrator managing the 3-step flow: Pick Object → Start Scene → Press Done

**moviestatic.jsx** — Original web-only React implementation using HTML Canvas for rendering. Not used by the Expo app; kept as reference.

## Key Technical Details

- **Platform branching**: `IS_WEB` constant controls web vs native behavior (mouse events vs touch, feature availability)
- **Animations**: Uses `useNativeDriver: false` for all Animated API calls (required for web compatibility). Frame-based animation runs at ~30fps via `setInterval`.
- **Native-only features**: Camera (expo-camera) and media save (expo-media-library) are not imported in the current web build. These should be conditionally required only on native platforms.
- **Expo SDK 55** with React 19.2 and React Native 0.83
- **Dark theme**: Background `#07020f`, gold `#ffe066`, pink `#ff8fc8`, blue `#80e8ff`
- **Fonts**: Serif (Georgia) for titles, Monospace (Courier) for UI text — uses `Platform.select` for cross-platform font families
