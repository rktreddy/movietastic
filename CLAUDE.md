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
- **Watch the demo** — Hit "Watch Lion King Demo" to see a 3-scene movie with multiple animated characters (Simba, Nala, Mufasa, Scar, Timon, Pumbaa) moving together
- **Make your own** — Hit "New Movie", pick a background and character, hit "Action!" to record movement. Add more characters with the "+" button in "Your Cast", then record each one. Hit "Play All" to see them together, or "Preview" for the full movie
- **Use creative tools** — Expand the "Creative Tools" toolbar to add emotions, speech bubbles, sound effects, camera effects, and get story ideas from Story Spark
- **Read the guide** — Hit "How to Make a Movie" for step-by-step instructions
- **Load saved movies** — Your movies auto-save when you preview or leave the studio

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
- `HomeScreen` — Welcome screen with "New Movie", "Watch Lion King Demo", and "How To" buttons
- `StudioScreen` — Main creation screen with cast strip, stage, pickers, timeline, voice over. Supports multiple characters per scene with independent recording
- `PreviewScreen` — Full movie playback with multi-actor animation, scene transitions and "The End" card

**Components** (`src/components/`):
- `Character` — Animated character with two body types: humanoid (stick figure with accessories) and quadruped (four-legged animals). Supports idle, walk, run, jump, dance, wave motion states with facing direction
- `SceneStage` — Interactive stage with dynamic backgrounds. Renders the active character + extra actors array
- `PropPicker` — Emoji prop grid (16 props)
- `BackgroundPicker` — Horizontal scrollable background selector (6 backgrounds)
- `CharacterPicker` — Horizontal scrollable character selector (16 characters) with configurable label
- `StepIndicator` — 3-step progress dots
- `VoiceOverBar` — Record/play/delete voice over controls
- `SceneTimeline` — Horizontal scene strip with add/delete
- `EmotionPicker` — Horizontal emotion selector (8 emotions: happy, sad, angry, surprised, scared, cool, love, sleepy)
- `SpeechBubbleEditor` — Text input + bubble type selector (speech/thought/shout) with quick phrases
- `SpeechBubble` — Rendered speech/thought/shout bubble positioned above characters on stage
- `SoundPicker` — Sound effects grid (16 web-audio-synthesized SFX). Tap to preview, long-press to add
- `StorySpark` — Magic story dice that generates creative prompts based on scene position (opening/twist/resolution)
- `CameraEffectPicker` — Per-scene camera effect selector (8 effects: static, zoom in/out, pan L/R, shake, dreamy, spin)

**Hooks** (`src/hooks/`):
- `useMovieReducer` — Single reducer for all movie + UI state. Supports multi-actor scenes via `extraActors` array. Actor-aware: SET_CHARACTER/SET_PROP/SET_KEYFRAMES target the active actor based on `ui.activeActorIndex`
- `useRecorder` — Keyframe capture (samples position every 100ms during recording)
- `usePlayback` — Keyframe interpolation at 30fps. Exports `interpolate()` function used by StudioScreen and PreviewScreen for multi-actor playback
- `useVoiceOver` — expo-av Audio.Recording/Sound wrapper with web MediaRecorder fallback

**Data** (`src/data/`):
- `characters.js` — 16 character skins: 10 original (Star, Cool, Nature, Magic, Sunny, Robot, Fire, Ocean, Ninja, Candy) + 6 Lion King (Simba, Nala, Mufasa, Scar, Timon, Pumbaa). Each has skinColor, bodyColor, hairColor, shoeColor, eyeColor. Lion King animals have `bodyType: "quadruped"`
- `backgrounds.js` — 6 backgrounds (Park, Beach, Space, Castle, Ocean, Stage)
- `props.js` — 16 emoji props
- `demoMovie.js` — Pre-built 3-scene "The Lion King Adventure" demo with multi-character scenes
- `emotions.js` — 8 emotion definitions (happy, sad, angry, surprised, scared, cool, love, sleepy) that override character face rendering
- `sounds.js` — 16 sound effects with Web Audio API synthesizers (whoosh, boing, pop, splash, thunder, wind, magic, laugh, gasp, cheer, drum, twinkle, fail, victory, footsteps, heartbeat)
- `storyPrompts.js` — Creative prompts organized by narrative beat (opening/twist/resolution) for the Story Spark feature
- `cameraEffects.js` — 8 camera effects with transform computation functions (static, zoom in/out, pan left/right, shake, dreamy, spin)

**Theme** (`src/theme.js`) — Kid-friendly colors, fonts, shared constants

## Key Technical Details

- **Character body types**: `bodyType: "humanoid"` (default) renders an upright cartoon figure with head, body, arms, legs, hands, shoes, and per-character accessories (hair, hats, sunglasses, headband, bow, etc.). `bodyType: "quadruped"` renders a four-legged animal viewed from the side with head, body, 4 legs (near/far pairs), tail, and character-specific features (mane, ears, tusks, scar)
- **Multi-actor scenes**: Each scene has a main character (top-level `characterId`, `propId`, `keyframes`) plus an `extraActors[]` array of additional characters, each with independent keyframes. `ui.activeActorIndex` (0 = main, 1+ = extra) determines which actor is being edited/recorded. The Cast Strip UI lets users add, select, and remove actors
- **Motion detection**: Character speed and direction computed from position history to auto-set motion state (idle/walk/run/jump) and facing direction (left/right). Works for all actors during playback
- **Platform branching**: `IS_WEB` constant in `src/theme.js` controls web vs native behavior
- **Animations**: Uses `useNativeDriver: false` for all Animated API calls (required for web compatibility). Frame-based animation runs at ~30fps via `setInterval`
- **Keyframe recording**: Character position sampled every 100ms during recording, interpolated at 30fps during playback. Each actor records independently
- **Demo movie**: Multi-character keyframe paths generated with `makePath()` helper in `demoMovie.js`
- **Voice over**: expo-av on native, browser MediaRecorder on web with graceful fallback
- **Emotion system**: Per-actor emotion override (`emotionId`) that changes character facial expression. `null` = auto-detect from motion state. Supports new mouth types: frown, grr, smirk, wavy, ooo. "Love" emotion renders heart eyes
- **Speech bubbles**: Per-actor `bubbleText` and `bubbleType` ("speech"/"thought"/"shout") rendered as positioned bubbles above characters during both studio and preview playback
- **Sound effects**: Per-scene `soundEffects[]` array of sound IDs. All sounds synthesized client-side with Web Audio API oscillators/noise — zero downloads. Played at scene start during playback
- **Camera effects**: Per-scene `cameraEffect` ID applied as CSS transforms on the stage container during playback. `cameraProgress` (0-1) drives time-based transforms
- **Story Spark**: Creative prompt generator that selects prompts based on scene position (opening/twist/resolution). Uses dice-roll animation
- **Save/Load**: Auto-saves to localStorage on preview/exit. Saved movies shown on home screen. Voice over URIs are stripped (blob URLs don't persist)
- **Scene model**: `{ id, backgroundId, characterId, propId, keyframes[], extraActors[], voiceOverUri, duration, emotionId, bubbleText, bubbleType, soundEffects[], cameraEffect }`
- **Studio UX flow**: Cast Strip for actor management → pick character/prop → Action to record → Cut to stop → select another actor → repeat. "Play All" plays all actors simultaneously. Contextual guidance banner tells user what to do next
- **Expo SDK 55** with React 19.2 and React Native 0.83
- **Kid-friendly theme**: Cream background `#FFF8E7`, coral `#FF6B6B`, teal `#4ECDC4`, yellow `#FFE66D`
- **Fonts**: Serif (Georgia) for titles, Monospace (Courier) for UI text — uses `Platform.select` for cross-platform font families
