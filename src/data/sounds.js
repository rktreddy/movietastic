// Sound effects library — all synthesized with Web Audio API (no downloads needed!)
// Each sound has a synth function that creates the effect from scratch

export const SOUNDS = [
  { id: "whoosh", label: "Whoosh", emoji: "\uD83D\uDCA8", category: "action" },
  { id: "boing", label: "Boing", emoji: "\uD83E\uDD98", category: "action" },
  { id: "pop", label: "Pop", emoji: "\uD83C\uDF88", category: "action" },
  { id: "splash", label: "Splash", emoji: "\uD83D\uDCA6", category: "nature" },
  { id: "thunder", label: "Thunder", emoji: "\u26A1", category: "nature" },
  { id: "wind", label: "Wind", emoji: "\uD83C\uDF2C\uFE0F", category: "nature" },
  { id: "magic", label: "Magic", emoji: "\u2728", category: "fantasy" },
  { id: "laugh", label: "Laugh", emoji: "\uD83D\uDE02", category: "voice" },
  { id: "gasp", label: "Gasp", emoji: "\uD83D\uDE2E", category: "voice" },
  { id: "cheer", label: "Cheer", emoji: "\uD83C\uDF89", category: "voice" },
  { id: "drum", label: "Drum Roll", emoji: "\uD83E\uDD41", category: "music" },
  { id: "twinkle", label: "Twinkle", emoji: "\uD83C\uDF1F", category: "music" },
  { id: "fail", label: "Oh No!", emoji: "\uD83D\uDE35", category: "comedy" },
  { id: "victory", label: "Victory!", emoji: "\uD83C\uDFC6", category: "music" },
  { id: "footsteps", label: "Steps", emoji: "\uD83D\uDC63", category: "action" },
  { id: "heartbeat", label: "Heartbeat", emoji: "\uD83D\uDC93", category: "drama" },
];

// Web Audio synth functions — each creates a unique sound from oscillators + effects
export function synthesizeSound(audioCtx, soundId) {
  const now = audioCtx.currentTime;

  switch (soundId) {
    case "whoosh": {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);
      filter.Q.value = 2;
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      // Add noise-like character
      const noise = audioCtx.createOscillator();
      const noiseGain = audioCtx.createGain();
      noise.type = "sawtooth";
      noise.frequency.setValueAtTime(2000, now);
      noise.frequency.exponentialRampToValueAtTime(500, now + 0.3);
      noiseGain.gain.setValueAtTime(0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      noise.connect(noiseGain).connect(filter).connect(audioCtx.destination);
      osc.connect(gain).connect(filter).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.5);
      noise.start(now); noise.stop(now + 0.5);
      return 0.5;
    }

    case "boing": {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.5);
      return 0.5;
    }

    case "pop": {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.2);
      return 0.2;
    }

    case "splash": {
      // White noise burst + low rumble
      const bufferSize = audioCtx.sampleRate * 0.6;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3000, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.5);
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      noise.connect(filter).connect(gain).connect(audioCtx.destination);
      noise.start(now);
      return 0.7;
    }

    case "thunder": {
      const bufferSize = audioCtx.sampleRate * 1.2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const env = Math.exp(-i / (bufferSize * 0.3));
        data[i] = (Math.random() * 2 - 1) * env * (1 + Math.sin(i * 0.002) * 0.5);
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 400;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      noise.connect(filter).connect(gain).connect(audioCtx.destination);
      noise.start(now);
      return 1.2;
    }

    case "wind": {
      const bufferSize = audioCtx.sampleRate * 1.5;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3 * (0.5 + 0.5 * Math.sin(i * 0.0003));
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 600;
      filter.Q.value = 0.5;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.1, now + 1.0);
      gain.gain.linearRampToValueAtTime(0, now + 1.5);
      noise.connect(filter).connect(gain).connect(audioCtx.destination);
      noise.start(now);
      return 1.5;
    }

    case "magic": {
      // Ascending sparkle tones
      [0, 0.1, 0.2, 0.3, 0.4].forEach((delay, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.value = 800 + i * 200;
        g.gain.setValueAtTime(0.2, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
        o.connect(g).connect(audioCtx.destination);
        o.start(now + delay); o.stop(now + delay + 0.35);
      });
      return 0.8;
    }

    case "laugh": {
      // "Ha ha ha" — rapid pitch oscillations
      [0, 0.12, 0.24, 0.36].forEach((delay) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(350, now + delay);
        o.frequency.exponentialRampToValueAtTime(250, now + delay + 0.08);
        g.gain.setValueAtTime(0.3, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
        o.connect(g).connect(audioCtx.destination);
        o.start(now + delay); o.stop(now + delay + 0.12);
      });
      return 0.5;
    }

    case "gasp": {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(200, now);
      o.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      o.frequency.exponentialRampToValueAtTime(400, now + 0.3);
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      o.connect(g).connect(audioCtx.destination);
      o.start(now); o.stop(now + 0.4);
      return 0.4;
    }

    case "cheer": {
      // Multiple rising tones
      [0, 0.05, 0.1].forEach((delay, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(300 + i * 100, now + delay);
        o.frequency.linearRampToValueAtTime(600 + i * 100, now + delay + 0.4);
        g.gain.setValueAtTime(0.2, now + delay);
        g.gain.linearRampToValueAtTime(0.3, now + delay + 0.2);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);
        o.connect(g).connect(audioCtx.destination);
        o.start(now + delay); o.stop(now + delay + 0.65);
      });
      return 0.7;
    }

    case "drum": {
      [0, 0.06, 0.12, 0.18, 0.24, 0.3, 0.33, 0.36, 0.39, 0.42].forEach((delay) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(150, now + delay);
        o.frequency.exponentialRampToValueAtTime(60, now + delay + 0.04);
        g.gain.setValueAtTime(delay > 0.3 ? 0.4 : 0.25, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);
        o.connect(g).connect(audioCtx.destination);
        o.start(now + delay); o.stop(now + delay + 0.08);
      });
      return 0.5;
    }

    case "twinkle": {
      const notes = [523, 659, 784, 880, 784, 659, 523];
      notes.forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        const t = i * 0.15;
        g.gain.setValueAtTime(0.25, now + t);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.2);
        o.connect(g).connect(audioCtx.destination);
        o.start(now + t); o.stop(now + t + 0.25);
      });
      return 1.2;
    }

    case "fail": {
      // Descending sad trombone
      const notes = [400, 380, 340, 250];
      notes.forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "triangle";
        o.frequency.value = freq;
        const t = i * 0.3;
        g.gain.setValueAtTime(0.3, now + t);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.35);
        o.connect(g).connect(audioCtx.destination);
        o.start(now + t); o.stop(now + t + 0.4);
      });
      return 1.3;
    }

    case "victory": {
      const notes = [523, 523, 523, 659, 784, 659, 784];
      const durs = [0.1, 0.1, 0.2, 0.15, 0.4, 0.15, 0.5];
      let t = 0;
      notes.forEach((freq, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "square";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.15, now + t);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + durs[i]);
        o.connect(g).connect(audioCtx.destination);
        o.start(now + t); o.stop(now + t + durs[i] + 0.05);
        t += durs[i] + 0.02;
      });
      return 1.2;
    }

    case "footsteps": {
      [0, 0.25, 0.5, 0.75].forEach((delay) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(100, now + delay);
        o.frequency.exponentialRampToValueAtTime(50, now + delay + 0.05);
        g.gain.setValueAtTime(0.3, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
        o.connect(g).connect(audioCtx.destination);
        o.start(now + delay); o.stop(now + delay + 0.1);
      });
      return 1.0;
    }

    case "heartbeat": {
      [0, 0.15, 0.6, 0.75].forEach((delay, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(i % 2 === 0 ? 80 : 60, now + delay);
        o.frequency.exponentialRampToValueAtTime(40, now + delay + 0.12);
        g.gain.setValueAtTime(i % 2 === 0 ? 0.4 : 0.25, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);
        o.connect(g).connect(audioCtx.destination);
        o.start(now + delay); o.stop(now + delay + 0.18);
      });
      return 1.0;
    }

    default:
      return 0;
  }
}
