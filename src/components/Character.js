import { View, Text, StyleSheet } from "react-native";
import { CHARACTERS, DEFAULT_CHARACTER_ID } from "../data/characters";
import { EMOTIONS } from "../data/emotions";

const CHAR_SIZE = 80;
export { CHAR_SIZE };

// Get emotion overrides for face rendering
function getEmotionOverrides(emotionId) {
  if (!emotionId) return null;
  return EMOTIONS.find((e) => e.id === emotionId) || null;
}

// ── Animation values by motion state ────────────────────────

function animValues(motion, frame) {
  const f = frame || 0;
  const v = {
    bounce: 0,
    headTilt: 0,
    bodyLean: 0,
    leftArm: 0,
    rightArm: 0,
    leftLeg: 0,
    rightLeg: 0,
    blink: false,
    mouth: "smile",
    browUp: 0,
  };

  switch (motion) {
    case "idle": {
      v.bounce = Math.sin(f * 0.06) * 2;
      v.blink = f % 90 < 3;
      const sway = Math.sin(f * 0.03);
      v.leftArm = sway * 5;
      v.rightArm = -sway * 5;
      v.bodyLean = sway * 1;
      break;
    }
    case "walk": {
      const step = Math.sin(f * 0.22);
      v.bounce = -Math.abs(Math.sin(f * 0.18)) * 4;
      v.leftArm = step * 24;
      v.rightArm = -step * 24;
      v.leftLeg = -step * 26;
      v.rightLeg = step * 26;
      v.bodyLean = step * 2;
      v.blink = f % 50 < 2;
      v.mouth = "grin";
      break;
    }
    case "run": {
      const step = Math.sin(f * 0.38);
      v.bounce = -Math.abs(Math.sin(f * 0.32)) * 7;
      v.leftArm = step * 40 - 15;
      v.rightArm = -step * 40 - 15;
      v.leftLeg = -step * 36;
      v.rightLeg = step * 36;
      v.bodyLean = 10;
      v.headTilt = 6;
      v.mouth = "open";
      v.browUp = 3;
      break;
    }
    case "jump": {
      const w = Math.sin(f * 0.3) * 4;
      v.leftArm = -65 + w;
      v.rightArm = 65 - w;
      v.leftLeg = 25 + w;
      v.rightLeg = -25 - w;
      v.mouth = "wow";
      v.browUp = 5;
      break;
    }
    case "dance": {
      const beat = Math.sin(f * 0.2);
      v.bounce = -Math.abs(beat) * 6;
      v.bodyLean = beat * 10;
      v.headTilt = -beat * 5;
      v.leftArm = beat > 0 ? -70 + Math.sin(f * 0.4) * 15 : 10;
      v.rightArm = beat <= 0 ? 70 - Math.sin(f * 0.4) * 15 : -10;
      v.leftLeg = beat * 15;
      v.rightLeg = -beat * 15;
      v.mouth = "grin";
      break;
    }
    case "wave": {
      v.bounce = Math.sin(f * 0.06) * 2;
      v.rightArm = -80 + Math.sin(f * 0.25) * 20;
      v.leftArm = 5;
      v.blink = f % 60 < 3;
      v.mouth = "grin";
      v.headTilt = Math.sin(f * 0.1) * 3;
      break;
    }
  }

  return v;
}

// Apply emotion overrides to animation values
function applyEmotion(v, emotionId) {
  const emotion = getEmotionOverrides(emotionId);
  if (!emotion) return v;
  return {
    ...v,
    mouth: emotion.mouth || v.mouth,
    browUp: emotion.browUp !== undefined ? emotion.browUp : v.browUp,
    // heartEyes and cheekGlow are handled in render
  };
}

// ── Quadruped animation values ──────────────────────────────

function quadAnimValues(motion, frame) {
  const f = frame || 0;
  const v = {
    bounce: 0, bodyRock: 0, headBob: 0,
    frontNear: 0, frontFar: 0,
    backNear: 0, backFar: 0,
    tailWag: 0, blink: false, mouth: "closed",
  };
  switch (motion) {
    case "idle": {
      v.bounce = Math.sin(f * 0.05) * 1.5;
      v.blink = f % 100 < 3;
      v.tailWag = Math.sin(f * 0.08) * 15;
      v.headBob = Math.sin(f * 0.04) * 2;
      break;
    }
    case "walk": {
      const stride = Math.sin(f * 0.2);
      v.bounce = -Math.abs(stride) * 3;
      v.frontNear = stride * 25;
      v.frontFar = -stride * 25;
      v.backNear = -stride * 25;
      v.backFar = stride * 25;
      v.headBob = stride * 3;
      v.tailWag = Math.sin(f * 0.15) * 12;
      v.bodyRock = stride * 1.5;
      break;
    }
    case "run": {
      const stride = Math.sin(f * 0.35);
      v.bounce = -Math.abs(stride) * 6;
      v.frontNear = stride * 40;
      v.frontFar = stride * 35;
      v.backNear = -stride * 40;
      v.backFar = -stride * 35;
      v.headBob = stride * 4;
      v.tailWag = Math.sin(f * 0.35) * 25;
      v.bodyRock = stride * 3;
      v.mouth = "open";
      break;
    }
    case "jump": {
      const w = Math.sin(f * 0.25) * 3;
      v.frontNear = -35 + w;
      v.frontFar = -30 + w;
      v.backNear = 40 - w;
      v.backFar = 35 - w;
      v.headBob = -5;
      v.tailWag = 30;
      v.mouth = "open";
      break;
    }
    case "dance": {
      const beat = Math.sin(f * 0.2);
      v.bounce = -Math.abs(beat) * 5;
      v.frontNear = beat * 20;
      v.frontFar = -beat * 20;
      v.backNear = beat * 20;
      v.backFar = -beat * 20;
      v.bodyRock = beat * 4;
      v.headBob = -beat * 4;
      v.tailWag = Math.sin(f * 0.3) * 30;
      break;
    }
    case "wave": {
      v.bounce = Math.sin(f * 0.06) * 1.5;
      v.frontNear = -30 + Math.sin(f * 0.25) * 15;
      v.headBob = Math.sin(f * 0.1) * 3;
      v.tailWag = Math.sin(f * 0.12) * 20;
      v.blink = f % 70 < 3;
      break;
    }
  }
  return v;
}

// ── Per-character accessories ───────────────────────────────

function Accessory({ charId, char }) {
  switch (charId) {
    case "star":
      return (
        <View style={a.zone}>
          <View
            style={[
              a.hairBump,
              {
                backgroundColor: char.hairColor,
                width: 28,
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
              },
            ]}
          />
          <Text style={a.topEmoji}>{"\u2B50"}</Text>
        </View>
      );

    case "cool":
      return (
        <View style={a.zone}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                bottom: 0,
                left: 24 + i * 12,
                width: 8,
                height: 14,
                backgroundColor: char.hairColor,
                borderRadius: 3,
                transform: [{ rotate: `${-20 + i * 15}deg` }],
              }}
            />
          ))}
        </View>
      );

    case "nature":
      return (
        <View style={a.zone}>
          <View
            style={[
              a.hairBump,
              {
                backgroundColor: "#2D6A1E",
                width: 32,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              },
            ]}
          />
          <Text style={[a.topEmoji, { fontSize: 10 }]}>{"\uD83C\uDF43"}</Text>
        </View>
      );

    case "magic":
      return (
        <View style={[a.zone, { height: 22 }]}>
          {/* Hat cone */}
          <View
            style={{
              position: "absolute",
              bottom: 4,
              left: 26,
              width: 0,
              height: 0,
              borderLeftWidth: 14,
              borderRightWidth: 14,
              borderBottomWidth: 18,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: char.bodyColor,
            }}
          />
          {/* Hat brim */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 16,
              width: 48,
              height: 6,
              backgroundColor: char.bodyColor,
              borderRadius: 3,
            }}
          />
          <Text style={[a.topEmoji, { top: -3, fontSize: 9 }]}>{"\u2728"}</Text>
        </View>
      );

    case "sunny":
      return (
        <View style={a.zone}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                bottom: 0,
                left: 22 + i * 9,
                width: 6,
                height: 11,
                backgroundColor: char.hairColor,
                borderRadius: 3,
                transform: [{ rotate: `${-25 + i * 18}deg` }],
              }}
            />
          ))}
        </View>
      );

    case "robot":
      return (
        <View style={[a.zone, { height: 18, alignItems: "center" }]}>
          <View
            style={{
              width: 3,
              height: 12,
              backgroundColor: "#94A3B8",
              borderRadius: 1.5,
            }}
          />
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#22D3EE",
              marginTop: -1,
              shadowColor: "#22D3EE",
              shadowRadius: 4,
              shadowOpacity: 0.8,
              shadowOffset: { width: 0, height: 0 },
            }}
          />
        </View>
      );

    case "fire":
      return (
        <View style={a.zone}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                bottom: 0,
                left: 22 + i * 11,
                width: 10,
                height: i === 1 ? 16 : 11,
                backgroundColor: i === 1 ? "#FF4500" : char.hairColor,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
              }}
            />
          ))}
        </View>
      );

    case "ocean":
      return (
        <View style={a.zone}>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 22,
              width: 36,
              height: 11,
              backgroundColor: char.hairColor,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 4,
            }}
          />
        </View>
      );

    case "ninja":
      return null; // Headband is rendered on the face

    case "candy":
      return (
        <View style={a.zone}>
          <View
            style={{
              position: "absolute",
              bottom: 2,
              left: 24,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 13,
                height: 9,
                backgroundColor: char.hairColor,
                borderTopLeftRadius: 7,
                borderBottomLeftRadius: 7,
                transform: [{ rotate: "-10deg" }],
              }}
            />
            <View
              style={{
                width: 6,
                height: 6,
                backgroundColor: char.bodyColor,
                borderRadius: 3,
                zIndex: 1,
                marginHorizontal: -2,
              }}
            />
            <View
              style={{
                width: 13,
                height: 9,
                backgroundColor: char.hairColor,
                borderTopRightRadius: 7,
                borderBottomRightRadius: 7,
                transform: [{ rotate: "10deg" }],
              }}
            />
          </View>
        </View>
      );

    // ── Lion King characters ──

    case "simba":
      return (
        <View style={a.zone}>
          {/* Small cub mane tuft */}
          <View
            style={[
              a.hairBump,
              {
                backgroundColor: char.hairColor,
                width: 22,
                height: 10,
                borderTopLeftRadius: 11,
                borderTopRightRadius: 11,
                left: 29,
              },
            ]}
          />
        </View>
      );

    case "nala":
      return (
        <View style={a.zone}>
          {/* Smooth tuft */}
          <View
            style={[
              a.hairBump,
              {
                backgroundColor: char.hairColor,
                width: 24,
                height: 8,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                left: 28,
              },
            ]}
          />
        </View>
      );

    case "mufasa":
      return (
        <View style={[a.zone, { height: 18 }]}>
          {/* Big flowing mane */}
          <View
            style={{
              position: "absolute",
              bottom: -2,
              left: 16,
              width: 48,
              height: 18,
              backgroundColor: char.hairColor,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
          />
          {/* Mane side tufts */}
          <View
            style={{
              position: "absolute",
              bottom: -6,
              left: 12,
              width: 12,
              height: 14,
              backgroundColor: char.hairColor,
              borderRadius: 6,
              transform: [{ rotate: "-15deg" }],
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -6,
              right: 12,
              width: 12,
              height: 14,
              backgroundColor: char.hairColor,
              borderRadius: 6,
              transform: [{ rotate: "15deg" }],
            }}
          />
        </View>
      );

    case "scar":
      return (
        <View style={a.zone}>
          {/* Dark jagged mane */}
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                bottom: 0,
                left: 20 + i * 10,
                width: 9,
                height: i === 1 || i === 2 ? 14 : 10,
                backgroundColor: char.hairColor,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                borderBottomLeftRadius: 1,
                borderBottomRightRadius: 1,
                transform: [{ rotate: `${-12 + i * 8}deg` }],
              }}
            />
          ))}
        </View>
      );

    case "timon":
      return (
        <View style={a.zone}>
          {/* Spiky meerkat hair */}
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                bottom: 0,
                left: 28 + i * 8,
                width: 6,
                height: i === 1 ? 13 : 9,
                backgroundColor: char.hairColor,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                transform: [{ rotate: `${-15 + i * 15}deg` }],
              }}
            />
          ))}
        </View>
      );

    case "pumbaa":
      return (
        <View style={a.zone}>
          {/* Mohawk */}
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                bottom: 0,
                left: 24 + i * 7,
                width: 5,
                height: i === 2 ? 12 : 8,
                backgroundColor: char.hairColor,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
              }}
            />
          ))}
        </View>
      );

    default:
      return null;
  }
}

const a = StyleSheet.create({
  zone: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 14,
    zIndex: 10,
  },
  hairBump: {
    position: "absolute",
    bottom: 0,
    left: 26,
    height: 12,
  },
  topEmoji: {
    position: "absolute",
    top: -5,
    left: 34,
    fontSize: 11,
  },
});

// ── Quadruped character component ────────────────────────────

function QuadrupedCharacter({ x, y, pickedEmoji, frame, char, motion, facing }) {
  const v = quadAnimValues(motion || "idle", frame || 0);
  const fl = facing === "left";
  const isLion = ["simba", "nala", "mufasa", "scar"].includes(char.id);
  const hasBigMane = ["mufasa", "scar"].includes(char.id);
  const hasSmallMane = char.id === "simba";
  const isPumbaa = char.id === "pumbaa";

  return (
    <View style={[q.box, { left: x, top: y + v.bounce }, fl && { transform: [{ scaleX: -1 }] }]}>
      {/* Tail */}
      <View style={[q.tail, { backgroundColor: char.bodyColor, transform: [{ rotate: `${-30 + v.tailWag}deg` }] }]}>
        {isLion && <View style={[q.tailTuft, { backgroundColor: char.hairColor }]} />}
        {isPumbaa && <View style={[q.tailCurl, { borderColor: char.bodyColor }]} />}
      </View>

      {/* Far legs (behind body) */}
      <View style={[q.leg, q.backFar, { backgroundColor: char.bodyColor, transform: [{ rotate: `${v.backFar}deg` }] }]}>
        <View style={[q.paw, { backgroundColor: char.shoeColor }]} />
      </View>
      <View style={[q.leg, q.frontFar, { backgroundColor: char.bodyColor, transform: [{ rotate: `${v.frontFar}deg` }] }]}>
        <View style={[q.paw, { backgroundColor: char.shoeColor }]} />
      </View>

      {/* Body */}
      <View style={[q.body, { backgroundColor: char.bodyColor }, isPumbaa && q.bodyRound, { transform: [{ rotate: `${v.bodyRock}deg` }] }]}>
        <View style={[q.belly, { backgroundColor: char.skinColor }]} />
      </View>

      {/* Near legs (in front of body) */}
      <View style={[q.leg, q.backNear, { backgroundColor: char.bodyColor, transform: [{ rotate: `${v.backNear}deg` }] }]}>
        <View style={[q.paw, { backgroundColor: char.shoeColor }]} />
      </View>
      <View style={[q.leg, q.frontNear, { backgroundColor: char.bodyColor, transform: [{ rotate: `${v.frontNear}deg` }] }]}>
        <View style={[q.paw, { backgroundColor: char.shoeColor }]} />
      </View>

      {/* Mane (behind head) */}
      {hasBigMane && <View style={[q.mane, { backgroundColor: char.hairColor }]} />}
      {hasSmallMane && <View style={[q.smallMane, { backgroundColor: char.hairColor }]} />}

      {/* Head */}
      <View style={[q.head, { backgroundColor: char.skinColor }, isPumbaa && q.headWide, { transform: [{ rotate: `${v.headBob}deg` }] }]}>
        {/* Ears */}
        {isLion && (
          <>
            <View style={[q.lionEar, { left: 2, backgroundColor: char.skinColor }]} />
            <View style={[q.lionEar, { right: 2, backgroundColor: char.skinColor }]} />
            <View style={[q.lionEarInner, { left: 4 }]} />
            <View style={[q.lionEarInner, { right: 4 }]} />
          </>
        )}
        {isPumbaa && (
          <>
            <View style={[q.pigEar, { left: 0, backgroundColor: char.skinColor }]} />
            <View style={[q.pigEar, { right: 0, backgroundColor: char.skinColor }]} />
          </>
        )}

        {/* Eye */}
        <View style={[q.eyeW, { right: 3, top: 5 }]}>
          <View style={[q.iris, { backgroundColor: char.eyeColor }]}>
            <View style={q.pupil} />
          </View>
          {v.blink && <View style={[q.lid, { backgroundColor: char.skinColor }]} />}
        </View>

        {/* Nose */}
        <View style={[q.nose, isPumbaa && q.pigNose, { backgroundColor: isLion ? "#5C3D1A" : "#A0604A" }]} />

        {/* Mouth */}
        {v.mouth === "open" && <View style={q.mouthOpen} />}

        {/* Scar's scar */}
        {char.id === "scar" && <View style={q.scarMark} />}

        {/* Pumbaa tusks */}
        {isPumbaa && (
          <>
            <View style={[q.tusk, { right: 2, bottom: -4 }]} />
            <View style={[q.tusk, { right: 7, bottom: -3 }]} />
          </>
        )}
      </View>

      {/* Prop */}
      {pickedEmoji && (
        <Text style={[q.prop, fl && { transform: [{ scaleX: -1 }] }]}>{pickedEmoji}</Text>
      )}
    </View>
  );
}

const q = StyleSheet.create({
  box: { position: "absolute", width: CHAR_SIZE, height: CHAR_SIZE + 24 },
  body: {
    position: "absolute", width: 40, height: 18, borderRadius: 9,
    left: 14, top: 40, zIndex: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  bodyRound: { height: 22, borderRadius: 11, top: 38 },
  belly: {
    position: "absolute", left: 6, right: 6, bottom: 1,
    height: 6, borderRadius: 4, opacity: 0.35,
  },
  head: {
    position: "absolute", width: 22, height: 20, borderRadius: 10,
    left: 50, top: 30, zIndex: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  headWide: { width: 24, height: 22, borderRadius: 11, left: 48 },
  eyeW: {
    position: "absolute", width: 9, height: 9, borderRadius: 5,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
  },
  iris: { width: 6, height: 6, borderRadius: 3, alignItems: "center", justifyContent: "center" },
  pupil: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#1a0a2e" },
  lid: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 5 },
  nose: { position: "absolute", right: -2, top: 11, width: 6, height: 5, borderRadius: 3, zIndex: 1 },
  pigNose: { width: 10, height: 7, borderRadius: 4, right: -3 },
  mouthOpen: {
    position: "absolute", right: -1, bottom: 2,
    width: 7, height: 4, borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
    backgroundColor: "#8B4513",
  },
  lionEar: { position: "absolute", width: 10, height: 10, borderRadius: 5, top: -4, zIndex: -1 },
  lionEarInner: {
    position: "absolute", width: 5, height: 5, borderRadius: 3, top: -1,
    backgroundColor: "rgba(180,100,60,0.4)", zIndex: -1,
  },
  pigEar: {
    position: "absolute", width: 9, height: 8, top: -3, zIndex: -1,
    borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
  },
  mane: { position: "absolute", left: 44, top: 22, width: 28, height: 26, borderRadius: 13, zIndex: 3 },
  smallMane: { position: "absolute", left: 48, top: 26, width: 18, height: 14, borderRadius: 7, zIndex: 3 },
  leg: { position: "absolute", top: 56, borderRadius: 3 },
  frontNear: { left: 44, width: 6, height: 22, zIndex: 3 },
  frontFar: { left: 40, width: 5, height: 20, opacity: 0.6, zIndex: 0 },
  backNear: { left: 22, width: 6, height: 22, zIndex: 3 },
  backFar: { left: 17, width: 5, height: 20, opacity: 0.6, zIndex: 0 },
  paw: { position: "absolute", bottom: -3, left: -1, width: 9, height: 5, borderRadius: 3 },
  tail: { position: "absolute", left: 6, top: 36, width: 4, height: 16, borderRadius: 2, zIndex: 0 },
  tailTuft: { position: "absolute", top: -2, left: -3, width: 10, height: 8, borderRadius: 5 },
  tailCurl: {
    position: "absolute", top: -4, left: -2, width: 8, height: 8, borderRadius: 4,
    borderWidth: 2, backgroundColor: "transparent",
  },
  tusk: { position: "absolute", width: 3, height: 7, borderRadius: 1.5, backgroundColor: "#FFFFF0", zIndex: 5 },
  scarMark: {
    position: "absolute", right: 2, top: 3, width: 10, height: 2,
    backgroundColor: "#8B0000", borderRadius: 1, zIndex: 6,
    transform: [{ rotate: "-25deg" }],
  },
  prop: { position: "absolute", right: -12, top: 30, fontSize: 20, zIndex: 20 },
});

// ── Main character component ────────────────────────────────

export default function Character(props) {
  const { x, y, pickedEmoji, frame, characterId, motion, facing, emotionId } = props;
  const char =
    CHARACTERS.find((c) => c.id === characterId) ||
    CHARACTERS.find((c) => c.id === DEFAULT_CHARACTER_ID);

  if (char.bodyType === "quadruped") {
    return <QuadrupedCharacter {...props} char={char} />;
  }

  const rawV = animValues(motion || "idle", frame || 0);
  const v = applyEmotion(rawV, emotionId);
  const fl = facing === "left";
  const emotion = getEmotionOverrides(emotionId);

  return (
    <View
      style={[
        s.box,
        { left: x, top: y + v.bounce },
        fl && { transform: [{ scaleX: -1 }] },
      ]}
    >
      <Accessory charId={char.id} char={char} />

      {/* ── Head ── */}
      <View
        style={[
          s.head,
          { backgroundColor: char.skinColor },
          char.id === "robot" && { borderRadius: 8 },
          { transform: [{ rotate: `${v.headTilt}deg` }] },
        ]}
      >
        {/* Round ears for lions */}
        {["simba", "nala", "mufasa", "scar"].includes(char.id) && (
          <>
            <View style={[s.ear, { left: -4, backgroundColor: char.skinColor }]} />
            <View style={[s.ear, { right: -4, backgroundColor: char.skinColor }]} />
            <View style={[s.earInner, { left: -1, backgroundColor: char.hairColor }]} />
            <View style={[s.earInner, { right: -1, backgroundColor: char.hairColor }]} />
          </>
        )}

        {/* Pointed ears for Timon */}
        {char.id === "timon" && (
          <>
            <View style={[s.earPointed, { left: -5, backgroundColor: char.skinColor, transform: [{ rotate: "-20deg" }] }]} />
            <View style={[s.earPointed, { right: -5, backgroundColor: char.skinColor, transform: [{ rotate: "20deg" }] }]} />
          </>
        )}

        {/* Small round ears for Pumbaa */}
        {char.id === "pumbaa" && (
          <>
            <View style={[s.earSmall, { left: -2, backgroundColor: char.skinColor }]} />
            <View style={[s.earSmall, { right: -2, backgroundColor: char.skinColor }]} />
          </>
        )}

        {/* Snout/nose for animal characters */}
        {["simba", "nala", "mufasa", "scar", "timon"].includes(char.id) && (
          <View style={[s.snout, { backgroundColor: char.id === "timon" ? "#3D2010" : "#5C3D1A" }]} />
        )}

        {/* Pumbaa snout + tusks */}
        {char.id === "pumbaa" && (
          <>
            <View style={[s.pigSnout, { backgroundColor: "#A0604A" }]} />
            <View style={[s.tusk, { left: 8 }]} />
            <View style={[s.tusk, { right: 8 }]} />
          </>
        )}

        {/* Scar's scar line across left eye */}
        {char.id === "scar" && (
          <View style={s.scarLine} />
        )}

        {/* Eyebrows */}
        <View style={[s.brow, { left: 6, top: 7 - v.browUp }]} />
        <View style={[s.brow, { right: 6, top: 7 - v.browUp }]} />

        {/* Left eye */}
        <View style={[s.eyeW, { left: 5 }]}>
          <View style={[s.iris, { backgroundColor: char.eyeColor }]}>
            <View style={s.pupil} />
          </View>
          {v.blink && (
            <View style={[s.lid, { backgroundColor: char.skinColor }]} />
          )}
        </View>

        {/* Right eye */}
        <View style={[s.eyeW, { right: 5 }]}>
          <View style={[s.iris, { backgroundColor: char.eyeColor }]}>
            <View style={s.pupil} />
          </View>
          {v.blink && (
            <View style={[s.lid, { backgroundColor: char.skinColor }]} />
          )}
        </View>

        {/* Cool: sunglasses overlay */}
        {char.id === "cool" && (
          <View style={s.glasses}>
            <View style={s.lens} />
            <View style={s.bridge} />
            <View style={s.lens} />
          </View>
        )}

        {/* Ninja: headband */}
        {char.id === "ninja" && (
          <View style={s.ninjaHB}>
            <View style={[s.hbBar, { backgroundColor: "#EF4444" }]} />
            <View style={[s.hbTail, { backgroundColor: "#EF4444" }]} />
          </View>
        )}

        {/* Cheeks */}
        <View style={[s.cheek, { left: 2 }]} />
        <View style={[s.cheek, { right: 2 }]} />

        {/* Mouth */}
        {v.mouth === "smile" && <View style={s.smile} />}
        {v.mouth === "grin" && (
          <View style={s.grin}>
            <View style={s.teeth} />
          </View>
        )}
        {v.mouth === "open" && <View style={s.mOpen} />}
        {v.mouth === "wow" && <View style={s.mWow} />}
        {v.mouth === "frown" && <View style={s.frown} />}
        {v.mouth === "grr" && <View style={s.grr} />}
        {v.mouth === "smirk" && <View style={s.smirk} />}
        {v.mouth === "wavy" && <View style={s.wavy} />}
        {v.mouth === "ooo" && <View style={s.ooo} />}

        {/* Heart eyes for "love" emotion */}
        {emotion && emotion.heartEyes && (
          <>
            <Text style={[s.heartEye, { left: 3 }]}>{"\u2764\uFE0F"}</Text>
            <Text style={[s.heartEye, { right: 3 }]}>{"\u2764\uFE0F"}</Text>
          </>
        )}
      </View>

      {/* ── Body ── */}
      <View
        style={[
          s.body,
          { backgroundColor: char.bodyColor },
          { transform: [{ rotate: `${v.bodyLean}deg` }] },
        ]}
      >
        <View style={s.bodyHL} />
        <View style={s.belt} />
      </View>

      {/* ── Left arm ── */}
      <View
        style={[
          s.arm,
          s.armL,
          {
            backgroundColor: char.skinColor,
            transform: [{ rotate: `${v.leftArm}deg` }],
          },
        ]}
      >
        <View style={[s.hand, { backgroundColor: char.skinColor }]} />
      </View>

      {/* ── Right arm ── */}
      <View
        style={[
          s.arm,
          s.armR,
          {
            backgroundColor: char.skinColor,
            transform: [{ rotate: `${v.rightArm}deg` }],
          },
        ]}
      >
        <View style={[s.hand, { backgroundColor: char.skinColor }]} />
      </View>

      {/* ── Left leg ── */}
      <View
        style={[
          s.legP,
          s.legL,
          { transform: [{ rotate: `${v.leftLeg}deg` }] },
        ]}
      >
        <View style={[s.legB, { backgroundColor: char.bodyColor }]} />
        <View style={[s.shoe, { backgroundColor: char.shoeColor }]} />
      </View>

      {/* ── Right leg ── */}
      <View
        style={[
          s.legP,
          s.legR,
          { transform: [{ rotate: `${v.rightLeg}deg` }] },
        ]}
      >
        <View style={[s.legB, { backgroundColor: char.bodyColor }]} />
        <View style={[s.shoe, { backgroundColor: char.shoeColor }]} />
      </View>

      {/* ── Held prop ── */}
      {pickedEmoji && (
        <Text style={[s.prop, fl && { transform: [{ scaleX: -1 }] }]}>
          {pickedEmoji}
        </Text>
      )}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────

const s = StyleSheet.create({
  box: {
    position: "absolute",
    width: CHAR_SIZE,
    height: CHAR_SIZE + 24,
    alignItems: "center",
  },

  // Head
  head: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginTop: 14,
    zIndex: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  brow: {
    position: "absolute",
    width: 9,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: "rgba(40,20,10,0.4)",
  },
  eyeW: {
    position: "absolute",
    top: 12,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  iris: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    alignItems: "center",
    justifyContent: "center",
  },
  pupil: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "#1a0a2e",
  },
  lid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 6,
  },
  cheek: {
    position: "absolute",
    bottom: 7,
    width: 7,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,140,140,0.3)",
  },
  smile: {
    position: "absolute",
    bottom: 5,
    left: 12,
    width: 14,
    height: 7,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: "#8B4513",
  },
  grin: {
    position: "absolute",
    bottom: 4,
    left: 12,
    width: 14,
    height: 8,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    backgroundColor: "#8B4513",
    overflow: "hidden",
  },
  teeth: {
    position: "absolute",
    top: 0,
    left: 2,
    right: 2,
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 1,
  },
  mOpen: {
    position: "absolute",
    bottom: 5,
    left: 14,
    width: 10,
    height: 6,
    borderRadius: 5,
    backgroundColor: "#8B4513",
  },
  mWow: {
    position: "absolute",
    bottom: 4,
    left: 15,
    width: 8,
    height: 9,
    borderRadius: 4,
    backgroundColor: "#8B4513",
  },
  frown: {
    position: "absolute",
    bottom: 3,
    left: 12,
    width: 14,
    height: 7,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: "#8B4513",
  },
  grr: {
    position: "absolute",
    bottom: 4,
    left: 10,
    width: 18,
    height: 6,
    borderRadius: 1,
    backgroundColor: "#8B4513",
    borderWidth: 1,
    borderColor: "#5C2D0A",
  },
  smirk: {
    position: "absolute",
    bottom: 5,
    left: 15,
    width: 10,
    height: 5,
    borderBottomRightRadius: 6,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderColor: "#8B4513",
  },
  wavy: {
    position: "absolute",
    bottom: 5,
    left: 10,
    width: 16,
    height: 5,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "#8B4513",
    backgroundColor: "transparent",
  },
  ooo: {
    position: "absolute",
    bottom: 4,
    left: 16,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: "#8B4513",
    backgroundColor: "transparent",
  },
  heartEye: {
    position: "absolute",
    top: 10,
    fontSize: 9,
    zIndex: 10,
  },

  // Cool sunglasses
  glasses: {
    position: "absolute",
    top: 11,
    left: 3,
    right: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 5,
  },
  lens: {
    width: 13,
    height: 10,
    borderRadius: 3,
    backgroundColor: "rgba(15,15,30,0.85)",
    borderWidth: 1,
    borderColor: "#444",
  },
  bridge: {
    width: 4,
    height: 2,
    backgroundColor: "#444",
  },

  // Ninja headband
  ninjaHB: {
    position: "absolute",
    top: 7,
    left: -2,
    right: -4,
    zIndex: 5,
  },
  hbBar: {
    width: "100%",
    height: 5,
    borderRadius: 2,
  },
  hbTail: {
    position: "absolute",
    right: -2,
    top: 1,
    width: 10,
    height: 4,
    borderRadius: 2,
    transform: [{ rotate: "25deg" }],
  },

  // Animal features
  ear: {
    position: "absolute",
    width: 13,
    height: 13,
    borderRadius: 7,
    top: -4,
    zIndex: -1,
  },
  earInner: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    top: -1,
    zIndex: -1,
    opacity: 0.5,
  },
  earPointed: {
    position: "absolute",
    width: 10,
    height: 14,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    top: -6,
    zIndex: -1,
  },
  earSmall: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    top: -2,
    zIndex: -1,
  },
  snout: {
    position: "absolute",
    bottom: 3,
    left: 14,
    width: 10,
    height: 6,
    borderRadius: 5,
    zIndex: 1,
  },
  pigSnout: {
    position: "absolute",
    bottom: 2,
    left: 12,
    width: 14,
    height: 8,
    borderRadius: 7,
    zIndex: 1,
  },
  tusk: {
    position: "absolute",
    bottom: -2,
    width: 4,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#FFFFF0",
    zIndex: 2,
    transform: [{ rotate: "5deg" }],
  },
  scarLine: {
    position: "absolute",
    left: 4,
    top: 10,
    width: 12,
    height: 2,
    backgroundColor: "#8B0000",
    borderRadius: 1,
    zIndex: 6,
    transform: [{ rotate: "-25deg" }],
  },

  // Body
  body: {
    width: 30,
    height: 24,
    borderRadius: 12,
    marginTop: -4,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  bodyHL: {
    position: "absolute",
    left: 3,
    top: 3,
    bottom: 3,
    width: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
  },
  belt: {
    position: "absolute",
    left: 4,
    right: 4,
    bottom: 5,
    height: 2,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: 1,
  },

  // Arms
  arm: {
    position: "absolute",
    top: 50,
    width: 6,
    height: 22,
    borderRadius: 3,
    zIndex: 1,
  },
  armL: { left: 20 },
  armR: { right: 20 },
  hand: {
    position: "absolute",
    bottom: -4,
    left: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },

  // Legs
  legP: {
    position: "absolute",
    top: 68,
    width: 14,
    alignItems: "center",
    zIndex: 0,
  },
  legL: { left: 25 },
  legR: { right: 25 },
  legB: {
    width: 7,
    height: 18,
    borderRadius: 3.5,
  },
  shoe: {
    width: 14,
    height: 7,
    borderRadius: 4,
    marginTop: -1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },

  // Prop
  prop: {
    position: "absolute",
    right: -16,
    top: 50,
    fontSize: 22,
    zIndex: 20,
  },
});
