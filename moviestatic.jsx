import { useState, useEffect, useRef } from "react";

const OBJECTS = [
  { id: "camera", emoji: "🎥", label: "Camera" },
  { id: "clapper", emoji: "🎬", label: "Clapper" },
  { id: "mic", emoji: "🎤", label: "Mic" },
  { id: "spotlight", emoji: "🔦", label: "Spotlight" },
  { id: "film", emoji: "🎞️", label: "Film Reel" },
  { id: "popcorn", emoji: "🍿", label: "Popcorn" },
];

const SCENE_W = 700;
const SCENE_H = 320;
const CHAR_SIZE = 54;
const SPEED = 2.2;

function useAnimLoop(running, cb) {
  const rafRef = useRef();
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    if (!running) { cancelAnimationFrame(rafRef.current); return; }
    const loop = () => { cbRef.current(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);
}

export default function Movietastic() {
  const [picked, setPicked] = useState(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState(false);
  const [step, setStep] = useState(0);
  const [showClapAnim, setShowClapAnim] = useState(false);

  const charRef = useRef({ x: 80, y: SCENE_H / 2 - CHAR_SIZE / 2, vx: SPEED, vy: SPEED * 0.6 });
  const sceneRef = useRef();
  const canvasRef = useRef();
  const frameRef = useRef(0);

  // Draw scene on canvas
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = charRef.current;
    frameRef.current = (frameRef.current + 1) % 60;
    const f = frameRef.current;

    // Background
    ctx.clearRect(0, 0, SCENE_W, SCENE_H);

    // Stage floor
    const floorGrad = ctx.createLinearGradient(0, SCENE_H * 0.65, 0, SCENE_H);
    floorGrad.addColorStop(0, "#1a0a2e");
    floorGrad.addColorStop(1, "#0d0515");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, SCENE_H * 0.65, SCENE_W, SCENE_H * 0.35);

    // Stage planks
    ctx.strokeStyle = "rgba(255,200,80,0.07)";
    ctx.lineWidth = 1;
    for (let px = 0; px < SCENE_W; px += 40) {
      ctx.beginPath(); ctx.moveTo(px, SCENE_H * 0.65); ctx.lineTo(px + 20, SCENE_H); ctx.stroke();
    }

    // Spotlights
    [[120, -20, "#ffe066"], [SCENE_W / 2, -30, "#ff8fc8"], [SCENE_W - 120, -20, "#80e8ff"]].forEach(([lx, ly, col]) => {
      const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 320);
      grad.addColorStop(0, col + "44");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx - 90, SCENE_H * 0.72);
      ctx.lineTo(lx + 90, SCENE_H * 0.72);
      ctx.closePath();
      ctx.fill();
    });

    // Stars bg
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    [[40, 30], [200, 18], [380, 40], [540, 22], [640, 35], [300, 55], [450, 12]].forEach(([sx, sy]) => {
      ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2); ctx.fill();
    });

    // Shadow
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(x + CHAR_SIZE / 2, SCENE_H * 0.68, CHAR_SIZE * 0.38, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Character body
    const bob = running ? Math.sin(f * 0.22) * 5 : 0;
    const cx = x + CHAR_SIZE / 2, cy = y + CHAR_SIZE / 2 + bob;

    // Body
    const bodyGrad = ctx.createRadialGradient(cx, cy + 4, 4, cx, cy + 10, 26);
    bodyGrad.addColorStop(0, "#ff8fc8");
    bodyGrad.addColorStop(1, "#c94080");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 14, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    const headGrad = ctx.createRadialGradient(cx - 2, cy - 10, 2, cx, cy - 8, 14);
    headGrad.addColorStop(0, "#ffe3c8");
    headGrad.addColorStop(1, "#f0b07a");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 14, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#1a0a2e";
    ctx.beginPath(); ctx.arc(cx - 5, cy - 10, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 5, cy - 10, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(cx - 4.2, cy - 10.5, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 5.8, cy - 10.5, 0.8, 0, Math.PI * 2); ctx.fill();

    // Smile
    ctx.strokeStyle = "#7a3020"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy - 4, 5, 0.2, Math.PI - 0.2); ctx.stroke();

    // Legs (walking)
    if (running) {
      const legSwing = Math.sin(f * 0.28) * 14;
      ctx.strokeStyle = "#c94080"; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx - 5, cy + 30); ctx.lineTo(cx - 5 + legSwing, cy + 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 5, cy + 30); ctx.lineTo(cx + 5 - legSwing, cy + 50); ctx.stroke();
    } else {
      ctx.strokeStyle = "#c94080"; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx - 5, cy + 30); ctx.lineTo(cx - 5, cy + 50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 5, cy + 30); ctx.lineTo(cx + 5, cy + 50); ctx.stroke();
    }

    // Arms holding object
    if (picked) {
      const arm = running ? Math.sin(f * 0.22) * 8 : 0;
      ctx.strokeStyle = "#f0b07a"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, cy + 2); ctx.lineTo(cx + 22, cy + arm); ctx.stroke();
      ctx.font = "22px serif";
      ctx.textAlign = "center";
      ctx.fillText(OBJECTS.find(o => o.id === picked)?.emoji, cx + 32, cy + arm + 8);
    } else {
      ctx.strokeStyle = "#f0b07a"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx - 16, cy + 2); ctx.lineTo(cx - 28, cy + 16); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 16, cy + 2); ctx.lineTo(cx + 28, cy + 16); ctx.stroke();
    }

    // Film strip border
    ctx.strokeStyle = "rgba(255,200,80,0.18)"; ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, SCENE_W - 6, SCENE_H - 6);
    // Film holes
    for (let hx = 16; hx < SCENE_W - 10; hx += 26) {
      ctx.fillStyle = "rgba(255,200,80,0.22)";
      ctx.beginPath(); ctx.rect(hx, 6, 10, 8); ctx.fill();
      ctx.beginPath(); ctx.rect(hx, SCENE_H - 14, 10, 8); ctx.fill();
    }
  };

  useAnimLoop(running || done, () => {
    if (running) {
      const c = charRef.current;
      c.x += c.vx;
      c.y += c.vy;
      if (c.x < 10 || c.x > SCENE_W - CHAR_SIZE - 10) c.vx *= -1;
      if (c.y < 20 || c.y > SCENE_H * 0.66 - CHAR_SIZE) c.vy *= -1;
    }
    draw();
  });

  // Initial static draw
  useEffect(() => { if (!running && !done) draw(); });

  const handleStart = () => {
    if (!picked) return;
    setShowClapAnim(true);
    setTimeout(() => { setShowClapAnim(false); setRunning(true); setDone(false); }, 900);
    setStep(2);
  };

  const handleDone = () => {
    setRunning(false);
    setDone(true);
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
    setStep(3);
    draw();
  };

  const handleReset = () => {
    setRunning(false); setDone(false); setPicked(null); setStep(0); setFlash(false);
    charRef.current = { x: 80, y: SCENE_H / 2 - CHAR_SIZE / 2, vx: SPEED, vy: SPEED * 0.6 };
    setTimeout(draw, 50);
  };

  const canStart = picked && !running;
  const canDone = running;

  return (
    <div style={{
      minHeight: "100vh", background: "#07020f",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Georgia', serif", padding: "20px", position: "relative", overflow: "hidden"
    }}>
      {/* Background noise */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.4, pointerEvents: "none", zIndex: 0 }} />

      {/* Flash effect */}
      {flash && <div style={{ position: "fixed", inset: 0, background: "white", opacity: 0.7, zIndex: 999, pointerEvents: "none", animation: "fadeOut 0.6s forwards" }} />}

      {/* Clapper animation */}
      {showClapAnim && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 998, pointerEvents: "none" }}>
          <div style={{ fontSize: 90, animation: "clapBounce 0.4s ease" }}>🎬</div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Courier+Prime&display=swap');
        @keyframes fadeOut { to { opacity: 0 } }
        @keyframes clapBounce { 0%{transform:scale(0.5) rotate(-20deg);opacity:0} 50%{transform:scale(1.2) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        @keyframes filmTicker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes glowPulse { 0%,100%{text-shadow:0 0 12px #ffe06688,0 2px 0 #0007} 50%{text-shadow:0 0 28px #ffe066cc,0 2px 0 #0007} }
        @keyframes slideIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes starSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .obj-btn { border:2px solid transparent; border-radius:14px; padding:10px 14px; cursor:pointer; transition:all 0.18s; background:#1a0a2e; display:flex;flex-direction:column;align-items:center;gap:4px; min-width:68px; }
        .obj-btn:hover { border-color:#ffe066; background:#2a1050; transform:translateY(-2px); }
        .obj-btn.sel { border-color:#ffe066; background:#2a1050; box-shadow:0 0 18px #ffe06666; }
        .action-btn { font-family:'Courier Prime',monospace; font-size:15px; letter-spacing:2px; text-transform:uppercase; border:none; border-radius:10px; padding:13px 36px; cursor:pointer; transition:all 0.18s; }
        .action-btn:disabled { opacity:0.32; cursor:not-allowed; transform:none!important; }
        .action-btn:not(:disabled):hover { transform:translateY(-2px) scale(1.04); }
        .start-btn { background:linear-gradient(135deg,#ffe066,#ff8c42); color:#1a0a2e; font-weight:700; box-shadow:0 4px 22px #ffe06644; }
        .done-btn { background:linear-gradient(135deg,#80e8ff,#4060ff); color:white; font-weight:700; box-shadow:0 4px 22px #80e8ff44; }
        .reset-btn { background:transparent; color:#ffe066aa; border:1px solid #ffe06644; padding:8px 22px; font-size:13px; }
        .reset-btn:hover { background:#ffe06611; color:#ffe066; }
      `}</style>

      {/* Logo */}
      <div style={{ position: "relative", zIndex: 1, marginBottom: 8, textAlign: "center" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(36px,7vw,62px)", fontWeight: 700, color: "#ffe066", animation: "glowPulse 3s infinite", letterSpacing: "-1px" }}>
          🎥 Movietastic
        </div>
        <div style={{ fontFamily: "'Courier Prime',monospace", color: "#ff8fc8aa", fontSize: 13, letterSpacing: 4, textTransform: "uppercase", marginTop: -4 }}>
          — Lights · Camera · Action —
        </div>
      </div>

      {/* Film ticker */}
      <div style={{ width: "100%", maxWidth: 740, overflow: "hidden", background: "#ffe06611", borderTop: "1px solid #ffe06622", borderBottom: "1px solid #ffe06622", marginBottom: 18, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: 40, whiteSpace: "nowrap", animation: "filmTicker 14s linear infinite", fontFamily: "'Courier Prime',monospace", color: "#ffe06688", fontSize: 13, padding: "5px 0" }}>
          {Array(6).fill("🎬 Pick · Start · Move · Done · Cut! · 🎞️").map((t, i) => <span key={i}>{t}&nbsp;&nbsp;&nbsp;</span>)}
        </div>
      </div>

      {/* Main card */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 740, background: "rgba(20,8,40,0.92)", borderRadius: 22, border: "1.5px solid #ffe06628", boxShadow: "0 24px 80px #0009, 0 0 0 1px #ffffff08", padding: "22px 22px 28px", animation: "slideIn 0.5s ease" }}>

        {/* Scene canvas */}
        <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", boxShadow: "0 0 0 3px #ffe06622, 0 8px 40px #0008" }}>
          <canvas ref={canvasRef} width={SCENE_W} height={SCENE_H} style={{ display: "block", width: "100%", height: "auto", background: "linear-gradient(180deg,#1a0535 0%,#0d0520 65%)" }} />
          {done && !running && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(7,2,20,0.7)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 52, animation: "starSpin 2.4s linear infinite" }}>⭐</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", color: "#ffe066", fontSize: 30 }}>Scene Complete!</div>
              <div style={{ fontFamily: "'Courier Prime',monospace", color: "#ff8fc8", fontSize: 14, letterSpacing: 2 }}>THAT'S A WRAP!</div>
            </div>
          )}
          {!running && !done && !picked && (
            <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", fontFamily: "'Courier Prime',monospace", color: "#ffe066aa", fontSize: 13, letterSpacing: 2, textAlign: "center", pointerEvents: "none", background: "rgba(7,2,20,0.6)", borderRadius: 8, padding: "5px 14px" }}>
              ↓ Pick an object below to begin ↓
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 18, marginBottom: 16 }}>
          {["Pick Object", "Start Scene", "Press Done"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: step >= i + 1 ? "#ffe066" : "#ffe06622", color: step >= i + 1 ? "#1a0a2e" : "#ffe06655", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontFamily: "'Courier Prime',monospace", fontWeight: 700, transition: "all 0.3s" }}>{i + 1}</div>
              <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 11, color: step >= i + 1 ? "#ffe066cc" : "#ffe06633", letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
              {i < 2 && <div style={{ width: 18, height: 1, background: step > i + 1 ? "#ffe066aa" : "#ffe06622" }} />}
            </div>
          ))}
        </div>

        {/* Object picker */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Courier Prime',monospace", color: "#ff8fc8aa", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, textAlign: "center" }}>— Props —</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {OBJECTS.map(obj => (
              <button key={obj.id} className={`obj-btn${picked === obj.id ? " sel" : ""}`} onClick={() => { if (!running) { setPicked(obj.id); setStep(s => Math.max(s, 1)); setDone(false); } }}>
                <span style={{ fontSize: 28 }}>{obj.emoji}</span>
                <span style={{ fontFamily: "'Courier Prime',monospace", fontSize: 11, color: picked === obj.id ? "#ffe066" : "#ffe06677", letterSpacing: 1 }}>{obj.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center" }}>
          <button className="action-btn start-btn" disabled={!canStart} onClick={handleStart}>▶ Start</button>
          <button className="action-btn done-btn" disabled={!canDone} onClick={handleDone}>✓ Done</button>
          <button className="action-btn reset-btn" onClick={handleReset}>↺ Reset</button>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, fontFamily: "'Courier Prime',monospace", color: "#ffe06633", fontSize: 12, marginTop: 14, letterSpacing: 2 }}>
        MOVIETASTIC · EST. 2026
      </div>
    </div>
  );
}