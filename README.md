# Movietastic

A fun movie-making app for kids and beginners to develop storytelling skills. Pick characters, choose backgrounds, direct the action, add voice overs, and play back your movie!

Built with React Native + Expo. Runs on iOS, Android, and web.

## Quick Start

```bash
npm install
npm run web
```

Open http://localhost:8081 in your browser and start making movies!

### Try the Demo Movie

Hit **"Watch Demo Movie"** on the home screen to see a pre-built 3-scene movie called "Space Adventure". It shows:
- **Scene 1**: Star character walks across the park carrying a rocket
- **Scene 2**: Robot floats around in space holding a star
- **Scene 3**: Sunny celebrates on the beach with a trophy

This is a great way to see how the app works before making your own!

### How to Make a Movie

1. Tap **New Movie** on the home screen
2. **Pick a Place** — choose from Park, Beach, Space, Castle, Ocean, or Stage
3. **Pick Your Star** — choose from 10 characters (Star, Cool, Nature, Magic, Sunny, Robot, Fire, Ocean, Ninja, Candy)
4. **Pick Something Fun** — choose a prop for your character to hold (16 options)
5. Tap **Action!** to start recording — move your mouse (web) or drag your finger (mobile) to direct the character around the stage
6. Tap **Cut!** to stop recording
7. Tap **Play** to watch your scene back, or **Re-record** to try again
8. Record a **Voice Over** to narrate your scene
9. Add more scenes with the **+ Add** button in the timeline
10. Tap **Preview** to watch your full movie with all scenes!

There's also a **"How to Make a Movie"** button on the home screen with in-app instructions.

## Run on Mobile

```bash
npm run ios         # iOS simulator (requires Xcode)
npm run android     # Android emulator
```

Or scan the QR code from `npm start` with [Expo Go](https://expo.dev/go) on your phone.

## Tech Stack

- **Expo SDK 55** with React 19.2 and React Native 0.83
- **react-native-web** for browser support
- **expo-av** for voice over recording/playback
- State-based screen routing (no navigation library)
- Keyframe recording at 100ms intervals, playback interpolation at 30fps

## Project Structure

```
App.js                    # Screen router (home | studio | preview)
src/
  theme.js                # Colors, fonts, shared constants
  components/
    Character.js          # Multi-skin animated character (10 skins)
    SceneStage.js         # Interactive stage with dynamic backgrounds
    PropPicker.js         # Emoji prop grid (16 props)
    BackgroundPicker.js   # Scene background selector (6 backgrounds)
    CharacterPicker.js    # Character skin selector (10 characters)
    StepIndicator.js      # Progress dots
    VoiceOverBar.js       # Record/play/delete voice over
    SceneTimeline.js      # Horizontal scene strip
  data/
    characters.js         # 10 character skins
    backgrounds.js        # 6 backgrounds
    props.js              # 16 props
    demoMovie.js          # Pre-built 3-scene demo movie
  hooks/
    useMovieReducer.js    # All movie + UI state
    useRecorder.js        # Keyframe capture during recording
    usePlayback.js        # Keyframe interpolation for playback
    useVoiceOver.js       # Audio recording/playback wrapper
  screens/
    HomeScreen.js         # Welcome + demo + how-to guide
    StudioScreen.js       # Main creation screen with guidance
    PreviewScreen.js      # Full movie playback with "The End"
```
