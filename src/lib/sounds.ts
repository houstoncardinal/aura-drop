let _ctx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

/* ── tick ─────────────────────────────────────────────
   Nav links, small interactive elements on hover.
   Very short, high-pitched sine sweep. Almost subliminal. */
export function tick() {
  try {
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(680, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(420, c.currentTime + 0.045);
    g.gain.setValueAtTime(0.035, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.045);
    o.start(c.currentTime);
    o.stop(c.currentTime + 0.05);
  } catch {}
}

/* ── whir ─────────────────────────────────────────────
   Card hover. Two slightly detuned sines (3 Hz apart)
   create a gentle shimmer — like touching glass. */
export function whir() {
  try {
    const c = ctx();
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    const g = c.createGain();
    o1.connect(g); o2.connect(g); g.connect(c.destination);
    o1.type = "sine"; o2.type = "sine";
    o1.frequency.value = 1046;
    o2.frequency.value = 1049;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.015, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    o1.start(c.currentTime); o2.start(c.currentTime);
    o1.stop(c.currentTime + 0.09); o2.stop(c.currentTime + 0.09);
  } catch {}
}

/* ── click ────────────────────────────────────────────
   Standard button / UI press. Low thud with fast decay.
   Satisfying but quiet. */
export function click() {
  try {
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(230, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(65, c.currentTime + 0.07);
    g.gain.setValueAtTime(0.11, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07);
    o.start(c.currentTime);
    o.stop(c.currentTime + 0.08);
  } catch {}
}

/* ── chime ────────────────────────────────────────────
   Primary CTA press. Ascending C-E-G major arpeggio.
   Rewarding, musical, matches the platform's creative soul. */
export function chime() {
  try {
    const c = ctx();
    const notes: [number, number][] = [
      [523.25, 0],      // C5
      [659.25, 0.05],   // E5
      [783.99, 0.10],   // G5
    ];
    notes.forEach(([freq, delay]) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, c.currentTime + delay);
      g.gain.linearRampToValueAtTime(0.052, c.currentTime + delay + 0.018);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + 0.32);
      o.start(c.currentTime + delay);
      o.stop(c.currentTime + delay + 0.35);
    });
  } catch {}
}

/* ── blip ─────────────────────────────────────────────
   Input field focus. Barely there. Just enough to feel it. */
export function blip() {
  try {
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = "sine";
    o.frequency.value = 900;
    g.gain.setValueAtTime(0.022, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.032);
    o.start(c.currentTime);
    o.stop(c.currentTime + 0.04);
  } catch {}
}

/* ── success ──────────────────────────────────────────
   Form submission confirmed. Warm G-C-E major arpeggio,
   longer decay. Feels like an achievement. */
export function success() {
  try {
    const c = ctx();
    const notes: [number, number][] = [
      [392.00, 0],      // G4
      [523.25, 0.09],   // C5
      [659.25, 0.18],   // E5
    ];
    notes.forEach(([freq, delay]) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, c.currentTime + delay);
      g.gain.linearRampToValueAtTime(0.058, c.currentTime + delay + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + 0.55);
      o.start(c.currentTime + delay);
      o.stop(c.currentTime + delay + 0.6);
    });
  } catch {}
}
