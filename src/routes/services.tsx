import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
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

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — The Vault" },
      { name: "description", content: "Music video production, beat licensing, recording, management, websites, EPKs and more — all delivered by the same people who review your music." },
    ],
  }),
  component: ServicesPage,
});

/* ─────────────────  SERVICE DATA  ───────────────── */

const services = [
  {
    id: "music-video",
    name: "Music Video Production",
    shortName: "Video",
    by: "The Creative Cartel 412",
    byHandle: "@akeefstudios",
    byLink: "https://www.youtube.com/@TheCreativeCartel412",
    role: "Film Director · Editor",
    tagline: "Your vision. On screen. Done right.",
    description:
      "The Creative Cartel 412 has directed official videos for NBA YoungBoy, Birdman, Real Boston Richey, and 30+ artists from Pittsburgh to the DMV. If your music deserves to be seen, this is the team that knows how to make it land.",
    includes: [
      "Creative concept development",
      "Location scouting & logistics",
      "Full shoot day (director + crew)",
      "Professional editing & color grade",
      "Delivery in web + broadcast formats",
    ],
    cta: "Book a Shoot",
    ctaHref: "/#submit",
    price: "Get a quote",
    accent: "from-teal-400/30 to-emerald-600/10",
    accentColor: "rgba(45,212,191,0.15)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    ),
    featured: true,
    ytPreview: "4PKMnH8U5c0",
  },
  {
    id: "mixing-mastering",
    name: "Mixing & Mastering",
    shortName: "Mix",
    by: "The Vault Team",
    byHandle: null,
    byLink: null,
    role: "Audio Engineering",
    tagline: "Send your stems. Get back something ready.",
    description:
      "You record it, we make it hit. Send us your vocal stems and we'll mix and master the track to a release-ready standard — clean, loud, and built for streaming.",
    includes: [
      "Vocal stem mixing (up to 16 tracks)",
      "Full mix balance & processing",
      "Mastering for streaming platforms",
      "Two rounds of revisions",
      "Delivery in WAV + MP3",
    ],
    cta: "Submit Stems",
    ctaHref: "/#submit",
    price: "Get a quote",
    accent: "from-emerald-400/30 to-emerald-800/10",
    accentColor: "rgba(52,211,153,0.12)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    featured: false,
    ytPreview: null,
  },
  {
    id: "website",
    name: "Artist Website",
    shortName: "Website",
    by: "The Vault Team",
    byHandle: null,
    byLink: null,
    role: "Design & Development",
    tagline: "A home for your brand that works as hard as you do.",
    description:
      "Custom artist sites designed to convert — bio, music player, links, and everything a label or blog needs to find out about you fast. We also handle ongoing updates so you never fall behind.",
    includes: [
      "Custom design (no templates)",
      "Domain setup & hosting config",
      "Music player & streaming links",
      "Press / EPK page built in",
      "Ongoing management available",
    ],
    cta: "Get a Quote",
    ctaHref: "/#submit",
    price: "Get a quote",
    accent: "from-emerald-500/20 to-teal-800/10",
    accentColor: "rgba(52,211,153,0.1)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    featured: false,
    ytPreview: null,
  },
  {
    id: "epk",
    name: "EPK Creation",
    shortName: "EPK",
    by: "The Vault Team",
    byHandle: null,
    byLink: null,
    role: "Press & Media",
    tagline: "Put your best foot forward, professionally.",
    description:
      "An Electronic Press Kit is the first thing a label, blog, or promoter asks for. We build yours from scratch — sharp bio, curated photos, streaming stats, and a one-sheet that gets you taken seriously.",
    includes: [
      "Professional artist biography",
      "Photo curation & selection",
      "Streaming stats & press quotes",
      "One-sheet (PDF + web version)",
      "Social & booking contact section",
    ],
    cta: "Build My EPK",
    ctaHref: "/#submit",
    price: "Get a quote",
    accent: "from-teal-400/20 to-emerald-700/10",
    accentColor: "rgba(45,212,191,0.1)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    featured: false,
    ytPreview: null,
  },
  {
    id: "blog",
    name: "Artist Blog Feature",
    shortName: "Blog",
    by: "The Vault Editorial",
    byHandle: null,
    byLink: null,
    role: "Press · Artist Development",
    tagline: "Your story, told to the right audience.",
    description:
      "Get written up by The Vault's editorial team — an interview, a track breakdown, or a full artist spotlight published on our platform. Real press that lives online and builds your discoverability.",
    includes: [
      "Dedicated artist feature article",
      "Interview or written profile",
      "Embedded music & social links",
      "Promoted across our channels",
      "Permanent archive on The Vault",
    ],
    cta: "Apply for a Feature",
    ctaHref: "/#submit",
    price: "Get a quote",
    accent: "from-emerald-300/20 to-teal-600/10",
    accentColor: "rgba(110,231,183,0.1)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-7">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    featured: false,
    ytPreview: null,
  },
] as const;

/* ─────────────────  PORTFOLIO DATA  ───────────────── */

const portfolioVideos = [
  { id: "uk6VNPWWXqM", title: "F**k That Ni**a",          artist: "NBA YoungBoy × Birdman" },
  { id: "IXJTaHySW8I", title: "Help Me",                  artist: "Real Boston Richey" },
  { id: "4PKMnH8U5c0", title: "2023 Music Video Reel",    artist: "The Creative Cartel 412" },
  { id: "JVURe3lAkgg", title: "Mob Ties",                 artist: "BHM Don × Chicken P" },
  { id: "qWfr35hsCuc", title: "Dark Visions",             artist: "Skarlow" },
  { id: "oLlIHvZ4pBI", title: "Knockin'",                 artist: "Skarlow" },
  { id: "cSzbGpiTZUk", title: "Slidin'",                  artist: "Huncho Reckless" },
  { id: "XUK2S9q7YQI", title: "Application Fee",          artist: "OTM Twizzle × OTM Lil Reese" },
  { id: "pFm2dpAa0RY", title: "The Man",                  artist: "Van" },
  { id: "vvWrB3mu_xs", title: "WTNW",                     artist: "Tosh Thugette ft. Latia EFB" },
  { id: "_WZlDs-n9mo", title: "My Lane",                  artist: "Slimmey ft. King Chop" },
];

const workedWith = [
  "NBA YoungBoy", "Birdman", "Real Boston Richey",
  "Skarlow", "Reese Youngn", "Chicken P", "BHM Don",
  "Smaccz", "King Chop", "Hozay Bandz", "Huncho Reckless",
  "OTM Twizzle", "Tosh Thugette", "Van", "Drillman", "BHMPB",
];

/* ─────────────────  PAGE  ───────────────── */

function ServicesPage() {
  return (
    <main className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <Cursor />
      <SoundEngine />
      <ClickRipple />
      <LiveBackground />
      <CipherRain />
      <Particles />
      <SiteNav />
      <ServicesHero />
      <PyramidDivider />
      <FeaturedService />
      <PyramidDivider />
      <ServicesGrid />
      <PyramidDivider />
      <ServicesCTA />
      <SiteFooter />
    </main>
  );
}

/* ─────────────────  HERO  ───────────────── */

function ServicesHero() {
  return (
    <section className="relative z-10 px-6 pb-20 pt-36 lg:px-10">
      <PyramidDecor className="pointer-events-none absolute right-0 top-16 h-[440px] w-[440px] -translate-x-6 opacity-[0.12] lg:opacity-[0.16]" />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 max-w-3xl">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 backdrop-blur animate-reveal-up">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300">
              Artist Services · Full Ecosystem
            </span>
          </div>

          <EyeOfRa className="w-24 text-accent/30 animate-reveal-up" />

          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl animate-reveal-up" style={{ animationDelay: "80ms" }}>
            Every tool your career needs.{" "}
            <span className="text-shimmer italic">One team.</span>
          </h1>

          <p className="max-w-[52ch] text-pretty text-base leading-relaxed text-zinc-400 md:text-lg animate-reveal-up" style={{ animationDelay: "160ms" }}>
            We're built around artist development — not a studio for hire. From your visual identity to the press that surrounds a release, every service here is designed to move your career forward.
          </p>

          <div className="flex flex-wrap gap-3 animate-reveal-up" style={{ animationDelay: "240ms" }}>
            {["Music Video", "Mixing & Mastering", "Artist Website", "EPK", "Blog Features"].map((tag) => (
              <span key={tag} className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────  FEATURED SERVICE (VIDEO)  ───────────────── */

function FeaturedService() {
  const featured = services[0];
  const { ref, visible } = useReveal(0.08);
  const [active, setActive] = useState(portfolioVideos[0]);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative z-10 px-6 pb-16 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={`relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative z-10 grid lg:grid-cols-[420px_1fr] xl:grid-cols-[460px_1fr]">

            {/* ── LEFT: service info ── */}
            <div className="flex flex-col gap-6 border-b border-zinc-800/60 p-8 lg:border-b-0 lg:border-r lg:p-10">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/30">
                  {featured.icon}
                </span>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">◆ Featured Service</span>
                  <a href={featured.byLink!} target="_blank" rel="noreferrer noopener"
                    className="block font-display text-sm font-medium text-zinc-300 hover:text-accent transition-colors">
                    {featured.by} ↗
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">{featured.name}</h2>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{featured.tagline}</p>
              </div>

              <p className="text-sm leading-relaxed text-zinc-400">{featured.description}</p>

              <ul className="flex flex-col gap-2">
                {featured.includes.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <svg viewBox="0 0 10 10" fill="none" className="size-2.5">
                        <path d="M1.5 5l2 2L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <MagneticButton
                href={featured.ctaHref}
                className="group/btn mt-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-accent px-7 py-3.5 font-display text-sm font-semibold uppercase tracking-wider text-zinc-950 accent-glow transition-all hover:shadow-[0_0_50px_-6px_rgba(52,211,153,0.9)]"
              >
                {featured.cta}
                <span className="transition-transform group-hover/btn:translate-x-0.5">→</span>
              </MagneticButton>

              {/* Worked with */}
              <div className="flex flex-col gap-2.5 border-t border-zinc-800/60 pt-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Artists worked with</span>
                <div className="flex flex-wrap gap-1.5">
                  {workedWith.map((artist) => (
                    <span key={artist}
                      className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200">
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: interactive video showcase ── */}
            <div className="flex flex-col">

              {/* Main active video */}
              <a
                href={`https://www.youtube.com/watch?v=${active.id}`}
                target="_blank"
                rel="noreferrer noopener"
                className="group/main relative block overflow-hidden"
                style={{ aspectRatio: "16/9" }}
              >
                <img
                  key={active.id}
                  src={`https://img.youtube.com/vi/${active.id}/hqdefault.jpg`}
                  alt={`${active.title} — ${active.artist}`}
                  className="h-full w-full object-cover transition-all duration-500 group-hover/main:scale-[1.03]"
                />
                {/* scan lines */}
                <div className="absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,1) 2px,rgba(0,0,0,1) 4px)" }}
                />
                <div className="absolute inset-0 bg-zinc-950/35 transition-colors group-hover/main:bg-zinc-950/15" />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-zinc-950/75 ring-1 ring-zinc-100/10 backdrop-blur transition-all duration-300 group-hover/main:bg-accent group-hover/main:scale-110 group-hover/main:ring-accent/40">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-7 translate-x-0.5 text-zinc-100 group-hover/main:text-zinc-950 transition-colors">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950/90 to-transparent px-5 pb-4 pt-10">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent">{active.artist}</p>
                  <p className="font-display text-lg font-semibold text-zinc-50">{active.title}</p>
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-zinc-950/70 px-2.5 py-1 backdrop-blur">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-300">Watch on YouTube ↗</span>
                </div>
              </a>

              {/* Thumbnail grid */}
              <div className="grid grid-cols-3 gap-px bg-zinc-800/50">
                {portfolioVideos.map((vid) => {
                  const isActive = vid.id === active.id;
                  return (
                    <button
                      key={vid.id}
                      onClick={() => setActive(vid)}
                      className={`group/thumb relative overflow-hidden transition-all duration-200 ${isActive ? "ring-2 ring-inset ring-accent" : "opacity-60 hover:opacity-100"}`}
                      style={{ aspectRatio: "16/9" }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${vid.id}/mqdefault.jpg`}
                        alt={vid.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                      />
                      <div className={`absolute inset-0 transition-colors duration-200 ${isActive ? "bg-accent/15" : "bg-zinc-950/50 group-hover/thumb:bg-zinc-950/20"}`} />
                      {isActive && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="size-2 rounded-full bg-accent" />
                        </div>
                      )}
                      {/* Hover title */}
                      <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-zinc-950/90 px-2 py-1.5 transition-transform duration-200 group-hover/thumb:translate-y-0">
                        <p className="truncate font-mono text-[8px] uppercase tracking-wider text-zinc-300">{vid.artist}</p>
                        <p className="truncate font-display text-xs font-medium text-zinc-100">{vid.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────  SERVICES GRID  ───────────────── */

function ServicesGrid() {
  const { ref, visible } = useReveal(0.06);
  const rest = services.slice(1);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative z-10 px-6 py-16 lg:px-10"
    >
      <div className="mx-auto max-w-7xl flex flex-col gap-10">
        <div className={`flex flex-col gap-2 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-accent">△ All Services</span>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            More ways we help you grow.
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((svc, i) => (
            <ServiceCard key={svc.id} svc={svc} idx={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  svc,
  idx,
  visible,
}: {
  svc: (typeof services)[number];
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
      spec.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(52,211,153,0.12) 0%, transparent 55%)`;
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
    <div
      ref={cardRef}
      data-sound="card"
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950"
      style={{
        transformStyle: "preserve-3d",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.75s ease ${idx * 100}ms, transform 0.75s ease ${idx * 100}ms`,
      }}
    >
      {/* Specular */}
      <div ref={specRef} className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0" style={{ transition: "opacity 0.3s ease" }} />

      {/* Hover border glow */}
      <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: "0 0 0 1px rgba(52,211,153,0.25), 0 0 30px -8px rgba(52,211,153,0.15)" }}
      />

      {/* Icon header */}
      <div className={`relative h-24 overflow-hidden bg-gradient-to-br ${svc.accent} flex items-center px-6`}>
        <div className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
        />
        <div className="relative z-10 flex size-14 items-center justify-center rounded-xl bg-zinc-950/60 text-accent ring-1 ring-accent/20 backdrop-blur transition-all group-hover:bg-accent/10 group-hover:ring-accent/40">
          {svc.icon}
        </div>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 select-none font-display text-6xl font-black text-white/5">
          {svc.shortName}
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-4 p-6">
        {/* Service identity */}
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-xl font-semibold tracking-tight text-zinc-50">{svc.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{svc.role}</span>
            <span className="text-zinc-700">·</span>
            {svc.byLink ? (
              <a href={svc.byLink} target="_blank" rel="noreferrer noopener"
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500 hover:text-zinc-200 transition-colors">
                {svc.by}
              </a>
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">{svc.by}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-zinc-400">{svc.description}</p>

        {/* Includes */}
        <ul className="flex flex-col gap-2">
          {svc.includes.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-xs text-zinc-400">
              <span className="mt-0.5 shrink-0 size-3.5 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-500 group-hover:bg-accent/15 group-hover:text-accent transition-colors">
                <svg viewBox="0 0 10 10" fill="none" className="size-2.5">
                  <path d="M1.5 5l2 2L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-800/60 pt-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">Pricing</span>
            <span className="font-display text-sm font-semibold text-zinc-200">{svc.price}</span>
          </div>
          <MagneticButton
            href={svc.ctaHref}
            className="group/btn shrink-0 inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/60 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-zinc-300 transition-all hover:border-accent/50 hover:bg-accent/5 hover:text-accent"
          >
            {svc.cta}
            <span className="transition-transform group-hover/btn:translate-x-0.5">→</span>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────  BOTTOM CTA  ───────────────── */

function ServicesCTA() {
  const { ref, visible } = useReveal(0.1);
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative z-10 px-6 py-24 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div
          className={`relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-10 animate-glow-border md:p-16 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-accent/8 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 size-56 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="flex max-w-xl flex-col gap-4">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-accent">△ Not sure where to start?</span>
              <h3 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Submit your music first. We'll tell you what makes sense next.
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                Every service works better when the people delivering it have already heard your sound. Start with a submission — the rest follows naturally.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <MagneticButton
                href="/#submit"
                className="group inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 font-display text-sm font-semibold uppercase tracking-wider text-zinc-950 accent-glow transition-all hover:scale-[1.02]"
              >
                Submit Your Track
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </MagneticButton>
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                First submission is free
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
