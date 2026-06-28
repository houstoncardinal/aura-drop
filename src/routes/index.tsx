import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getIgFeeds, formatIgCount, type IgFeed } from "../lib/instagram";
import { E } from "../lib/editor";
import {
  CipherRain,
  ClickRipple,
  Cursor,
  EyeOfRa,
  LiveBackground,
  MagneticButton,
  Particles,
  PyramidDecor,
  PyramidDivider,
  SiteFooter,
  SiteNav,
  SoundEngine,
  useReveal,
} from "../components/site-shell";
import { success as playSuccess } from "../lib/sounds";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Vault — Submit your music to industry curators" },
      {
        name: "description",
        content:
          "Drop your track into The Vault. Active industry curators listen to every submission and respond within 48 hours.",
      },
      { property: "og:title", content: "The Vault — Submit your music to industry curators" },
      {
        property: "og:description",
        content:
          "Direct access to working producers, engineers and visual directors. Real reviews, 48-hour turnaround.",
      },
    ],
  }),
  loader: () => getIgFeeds(),
  component: VaultPage,
});

type IgPost = { gradient: string; glyph: string; isVideo?: boolean; thumb?: string };

const curators = [
  {
    name: "Hunain Qureshi",
    handle: "@ogsbyoung",
    instagram: "https://www.instagram.com/ogsbyoung/",
    soundcloud: "https://soundcloud.com/ogsbyoung",
    appleMusic: "https://music.apple.com/us/artist/ogsb-young/1137212188",
    youtube: null as string | null,
    role: "Artist · Engineer · CEO",
    location: "Houston, TX",
    badge: "Founder",
    credential: "He's been the artist waiting for a response. Now he's the one who sends it.",
    accent: "from-emerald-400/40 to-teal-500/10",
    initials: "HQ",
    online: true,
    // UPDATE these with your real counts
    followers: "8.2K",
    following: 1247,
    postsCount: 94,
    instaBio: "Music Engineer & Producer 🎛️\nCEO · The Vault 🔐\nHouston, TX",
    igPosts: [
      { gradient: "from-emerald-900/90 to-zinc-900", glyph: "△" },
      { gradient: "from-zinc-900 to-teal-950", glyph: "◆" },
      { gradient: "from-slate-900 to-zinc-950", glyph: "♩" },
      { gradient: "from-teal-900/70 to-emerald-950", glyph: "◈" },
      { gradient: "from-zinc-800 to-zinc-950", glyph: "∞" },
      { gradient: "from-emerald-950 to-teal-900/40", glyph: "Ψ" },
    ] as IgPost[],
  },
  {
    name: "Akeef Studios",
    handle: "@akeefstudios",
    instagram: "https://www.instagram.com/akeefstudios",
    soundcloud: null as string | null,
    appleMusic: null as string | null,
    youtube: "https://www.youtube.com/@Akeefstudios",
    role: "Film Director · Creative Director",
    location: "Baltimore / DMV",
    badge: "Director",
    credential: "Shot NBA YoungBoy, Birdman, Real Boston Richey. He sees what your music looks like before you do.",
    accent: "from-teal-300/40 to-emerald-600/10",
    initials: "AK",
    online: true,
    // UPDATE these with your real counts
    followers: "52.4K",
    following: 2891,
    postsCount: 247,
    instaBio: "Film Director 🎬 · Creative Cartel 412\nNBA YoungBoy · Birdman · Real Boston Richey\nPittsburgh · Baltimore · DMV",
    igPosts: [
      { gradient: "from-zinc-900 to-zinc-950", glyph: "▶", isVideo: true, thumb: "https://img.youtube.com/vi/uk6VNPWWXqM/hqdefault.jpg" },
      { gradient: "from-neutral-900 to-zinc-950", glyph: "▶", isVideo: true },
      { gradient: "from-zinc-900 to-emerald-900/30", glyph: "◎" },
      { gradient: "from-slate-800/60 to-zinc-950", glyph: "✦" },
      { gradient: "from-emerald-900/50 to-zinc-900", glyph: "△" },
      { gradient: "from-zinc-900 to-teal-900/30", glyph: "⊕" },
    ] as IgPost[],
  },
];

const genreCategories = [
  {
    label: "Hip-Hop & Rap",
    genres: [
      "Trap", "Drill", "UK Drill", "Melodic Rap", "Lyrical / Conscious",
      "Rage / Pluggnb", "Phonk", "Boom Bap", "Emo Rap", "Houston Rap / Screw",
      "East Coast Hip-Hop", "West Coast", "Southern Hip-Hop", "Midwest Hip-Hop",
      "Mumble Rap", "Jazz Rap", "Country Rap",
    ],
  },
  {
    label: "R&B & Soul",
    genres: [
      "R&B", "Alternative R&B", "Neo-Soul", "PBR&B / Bedroom R&B",
      "Contemporary Soul", "Gospel / Christian Hip-Hop",
    ],
  },
  {
    label: "Electronic & Club",
    genres: [
      "Club / House", "Hyperpop / Digicore", "Lo-fi / Chillhop",
      "Jersey Club", "Footwork / Juke", "Ambient / Atmospheric", "EDM / Future Bass",
    ],
  },
  {
    label: "Pop & Alternative",
    genres: [
      "Pop", "Indie Pop", "Alt-Pop", "Dark Pop", "Emo / Pop-Punk", "Indie Rock",
    ],
  },
  {
    label: "World & Latin",
    genres: [
      "Afrobeats / Afropop", "Reggaeton", "Latin Trap", "Dancehall", "Reggae", "Amapiano",
    ],
  },
  {
    label: "Other",
    genres: ["Experimental", "Instrumental", "Spoken Word / Poetry"],
  },
];

const pitchPrompts = [
  "The vibe is...",
  "Sounds like ... meets ...",
  "This track is about...",
  "The best moment is...",
  "I made this because...",
  "Drop-ready for...",
];

function detectPlatform(url: string): string | null {
  if (!url.trim()) return null;
  if (url.includes("spotify")) return "Spotify";
  if (url.includes("apple.com/music") || url.includes("music.apple")) return "Apple Music";
  if (url.includes("soundcloud")) return "SoundCloud";
  if (url.includes("youtube") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("instagram")) return "Instagram";
  if (url.includes("tiktok")) return "TikTok";
  if (url.includes("audiomack")) return "Audiomack";
  if (url.includes("distrokid") || url.includes("tunecore") || url.includes("distrib")) return "Distributor";
  return null;
}

type FormState = {
  artist: string;
  title: string;
  genre: string;
  file: File | null;
  link: string;
  pitch: string;
};

const initialForm: FormState = {
  artist: "",
  title: "",
  genre: "",
  file: null,
  link: "",
  pitch: "",
};

const steps = [
  { id: 1, label: "Identity", hint: "Who's submitting" },
  { id: 2, label: "The Track", hint: "Audio + metadata" },
  { id: 3, label: "The Pitch", hint: "Make it count" },
];


/* ─────────────────  PAGE  ───────────────── */

function VaultPage() {
  const igFeeds = Route.useLoaderData();
  return (
    <main className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <Cursor />
      <SoundEngine />
      <ClickRipple />
      <LiveBackground />
      <CipherRain />
      <Particles />
      <SiteNav />
      <Hero />
      <PyramidDivider />
      <Curators igFeeds={igFeeds} />
      <PyramidDivider />
      <HowItWorks />
      <PyramidDivider />
      <Packages />
      <SiteFooter />
    </main>
  );
}

/* ─────────────────  NAV  ───────────────── */

/* ─────────────────  HERO  ───────────────── */

function Hero() {
  return (
    <section id="top" className="relative z-10 overflow-hidden px-6 pb-16 pt-24 lg:px-10 lg:pb-28 lg:pt-32">
      <PyramidDecor className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] opacity-[0.11] lg:opacity-[0.16]" />

      <div className="mx-auto grid max-w-6xl items-start gap-10 xl:gap-14 xl:grid-cols-[1fr_480px]">

        {/* ── Left column ── */}
        <div className="flex min-w-0 flex-col gap-6">

          {/* Status badge */}
          <div
            className="inline-flex w-fit items-center gap-2.5 rounded-full border border-zinc-800/80 bg-zinc-900/50 px-4 py-2 backdrop-blur-sm animate-reveal-up"
            style={{ animationDelay: "0ms" }}
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Vault open · queue live
            </span>
            <span className="h-3 w-px bg-zinc-700" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">48h response</span>
          </div>

          {/* Headline — cinematic 3-line */}
          <div className="overflow-hidden pb-2">
            <h1
              className="font-display font-bold leading-[1.05] tracking-tight animate-text-clip"
              style={{
                fontSize: "clamp(3rem, 5.5vw, 6.5rem)",
                animationDelay: "60ms",
              }}
            >
              <E id="hero.line1" as="span" className="block">The room</E>
              <E id="hero.line2" as="span" className="block font-light text-zinc-500" style={{ fontSize: "clamp(2.6rem, 4.8vw, 5.8rem)" }}>
                you've been
              </E>
              <E id="hero.line3" as="span" className="text-shimmer italic">trying to reach.</E>
            </h1>
          </div>

          {/* Subtext */}
          <E
            id="hero.subtext"
            as="p"
            className="max-w-[52ch] text-pretty text-base leading-relaxed text-zinc-400 animate-reveal-up"
            style={{ animationDelay: "200ms" }}
            multiline
          >
            Every submission is reviewed by working industry professionals and catalogued in The Vault's private artist library — a curated roster that record labels and A&R teams actively browse. Real ears, 48 hours, no bots.
          </E>

          {/* CTA row */}
          <div
            className="flex flex-wrap items-center gap-4 animate-reveal-up"
            style={{ animationDelay: "300ms" }}
          >
            <MagneticButton
              href="#submit"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-accent px-7 py-4 font-display text-sm font-semibold uppercase tracking-wider text-zinc-950 transition-all hover:scale-[1.03] hover:shadow-[0_0_60px_-4px_rgba(52,211,153,0.85)]"
            >
              <span className="shimmer pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100" />
              <span className="relative">Submit your track</span>
              <span className="relative transition-transform group-hover:translate-x-1">→</span>
            </MagneticButton>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              First submission free
            </span>
          </div>

          {/* Live ticker */}
          <div className="min-w-0 animate-reveal-up" style={{ animationDelay: "420ms" }}>
            <LiveTicker />
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="animate-reveal-up" style={{ animationDelay: "100ms" }}>
          <SubmissionWizard />
        </div>
      </div>
    </section>
  );
}

function LiveTicker() {
  const items = [
    "48h avg response",
    "142 artists signed",
    "12.4k reviews sent",
    "Trap · R&B · Hip-Hop · Pop · Alt",
    "3 curators reviewing now",
    "Real humans only",
    "No bots · No templates",
  ];
  const row = items.map((t) => `${t}  ·  `).join("");

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/25 py-3">
      <div className="flex w-max animate-ticker select-none">
        <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
          {row}{row}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-zinc-900/25 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-zinc-900/25 to-transparent" />
    </div>
  );
}

/* ─────────────────  ANIMATED STAT  ───────────────── */

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    const disp = displayRef.current;
    if (!el || !disp) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        obs.disconnect();
        const numStr = value.replace(/[^0-9.]/g, "");
        const suffix = value.replace(/[0-9.]/g, "");
        const target = parseFloat(numStr);
        const isDecimal = numStr.includes(".");
        const duration = 1600;
        let startT: number | null = null;
        const animate = (now: number) => {
          if (!startT) startT = now;
          const t = Math.min((now - startT) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const cur = target * eased;
          if (disp) disp.textContent = (isDecimal ? cur.toFixed(1) : Math.floor(cur).toString()) + suffix;
          if (t < 1) requestAnimationFrame(animate);
          else if (disp) disp.textContent = value;
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col gap-1 bg-zinc-950 px-6 py-5 transition-colors hover:bg-zinc-900/60">
      <span ref={displayRef} className="font-display text-3xl font-semibold tracking-tight text-zinc-50">0</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</span>
    </div>
  );
}

/* ─────────────────  ELECTRIC BORDER  ───────────────── */

function ElectricBorderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rawCtx = canvas.getContext("2d");
    if (!rawCtx) return;
    const c = rawCtx;

    const setSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    setSize();
    window.addEventListener("resize", setSize);

    type Spark = { t: number; speed: number; len: number; bright: number };
    const sparks: Spark[] = [
      { t: 0,    speed: 0.0024, len: 0.11, bright: 1.0  },
      { t: 0.52, speed: 0.0016, len: 0.08, bright: 0.65 },
      { t: 0.78, speed: 0.0010, len: 0.05, bright: 0.38 },
    ];

    // Map t ∈ [0,1] → (x,y) along the rectangle perimeter
    const toXY = (t: number): [number, number] => {
      const w = canvas.width, h = canvas.height;
      const d = (((t % 1) + 1) % 1) * 2 * (w + h);
      if (d < w)           return [d, 0];
      if (d < w + h)       return [w, d - w];
      if (d < 2 * w + h)   return [w - (d - w - h), h];
      return [0, h - (d - 2 * w - h)];
    };

    let raf: number;

    const tick = () => {
      c.clearRect(0, 0, canvas.width, canvas.height);

      for (const s of sparks) {
        s.t = (s.t + s.speed) % 1;

        // Draw comet tail
        const STEPS = 60;
        for (let i = 0; i <= STEPS; i++) {
          const frac = i / STEPS;
          const [x, y] = toXY(((s.t - frac * s.len) % 1 + 1) % 1);
          const a = (1 - frac) * s.bright;
          const r = (1 - frac) * 2.2 + 0.2;

          // Wide ambient glow
          c.beginPath();
          c.arc(x, y, r * 9, 0, Math.PI * 2);
          c.fillStyle = `rgba(52,211,153,${a * 0.055})`;
          c.fill();

          // Mid bloom
          c.beginPath();
          c.arc(x, y, r * 3.2, 0, Math.PI * 2);
          c.fillStyle = `rgba(52,211,153,${a * 0.30})`;
          c.fill();

          // Hot white core
          c.beginPath();
          c.arc(x, y, r * 0.75, 0, Math.PI * 2);
          c.fillStyle = `rgba(255,255,255,${a * 0.95})`;
          c.fill();
        }

        // Head flare with random flicker
        const [hx, hy] = toXY(s.t);
        const flicker = 0.72 + Math.random() * 0.28;
        c.save();
        c.shadowColor = "#34d399";
        c.shadowBlur = 26 * flicker;
        // Outer corona
        c.beginPath();
        c.arc(hx, hy, 7 * flicker, 0, Math.PI * 2);
        c.fillStyle = `rgba(52,211,153,${0.45 * flicker})`;
        c.fill();
        // Bright core
        c.beginPath();
        c.arc(hx, hy, 3 * flicker, 0, Math.PI * 2);
        c.fillStyle = `rgba(255,255,255,${flicker})`;
        c.fill();
        c.restore();
      }

      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => { window.removeEventListener("resize", setSize); cancelAnimationFrame(raf); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

/* ─────────────────  WIZARD  ───────────────── */

function SubmissionWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const stepValid = useMemo(() => {
    if (step === 1) return form.artist.trim().length > 1;
    if (step === 2) return form.genre !== "" && (form.file !== null || form.link.trim().length > 4);
    if (step === 3) return form.title.trim().length > 0 && form.pitch.trim().length > 10;
    return false;
  }, [step, form]);

  function next() {
    if (!stepValid) return;
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  }
  function back() { if (step > 1) setStep(step - 1); }
  async function handleSubmit() {
    if (user) {
      await supabase.from("submissions").insert({
        user_id: user.id,
        artist_name: form.artist,
        track_title: form.title,
        track_url: form.link,
        platform: null,
        genre: form.genre,
        pitch: form.pitch,
        status: "pending",
      });
    }
    setSubmitted(true);
  }

  return (
    <div id="submit" className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-accent/10 via-transparent to-accent/5 blur-2xl" />
      <div className="absolute -inset-px rounded-[1.5rem] bg-gradient-to-b from-zinc-700/60 via-zinc-800/20 to-transparent" />

      <div className="vault-glow relative overflow-hidden rounded-3xl border border-accent/20 bg-zinc-950/80 p-5 backdrop-blur-xl lg:p-7">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/30">
              <span className="size-2 rounded-full bg-accent animate-pulse-ring" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Submission Channel
              </span>
              <span className="font-display text-sm font-medium text-zinc-100">
                Encrypted · Live curator queue
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Step {step} / 3
          </span>
        </div>

        <Progress step={step} />

        <div className="mt-5 min-h-[260px]">
          {submitted ? (
            <SuccessPanel />
          ) : (
            <div key={step} className="animate-float-up">
              {step === 1 && <StepIdentity form={form} update={update} />}
              {step === 2 && <StepTrack form={form} update={update} />}
              {step === 3 && <StepPitch form={form} update={update} />}
            </div>
          )}
        </div>

        {!submitted && (
          <div className="mt-5 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={back}
              disabled={step === 1}
              className="rounded-full px-5 py-3 text-xs font-medium uppercase tracking-wider text-zinc-400 transition-all hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!stepValid}
              className="group relative flex-1 overflow-hidden rounded-full bg-accent px-6 py-4 font-display text-sm font-semibold uppercase tracking-wider text-zinc-950 transition-all hover:shadow-[0_0_40px_-6px_rgba(52,211,153,0.8)] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {step === 3 ? "Deposit into Vault" : "Continue"}
                <span className="transition-transform group-enabled:group-hover:translate-x-1">→</span>
              </span>
              {stepValid && <span className="absolute inset-0 shimmer opacity-60" />}
            </button>
          </div>
        )}

        {!submitted && (
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
            🔒 Encrypted upload · Reviewed within 48h · Zero spam
          </p>
        )}

        {/* Electric border — lives current running the perimeter */}
        <ElectricBorderCanvas />
      </div>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-3">
      {steps.map((s, i) => {
        const active = step === s.id;
        const done = step > s.id;
        return (
          <div key={s.id} className="flex flex-1 items-center gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full rounded-full bg-accent transition-all duration-700 ease-out ${
                    done ? "w-full" : active ? "w-1/2" : "w-0"
                  }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.2em] transition-colors ${
                    active || done ? "text-accent" : "text-zinc-600"
                  }`}
                >
                  0{s.id} · {s.label}
                </span>
              </div>
            </div>
            {i < steps.length - 1 && <span className="text-zinc-700">·</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Smart sub-components ─────────────────────────── */

function CuratorTip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-zinc-900/60 px-4 py-3 ring-1 ring-zinc-800/70">
      <span className="mt-[3px] size-1.5 shrink-0 rounded-full bg-accent" />
      <p className="text-[11px] leading-relaxed text-zinc-500">{text}</p>
    </div>
  );
}

function PitchMeter({ length }: { length: number }) {
  const { label, color, pct } =
    length === 0   ? { label: "Start writing",  color: "bg-zinc-700",     pct: 0 }
    : length < 40  ? { label: "Too brief",       color: "bg-zinc-600",     pct: 15 }
    : length < 100 ? { label: "Getting there",   color: "bg-amber-500/80", pct: 42 }
    : length < 180 ? { label: "Strong pitch",    color: "bg-accent/80",    pct: 72 }
    :                { label: "Sharp",            color: "bg-accent",       pct: 100 };
  return (
    <div className="mt-1.5 flex items-center gap-3">
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-zinc-800">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`w-24 text-right font-mono text-[10px] uppercase tracking-wider transition-colors ${length >= 100 ? "text-accent" : "text-zinc-600"}`}>
        {label}
      </span>
    </div>
  );
}

function GenrePicker({ value, onChange }: { value: string; onChange: (g: string) => void }) {
  const [query, setQuery] = useState("");

  const grouped = query.trim()
    ? [{ label: "Results", genres: genreCategories.flatMap(c => c.genres).filter(g => g.toLowerCase().includes(query.toLowerCase())) }]
    : genreCategories;

  return (
    <div className="flex flex-col gap-2.5">
      {/* Search input */}
      <div className="relative">
        <svg className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search genres..."
          className="vault-input pl-8 text-sm"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-zinc-500 hover:text-zinc-300">
            ✕
          </button>
        )}
      </div>

      {/* Scrollable genre list */}
      <div className="max-h-44 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 flex flex-col gap-4">
        {grouped.map(cat => (
          <div key={cat.label} className="flex flex-col gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">{cat.label}</span>
            <div className="flex flex-wrap gap-1.5">
              {cat.genres.map(g => {
                const active = value === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onChange(active ? "" : g)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                      active
                        ? "border-accent bg-accent/10 text-accent shadow-[0_0_16px_-6px_rgba(52,211,153,0.5)]"
                        : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {active && <span className="mr-1 text-[10px]">✓</span>}
                    {g}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {grouped[0]?.genres.length === 0 && (
          <p className="py-4 text-center text-xs text-zinc-600">No genres matching "{query}"</p>
        )}
      </div>

      {/* Selected pill */}
      {value && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">Selected</span>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">{value}</span>
          </div>
          <button type="button" onClick={() => onChange("")}
            className="font-mono text-[10px] uppercase tracking-wider text-zinc-600 hover:text-zinc-400">
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Steps ─────────────────────────────────────────── */

function StepIdentity({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const platform = useMemo(() => detectPlatform(form.link), [form.link]);

  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Who's submitting?" sub="Your artist name exactly as it appears on streaming platforms." />
      <CuratorTip text="Curators will search your name before they respond. A clean profile link lets them get to your music in seconds — and makes a strong first impression before they even press play." />
      <Field label="Artist Name">
        <input
          autoFocus
          value={form.artist}
          onChange={(e) => update("artist", e.target.value)}
          placeholder="e.g. Nova Reign"
          className="vault-input"
        />
      </Field>
      <Field label="Streaming or Social Link" hint="Recommended — helps curators find you instantly">
        <div className="relative">
          <input
            value={form.link}
            onChange={(e) => update("link", e.target.value)}
            placeholder="spotify.com/artist/... · soundcloud.com/... · @yourhandle"
            className={`vault-input transition-all ${platform ? "pr-28" : ""}`}
          />
          {platform && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                {platform} detected
              </span>
            </div>
          )}
        </div>
      </Field>
    </div>
  );
}

function StepTrack({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const ext = form.file?.name.split(".").pop()?.toUpperCase() ?? null;

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) update("file", f);
  }

  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Drop the track" sub="Tell us exactly what you made — genre matching affects how fast you get reviewed." />
      <CuratorTip text="Genre accuracy matters. Curators specialize. A trap record sent to the wrong ear gets a slower response. Pick the closest match to how you'd actually describe the sound." />

      <Field label="Genre">
        <GenrePicker value={form.genre} onChange={(g) => update("genre", g)} />
      </Field>

      <Field label="Audio File">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`group relative flex cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            dragOver
              ? "border-accent bg-accent/5"
              : form.file
              ? "border-accent/60 bg-accent/[0.04]"
              : "border-zinc-800 bg-zinc-900/30 hover:border-accent/30 hover:bg-zinc-900/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => update("file", e.target.files?.[0] ?? null)}
            className="sr-only"
          />
          {form.file ? (
            <div className="flex w-full flex-col items-center gap-3">
              <Waveform />
              <div className="flex flex-col items-center gap-1">
                <span className="font-display text-sm font-medium text-zinc-100">{form.file.name}</span>
                <div className="flex items-center gap-2">
                  {ext && <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">{ext}</span>}
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    {(form.file.size / (1024 * 1024)).toFixed(2)} MB · Ready to deposit
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); update("file", null); }}
                className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 hover:text-accent"
              >
                Replace file
              </button>
            </div>
          ) : (
            <>
              <div className="flex size-12 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-zinc-800 transition-all group-hover:bg-accent/10 group-hover:ring-accent/30">
                <span className="size-4 bg-zinc-400 transition-colors group-hover:bg-accent" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-zinc-200">Drop your file here, or <span className="text-accent">browse</span></span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">WAV · AIFF · MP3 · up to 50 MB</span>
              </div>
            </>
          )}
        </label>
      </Field>
    </div>
  );
}

function StepPitch({
  form,
  update,
}: {
  form: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  function applyPrompt(prompt: string) {
    const current = form.pitch.trim();
    const separator = current.length > 0 ? " " : "";
    update("pitch", (current + separator + prompt).slice(0, 280));
  }

  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Make it count" sub="This is the only thing standing between your track and a curator's full attention." />
      <CuratorTip text="Pitches between 100–200 characters get the most action. Be specific — name the feeling, the sound, who it's for. Generic pitches get generic responses." />
      <Field label="Track Title">
        <input
          autoFocus
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Midnight Ceremony"
          className="vault-input"
        />
      </Field>
      <Field label="The Pitch">
        {/* Starter prompts */}
        {form.pitch.length < 30 && (
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600 self-center">Start with:</span>
            {pitchPrompts.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => applyPrompt(p)}
                className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 font-mono text-[10px] text-zinc-400 transition-all hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <textarea
          value={form.pitch}
          onChange={(e) => update("pitch", e.target.value.slice(0, 280))}
          placeholder="Why does this track deserve a curator's ears tonight?"
          rows={4}
          className="vault-input resize-none"
        />
        <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          <span>{form.pitch.length} / 280</span>
          <span className={form.pitch.length >= 100 ? "text-accent" : ""}>{form.pitch.length >= 100 ? "Good length" : "Keep going"}</span>
        </div>
        <PitchMeter length={form.pitch.length} />
      </Field>
    </div>
  );
}

function SuccessPanel() {
  useEffect(() => { playSuccess(); }, []);
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 text-center animate-float-up">
      <div className="relative flex size-20 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/40">
        <span className="absolute inset-0 rounded-full animate-pulse-ring" />
        <svg viewBox="0 0 24 24" fill="none" className="size-9 text-accent">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-2xl font-semibold tracking-tight">Deposited into the Vault</h3>
        <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
          Three curators have been notified. Expect a personal response within 48 hours, straight to your inbox.
        </p>
      </div>
      <div className="mt-2 flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-2">
        <span className="size-1.5 animate-pulse rounded-full bg-accent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
          Reference · VLT-{Math.floor(Math.random() * 90000 + 10000)}
        </span>
      </div>
    </div>
  );
}

function StepHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-zinc-50">{title}</h2>
      <p className="text-sm text-zinc-500">{sub}</p>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</label>
        {hint && <span className="text-[10px] text-zinc-600">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Waveform() {
  const bars = 28;
  return (
    <div className="flex h-10 items-center gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="block w-[3px] origin-center rounded-full bg-accent animate-wave"
          style={{ height: `${30 + Math.abs(Math.sin(i * 0.6)) * 70}%`, animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

/* ─────────────────  CURATORS  ───────────────── */

function Curators({ igFeeds }: { igFeeds: Record<string, IgFeed | null> }) {
  const { ref, visible } = useReveal(0.08);
  return (
    <section
      id="curators"
      ref={ref as React.RefObject<HTMLElement>}
      className="relative z-10 border-t border-zinc-900/80 bg-zinc-950/40 px-6 py-16 lg:px-10 lg:py-28"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <div
          className={`flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-accent">△ Your Curators</span>
            <h2 className="max-w-2xl font-display font-bold tracking-tight" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: "1.0" }}>
              <E id="curators.headline" as="span">Two people who've built careers in this industry.</E>{" "}
              <span className="font-normal italic text-zinc-500">
                <E id="curators.headline_sub" as="span">Now listening for yours.</E>
              </span>
            </h2>
          </div>
          <E id="curators.description" as="p" className="max-w-sm text-sm leading-relaxed text-zinc-400" multiline>
            A small, intentional panel — not a network of faceless reviewers. Every submission reaches both curators directly. No filtering, no forwarding, no silence.
          </E>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {curators.map((c, idx) => (
            <CuratorCard
              key={c.name}
              c={c}
              idx={idx}
              sectionVisible={visible}
              igFeed={igFeeds[c.handle.replace("@", "")] ?? null}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────  CURATOR CARD (Instagram preview)  ───────────────── */

function IgStat({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-sm font-bold text-zinc-100">{n}</span>
      <span className="text-[11px] text-zinc-500">{label}</span>
    </div>
  );
}

function CuratorCard({
  c,
  idx,
  sectionVisible,
  igFeed,
}: {
  c: (typeof curators)[number];
  idx: number;
  sectionVisible: boolean;
  igFeed: IgFeed | null;
}) {
  // Derive display values — real API data wins, hardcoded fallback if token not set
  const profile = igFeed?.profile;
  const liveMedia = igFeed?.media ?? [];
  const displayName  = profile?.name        ?? c.name;
  const displayBio   = profile?.biography   ?? c.instaBio;
  const displayFollowers = profile ? formatIgCount(profile.followers_count) : c.followers;
  const displayFollowing = profile ? formatIgCount(profile.follows_count)   : c.following.toLocaleString();
  const displayPosts     = profile ? profile.media_count.toString()         : c.postsCount.toString();
  const profilePicUrl    = profile?.profile_picture_url ?? null;
  const cardRef = useRef<HTMLElement>(null);
  const specRef = useRef<HTMLDivElement>(null);

  const onEnter = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transition = "transform 0.05s ease";
  }, []);

  const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    const spec = specRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(y - 0.5) * -8}deg) rotateY(${(x - 0.5) * 8}deg) scale3d(1.015,1.015,1.015)`;
    if (spec) {
      spec.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(52,211,153,0.10) 0%, transparent 60%)`;
      spec.style.opacity = "1";
    }
  }, []);

  const onLeave = useCallback(() => {
    const el = cardRef.current;
    const spec = specRef.current;
    if (el) {
      el.style.transition = "transform 0.65s cubic-bezier(0.23,1,0.32,1)";
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      setTimeout(() => { if (el) el.style.transition = ""; }, 700);
    }
    if (spec) spec.style.opacity = "0";
  }, []);

  return (
    <article
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 elite-shadow"
      style={{
        transformStyle: "preserve-3d",
        transition: `opacity 0.7s ease ${idx * 180}ms, transform 0.7s ease ${idx * 180}ms`,
        opacity: sectionVisible ? 1 : 0,
        transform: sectionVisible ? "translateY(0)" : "translateY(36px)",
      }}
    >
      {/* Specular sheen */}
      <div ref={specRef} className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0" style={{ transition: "opacity 0.3s ease" }} />
      {/* Hover border glow */}
      <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: "0 0 0 1px rgba(52,211,153,0.25), 0 0 50px -10px rgba(52,211,153,0.15)" }}
      />

      {/* ── Instagram header bar ── */}
      <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/70 bg-zinc-950 px-4 py-3">
        <div className="flex items-center gap-2.5">
          {/* Instagram gradient icon */}
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
            <svg viewBox="0 0 24 24" fill="white" className="size-3.5">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-100">{c.handle}</span>
          {/* Online badge */}
          {c.online && (
            <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 ring-1 ring-accent/20">
              <span className="size-1 rounded-full bg-accent animate-pulse" />
              <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-accent">Active</span>
            </span>
          )}
        </div>
        <a
          href={c.instagram}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-full bg-accent px-4 py-1.5 text-[12px] font-bold text-zinc-950 transition-all hover:shadow-[0_0_16px_-4px_rgba(52,211,153,0.7)]"
        >
          Follow
        </a>
      </div>

      {/* ── Profile section ── */}
      <div className="relative z-10 px-5 pb-4 pt-5">
        <div className="flex items-center gap-4">
          {/* Avatar with IG story ring */}
          <div className="relative shrink-0">
            <div className="size-[78px] rounded-full p-[2.5px]" style={{ background: "linear-gradient(135deg, #c13584, #e1306c, #f56040, #f77737, #fcaf45)" }}>
              <div className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${c.accent} ring-2 ring-zinc-950 overflow-hidden`}>
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <span className="font-display text-2xl font-bold tracking-tight text-zinc-50 select-none">{c.initials}</span>
                )}
              </div>
            </div>
            {c.online && (
              <span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-zinc-950">
                <span className="size-3 rounded-full bg-accent" />
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-1 items-center justify-around">
            <IgStat n={displayPosts} label="posts" />
            <div className="h-6 w-px bg-zinc-800" />
            <IgStat n={displayFollowers} label="followers" />
            <div className="h-6 w-px bg-zinc-800" />
            <IgStat n={displayFollowing} label="following" />
          </div>
        </div>

        {/* Name + role + bio */}
        <div className="mt-4 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-50">{displayName}</span>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-accent ring-1 ring-accent/20">
              {c.badge}
            </span>
          </div>
          <p className="text-[12px] font-medium text-zinc-400">{c.role}</p>
          <p className="whitespace-pre-line text-[13px] leading-relaxed text-zinc-200">{displayBio}</p>
          <div className="flex items-center gap-1 pt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3 text-zinc-500">
              <path d="M12 21s-8-4.5-8-11.8A8 8 0 0112 3a8 8 0 018 6.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="text-[12px] text-zinc-500">{c.location}</span>
          </div>
        </div>

        {/* Platform links row */}
        <div className="mt-3 flex items-center gap-2">
          {c.youtube && (
            <a href={c.youtube} target="_blank" rel="noreferrer noopener"
              className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-all hover:border-red-500/40 hover:text-red-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-2.5"><path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.38.55A3.02 3.02 0 00.5 6.19C0 8.03 0 12 0 12s0 3.97.5 5.81a3.02 3.02 0 002.12 2.14C4.45 20.5 12 20.5 12 20.5s7.55 0 9.38-.55a3.02 3.02 0 002.12-2.14C24 15.97 24 12 24 12s0-3.97-.5-5.81zM9.75 15.5V8.5l6.25 3.5-6.25 3.5z"/></svg>
              YouTube
            </a>
          )}
          {c.soundcloud && (
            <a href={c.soundcloud} target="_blank" rel="noreferrer noopener"
              className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-all hover:border-orange-500/40 hover:text-orange-400">
              SoundCloud
            </a>
          )}
          {c.appleMusic && (
            <a href={c.appleMusic} target="_blank" rel="noreferrer noopener"
              className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-all hover:border-pink-500/40 hover:text-pink-400">
              Apple Music
            </a>
          )}
        </div>
      </div>

      {/* ── Post grid — real media when token set, styled placeholders otherwise ── */}
      <div className="relative z-10 grid grid-cols-3 gap-0.5 border-t border-zinc-800/70">
        {liveMedia.length > 0
          ? liveMedia.map((post) => {
              const isVideo = post.media_type === "VIDEO" || post.media_type === "CAROUSEL_ALBUM";
              const thumb = post.thumbnail_url ?? post.media_url;
              return (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group/post relative block overflow-hidden"
                  style={{ aspectRatio: "1/1" }}
                >
                  <img
                    src={thumb}
                    alt={post.caption?.slice(0, 60) ?? ""}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/post:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/0 opacity-0 transition-all duration-200 group-hover/post:bg-zinc-950/40 group-hover/post:opacity-100">
                    <svg viewBox="0 0 24 24" fill="white" className="size-5 drop-shadow">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  {isVideo && (
                    <div className="absolute right-1.5 top-1.5">
                      <svg viewBox="0 0 24 24" fill="white" className="size-3.5 drop-shadow">
                        <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
                      </svg>
                    </div>
                  )}
                </a>
              );
            })
          : c.igPosts.map((post, i) => (
              <a
                key={i}
                href={c.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="group/post relative block overflow-hidden"
                style={{ aspectRatio: "1/1" }}
              >
                {post.thumb ? (
                  <img src={post.thumb} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover/post:scale-110" />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${post.gradient}`}>
                    <span className="select-none font-mono text-3xl text-white/10">{post.glyph}</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/0 opacity-0 transition-all duration-200 group-hover/post:bg-zinc-950/40 group-hover/post:opacity-100">
                  <svg viewBox="0 0 24 24" fill="white" className="size-5 drop-shadow">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                {post.isVideo && (
                  <div className="absolute right-1.5 top-1.5">
                    <svg viewBox="0 0 24 24" fill="white" className="size-3.5 drop-shadow">
                      <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                  </div>
                )}
              </a>
            ))}
      </div>

      {/* ── Credential quote ── */}
      <div className="relative z-10 border-t border-zinc-800/70 px-5 py-4">
        <div className="rounded-xl border-l-[3px] border-accent/50 bg-accent/[0.04] py-3 pl-4 pr-4 transition-all duration-300 group-hover:border-accent/70 group-hover:bg-accent/[0.07]">
          <p className="text-[12px] italic leading-relaxed text-zinc-400">"{c.credential}"</p>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────  HOW IT WORKS  ───────────────── */

function HowItWorks() {
  const { ref, visible } = useReveal(0.08);
  const items = [
    { n: "01", t: "how.step1.title", td: "Drop your track", d: "how.step1.desc", dd: "Three quick steps. Upload audio or paste a private link in under a minute." },
    { n: "02", t: "how.step2.title", td: "Routed to the right ear", d: "how.step2.desc", dd: "Our team matches your genre to the curator who lives in that sound every day." },
    { n: "03", t: "how.step3.title", td: "Personal review in 48h", d: "how.step3.desc", dd: "Real feedback. If they're moved, an intro to the rooms where careers begin." },
  ];

  return (
    <section
      id="how"
      ref={ref as React.RefObject<HTMLElement>}
      className="relative z-10 border-t border-zinc-900/80 px-6 py-16 lg:px-10 lg:py-28"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        <div className={`flex max-w-2xl flex-col gap-3 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-accent">△ The Process</span>
          <E id="how.headline" as="h2" className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Three steps to the room you've been trying to reach.
          </E>
        </div>

        <div className="grid gap-px overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-800/30 lg:grid-cols-3">
          {items.map((it, i) => (
            <div
              key={it.n}
              className="group relative flex flex-col gap-4 overflow-hidden bg-zinc-950 p-8 transition-colors duration-500 hover:bg-zinc-900/60"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.7s ease ${i * 120 + 200}ms, transform 0.7s ease ${i * 120 + 200}ms, background-color 0.3s ease`,
              }}
            >
              {/* Watermark number */}
              <span
                className="pointer-events-none absolute -right-3 -top-6 select-none font-display font-black leading-none text-zinc-900 transition-colors duration-700 group-hover:text-zinc-800/70"
                style={{ fontSize: "clamp(7rem, 14vw, 11rem)" }}
                aria-hidden
              >
                {it.n}
              </span>

              {/* Content */}
              <div className="relative z-10 mt-16 flex flex-col gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20 transition-colors group-hover:bg-accent/15">
                  <span className="font-mono text-xs font-bold text-accent">{it.n}</span>
                </div>
                <E id={it.t} as="h3" className="font-display text-xl font-semibold tracking-tight text-zinc-100">{it.td}</E>
                <E id={it.d} as="p" className="text-sm leading-relaxed text-zinc-400" multiline>{it.dd}</E>
              </div>
            </div>
          ))}
        </div>

        <div
          className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-10 animate-glow-border md:p-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.8s ease 600ms, transform 0.8s ease 600ms",
          }}
        >
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex max-w-xl flex-col gap-3">
              <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Ready to be heard?
              </h3>
              <p className="text-sm text-zinc-400">
                Your first submission is on us. Real ears, 48 hours, zero spam.
              </p>
            </div>
            <MagneticButton
              href="#submit"
              className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-display text-sm font-semibold uppercase tracking-wider text-zinc-950 accent-glow transition-all hover:scale-[1.02]"
            >
              Deposit into the Vault
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────  PACKAGES  ───────────────── */

const packages = [
  {
    id: "first-drop",
    name: "The First Drop",
    price: 19,
    tagline: "One shot. One curator. Real talk.",
    description:
      "You've got a record worth hearing. Get it in front of the right ear and find out exactly where it stands.",
    features: [
      "1 track submission",
      "Matched to 1 curator by genre",
      "Written feedback within 48h",
      "Honest, unfiltered industry perspective",
    ],
    cta: "Drop It",
    badge: null,
    featured: false,
    premium: false,
  },
  {
    id: "campaign",
    name: "The Campaign",
    price: 89,
    tagline: "Build momentum. All three ears.",
    description:
      "You're not just dropping — you're on a run. Three tracks, every curator, voice notes so you hear exactly what landed.",
    features: [
      "3 track submissions over 30 days",
      "All 3 curators review every track",
      "Voice note feedback — not just text",
      "Genre routing per submission",
      "Priority queue placement",
    ],
    cta: "Start the Campaign",
    badge: "Most Popular",
    featured: true,
    premium: false,
  },
  {
    id: "co-sign",
    name: "The Co-Sign",
    price: 249,
    tagline: "For when you're ready to break.",
    description:
      "A full-room review. If the music is there, we don't just tell you — we make the call and open the door.",
    features: [
      "Deep-dive session on your track",
      "All 3 curators + strategic notes",
      "Personal intro to the room if it's there",
      "Social feature consideration",
      "30-day follow-up window",
    ],
    cta: "Get the Co-Sign",
    badge: "Top Tier",
    featured: false,
    premium: true,
  },
] as const;

function Packages() {
  const { ref, visible } = useReveal(0.08);

  return (
    <section
      id="packages"
      ref={ref as React.RefObject<HTMLElement>}
      className="relative z-10 border-t border-zinc-900/80 px-6 py-16 lg:px-10 lg:py-28"
    >
      {/* Ambient glow behind section */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[40vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.06),transparent_65%)] blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-16 relative">
        {/* Header */}
        <div
          className={`flex flex-col items-center gap-4 text-center transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-accent">△ Your Move</span>
          <h2 className="max-w-2xl font-display font-bold tracking-tight" style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)", lineHeight: "0.95" }}>
            <E id="packages.headline" as="span">Pick your moment.</E>{" "}
            <span className="text-gradient-accent italic">
              <E id="packages.headline_sub" as="span">Make it count.</E>
            </span>
          </h2>
          <E id="packages.subtext" as="p" className="max-w-md text-base leading-relaxed text-zinc-500">
            No subscriptions. No monthly fees. One clear package for wherever you are right now.
          </E>
        </div>

        {/* Cards */}
        <div className="grid gap-5 lg:grid-cols-3 lg:items-start">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} idx={i} visible={visible} />
          ))}
        </div>

        {/* Footer note */}
        <p
          className={`text-center font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "700ms" }}
        >
          All packages include a personal response · No bots · No templates
        </p>
      </div>
    </section>
  );
}

function PackageCard({
  pkg,
  idx,
  visible,
}: {
  pkg: (typeof packages)[number];
  idx: number;
  visible: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);

  const onEnter = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transition = "transform 0.05s ease";
  }, []);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    const spec = specRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(y - 0.5) * -10}deg) rotateY(${(x - 0.5) * 10}deg) scale3d(1.02,1.02,1.02)`;
    if (spec) {
      spec.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(52,211,153,0.14) 0%, transparent 55%)`;
      spec.style.opacity = "1";
    }
  }, []);

  const onLeave = useCallback(() => {
    const el = cardRef.current;
    const spec = specRef.current;
    if (el) {
      el.style.transition = "transform 0.65s cubic-bezier(0.23,1,0.32,1)";
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      setTimeout(() => { if (el) el.style.transition = ""; }, 700);
    }
    if (spec) spec.style.opacity = "0";
  }, []);

  const isFeatured = pkg.featured;
  const isPremium = pkg.premium;

  return (
    <div
      ref={cardRef}
      data-sound="card"
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative flex flex-col overflow-hidden rounded-2xl bg-zinc-950 ${
        isFeatured
          ? "featured-border animate-card-pulse"
          : isPremium
          ? "border border-zinc-600/70"
          : "border border-zinc-800/80"
      }`}
      style={{
        transformStyle: "preserve-3d",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.75s ease ${idx * 130}ms, transform 0.75s ease ${idx * 130}ms`,
      }}
    >
      {/* Specular highlight */}
      <div
        ref={specRef}
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0"
        style={{ transition: "opacity 0.3s ease" }}
      />

      {/* Featured top bar */}
      {isFeatured && (
        <div className="relative overflow-hidden bg-accent px-6 py-3">
          <div className="absolute inset-0 shimmer opacity-50" />
          <span className="relative font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-950">
            ★ {pkg.badge}
          </span>
        </div>
      )}

      {/* Premium top bar */}
      {isPremium && !isFeatured && (
        <div className="bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 px-6 py-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
            ◆ {pkg.badge}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-6 p-7">
        {/* Name + price */}
        <div className="flex flex-col gap-1.5">
          <E id={`packages.${pkg.id}.name`} as="h3" className="font-display text-xl font-semibold tracking-tight text-zinc-50">
            {pkg.name}
          </E>
          <E id={`packages.${pkg.id}.tagline`} as="p" className={`font-mono text-[10px] uppercase tracking-[0.18em] ${isFeatured ? "text-accent" : "text-zinc-600"}`}>
            {pkg.tagline}
          </E>
          <div className="mt-3 flex items-end gap-2 leading-none">
            <E id={`packages.${pkg.id}.price`} as="span" className="font-display font-bold tracking-tight text-zinc-50" style={{ fontSize: "clamp(3rem, 5vw, 4rem)" }}>
              {`$${pkg.price}`}
            </E>
            <span className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-700">
              one-time
            </span>
          </div>
        </div>

        {/* Description */}
        <E id={`packages.${pkg.id}.desc`} as="p" className="text-sm leading-relaxed text-zinc-400" multiline>
          {pkg.description}
        </E>

        {/* Features */}
        <ul className="flex flex-col gap-2.5">
          {pkg.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
              <span className={`mt-0.5 shrink-0 size-4 rounded-full flex items-center justify-center ${isFeatured ? "bg-accent/20 text-accent" : "bg-zinc-800 text-zinc-400"}`}>
                <svg viewBox="0 0 12 12" fill="none" className="size-2.5">
                  <path d="M2 6l2.5 2.5L10 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <MagneticButton
          href="#submit"
          className={`group mt-auto flex w-full items-center justify-center gap-2 rounded-full py-4 font-display text-sm font-semibold uppercase tracking-wider transition-all ${
            isFeatured
              ? "bg-accent text-zinc-950 hover:shadow-[0_0_40px_-6px_rgba(52,211,153,0.8)] accent-glow"
              : isPremium
              ? "bg-zinc-100 text-zinc-950 hover:bg-accent hover:shadow-[0_0_40px_-8px_rgba(52,211,153,0.6)]"
              : "border border-zinc-700 bg-transparent text-zinc-200 hover:border-accent/50 hover:text-accent"
          }`}
        >
          {pkg.cta}
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </MagneticButton>

        {/* Trust line */}
        {isPremium && (
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
            Personal intro only when the music earns it
          </p>
        )}
      </div>
    </div>
  );
}

