import { useCallback, useEffect, useRef, useState } from "react";
import * as sounds from "../lib/sounds";
import { useAuth } from "../lib/auth";

/* ─── useReveal ──────────────────────────────────── */

export function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── LiveBackground ─────────────────────────────── */

export function LiveBackground() {
  const b1 = useRef<HTMLDivElement>(null);
  const b2 = useRef<HTMLDivElement>(null);
  const b3 = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const lerped = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    let raf: number;
    const tick = () => {
      lerped.current.x += (mouse.current.x - lerped.current.x) * 0.035;
      lerped.current.y += (mouse.current.y - lerped.current.y) * 0.035;
      const { x, y } = lerped.current;
      if (b1.current) b1.current.style.transform = `translate(${x * 80}px, ${y * 55}px)`;
      if (b2.current) b2.current.style.transform = `translate(${-x * 55}px, ${-y * 45}px)`;
      if (b3.current) b3.current.style.transform = `translate(calc(-50% + ${x * 40}px), calc(-50% + ${y * 30}px))`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a1a14_0%,#050a08_55%,#020503_100%)]" />
      <div className="grid-pattern animate-drift absolute inset-0" />
      <div className="pyramid-pattern absolute inset-0 opacity-70" style={{ maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 20%, transparent 85%)" }} />
      <div className="dot-pattern absolute inset-0 opacity-60" />
      <div className="noise-bg absolute inset-0" />
      <div ref={b1} className="absolute -top-1/4 -left-1/4 h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.24),transparent_60%)] blur-3xl will-change-transform" />
      <div ref={b2} className="absolute -bottom-1/4 -right-1/4 h-[55vmax] w-[55vmax] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.20),transparent_60%)] blur-3xl will-change-transform" />
      <div ref={b3} className="absolute top-1/3 left-1/2 h-[40vmax] w-[40vmax] rounded-full bg-[radial-gradient(circle_at_center,rgba(110,231,183,0.12),transparent_65%)] blur-3xl will-change-transform" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,10,8,0.6)_70%,#050a08_100%)]" />
    </div>
  );
}

/* ─── Cursor ─────────────────────────────────────── */

export function Cursor() {
  const arrowEl = useRef<HTMLDivElement>(null);
  const reticleEl = useRef<SVGSVGElement>(null);
  const mouse = useRef({ x: -200, y: -200 });
  const rPos = useRef({ x: -200, y: -200 });
  const hov = useRef(false);
  const scl = useRef(1);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onOver = (e: MouseEvent) => {
      hov.current = !!(e.target as HTMLElement).closest("a,button,[role='button'],input,textarea,label,select");
    };
    const onDown = () => { scl.current = 0.8; };
    const onUp = () => { scl.current = 1; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    let raf: number;
    const tick = () => {
      const a = arrowEl.current;
      const r = reticleEl.current;
      const h = hov.current;

      if (a) {
        a.style.left = `${mouse.current.x - 1}px`;
        a.style.top = `${mouse.current.y - 1}px`;
        a.style.transform = `scale(${scl.current})`;
        a.style.filter = h
          ? "drop-shadow(0 0 10px rgba(52,211,153,0.95)) drop-shadow(0 0 24px rgba(52,211,153,0.55))"
          : "drop-shadow(0 0 5px rgba(52,211,153,0.7)) drop-shadow(0 0 2px rgb(52,211,153))";
      }

      rPos.current.x += (mouse.current.x - rPos.current.x) * 0.1;
      rPos.current.y += (mouse.current.y - rPos.current.y) * 0.1;
      if (r) {
        r.style.left = `${rPos.current.x}px`;
        r.style.top = `${rPos.current.y}px`;
        r.style.transform = `translate(-50%,-50%) scale(${h ? 1.85 : 1})`;
        r.style.opacity = h ? "0.7" : "0.28";
      }

      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Sharp angular arrow — tip sits at the mouse coordinate */}
      <div
        ref={arrowEl}
        className="pointer-events-none fixed z-[9999] will-change-transform"
        style={{ left: -200, top: -200, transformOrigin: "1px 1px", transition: "filter 0.12s ease" }}
      >
        <svg width="22" height="27" viewBox="0 0 22 27" fill="none">
          {/* Depth shadow */}
          <path
            d="M2 2 L2 21 L7 15.5 L11.5 25 L14.5 23.5 L10 14 L16.5 14 Z"
            fill="rgba(0,0,0,0.45)"
            transform="translate(1,1)"
          />
          {/* Main body — dark fill, emerald stroke */}
          <path
            d="M2 2 L2 21 L7 15.5 L11.5 25 L14.5 23.5 L10 14 L16.5 14 Z"
            fill="rgba(5,10,8,0.9)"
            stroke="rgba(52,211,153,1)"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Inner highlight along left edge */}
          <line x1="2" y1="5" x2="2" y2="19" stroke="rgba(52,211,153,0.22)" strokeWidth="0.6" />
          {/* Glowing tip */}
          <circle cx="2" cy="2" r="2" fill="rgb(52,211,153)" />
          <circle cx="2" cy="2" r="1" fill="white" opacity="0.6" />
        </svg>
      </div>

      {/* Targeting reticle — lags behind, expands on hover */}
      <svg
        ref={reticleEl}
        className="pointer-events-none fixed z-[9998] will-change-transform"
        style={{ left: -200, top: -200, transition: "opacity 0.18s ease, transform 0.18s ease" }}
        width="48" height="48" viewBox="-24 -24 48 48" fill="none"
      >
        {/* Dashed orbit ring */}
        <circle cx="0" cy="0" r="14" stroke="rgba(52,211,153,0.5)" strokeWidth="0.8" strokeDasharray="4 3" />
        {/* Four tick marks */}
        <line x1="-24" y1="0" x2="-17" y2="0" stroke="rgba(52,211,153,0.8)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="24"  y1="0" x2="17"  y2="0" stroke="rgba(52,211,153,0.8)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="0" y1="-24" x2="0" y2="-17" stroke="rgba(52,211,153,0.8)" strokeWidth="1.3" strokeLinecap="round" />
        <line x1="0" y1="24"  x2="0" y2="17"  stroke="rgba(52,211,153,0.8)" strokeWidth="1.3" strokeLinecap="round" />
        {/* Center pip */}
        <circle cx="0" cy="0" r="1.8" fill="rgba(52,211,153,0.45)" />
      </svg>
    </>
  );
}

/* ─── Particles ──────────────────────────────────── */

export function Particles() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const resize = () => { el.width = window.innerWidth; el.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    type P = { x: number; y: number; vx: number; vy: number; size: number; life: number; max: number };
    const pool: P[] = [];
    let frame = 0;
    let raf: number;
    const spawn = () => {
      if (pool.length >= 55) return;
      pool.push({ x: Math.random() * el.width, y: el.height + 6, vx: (Math.random() - 0.5) * 0.45, vy: -(Math.random() * 0.55 + 0.2), size: Math.random() * 1.6 + 0.3, life: 0, max: Math.random() * 380 + 180 });
    };
    const tick = () => {
      ctx.clearRect(0, 0, el.width, el.height);
      frame++;
      if (frame % 9 === 0) spawn();
      for (let i = pool.length - 1; i >= 0; i--) {
        const p = pool[i];
        p.life++; p.x += p.vx; p.y += p.vy;
        const t = p.life / p.max;
        const a = t < 0.1 ? t / 0.1 : t > 0.75 ? (1 - t) / 0.25 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52,211,153,${a * 0.32})`;
        ctx.fill();
        if (p.life >= p.max || p.y < -10) pool.splice(i, 1);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[1]" />;
}

/* ─── MagneticButton ─────────────────────────────── */

export function MagneticButton({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.38;
    const y = (e.clientY - r.top - r.height / 2) * 0.38;
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.style.transition = "transform 0.08s ease";
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0,0)";
    el.style.transition = "transform 0.55s cubic-bezier(0.34,1.56,0.64,1)";
  }, []);
  return (
    <a ref={ref} href={href} onMouseMove={onMove} onMouseLeave={onLeave} className={className}>
      {children}
    </a>
  );
}

/* ─── SiteNav ────────────────────────────────────── */

const MEGA_PLATFORM = [
  { icon: "△", label: "How It Works", desc: "Three steps from drop to callback", href: "/#how" },
  { icon: "◈", label: "Meet the Curators", desc: "The rooms that actually listen", href: "/#curators" },
  { icon: "◇", label: "Packages & Pricing", desc: "Clear, one-time packages", href: "/#packages" },
  { icon: "→", label: "Submit Now", desc: "Drop your track today", href: "/#submit" },
];

const MEGA_ARTISTS = [
  { icon: "◎", label: "Submission Tracker", desc: "Follow every review in real time", href: "/dashboard/submissions" },
  { icon: "◆", label: "Bio & Press Kit", desc: "Your artist profile, built right", href: "/dashboard/bio" },
  { icon: "⊕", label: "Release Planner", desc: "Timeline your next drop", href: "/dashboard/release" },
  { icon: "▽", label: "Lyric Notepad", desc: "Write without leaving The Vault", href: "/dashboard/lyrics" },
];

const MEGA_LABELS = [
  { icon: "Ψ", label: "Private Artist Library", desc: "Curated talent catalogued by genre & sound", href: "/#curators" },
  { icon: "✦", label: "Curator-Vetted Talent", desc: "Every artist honestly assessed by working pros", href: "/#curators" },
  { icon: "∞", label: "Genre Discovery", desc: "Filter emerging artists by exactly what you need", href: "/#curators" },
  { icon: "Ω", label: "Direct Pipeline", desc: "No demos, no middlemen — just the music", href: "/#submit" },
];

export function SiteNav() {
  const pillRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = pillRef.current;
      if (!el) return;
      if (window.scrollY > 40) {
        el.style.background = "rgba(5,10,8,0.9)";
        el.style.backdropFilter = "blur(28px) saturate(180%)";
        el.style.borderColor = "rgba(52,211,153,0.1)";
        el.style.boxShadow = "0 8px 40px -8px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(52,211,153,0.08), inset 0 1px 0 rgba(255,255,255,0.04)";
      } else {
        el.style.background = "transparent";
        el.style.backdropFilter = "none";
        el.style.borderColor = "transparent";
        el.style.boxShadow = "none";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const artistName: string = user?.user_metadata?.artist_name ?? user?.email?.split("@")[0] ?? "Artist";
  const initial = artistName.charAt(0).toUpperCase();
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Backdrop — closes menu when clicking outside */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={closeMenu} />
      )}

      <nav className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex flex-col items-center px-4 pt-4">
        {/* Pill */}
        <div
          ref={pillRef}
          className="pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full border border-transparent px-4 py-3 transition-all duration-500 lg:px-5"
        >
          <a href="/" className="group flex items-center gap-2.5">
            <span className="relative flex size-7 items-center justify-center rounded-lg bg-zinc-900/80 ring-1 ring-zinc-700/80 transition-all group-hover:ring-accent/60 group-hover:bg-zinc-800">
              <span className="size-1.5 rounded-full bg-accent animate-pulse-ring" />
            </span>
            <span className="font-display text-base font-bold uppercase italic tracking-tight">The Vault</span>
          </a>

          <div className="hidden items-center gap-6 md:flex">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${menuOpen ? "text-accent" : "text-zinc-400 hover:text-zinc-100"}`}
            >
              Platform
              <svg
                width="9" height="5" viewBox="0 0 9 5" fill="currentColor"
                className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
              >
                <path d="M0 0l4.5 5L9 0H0z" />
              </svg>
            </button>
            <a href="/#curators" className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-100">Curators</a>
            <a href="/#how" className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-100">How it works</a>
            <a href="/#packages" className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-100">Pricing</a>
            <div className="h-3.5 w-px bg-zinc-800" />
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              Live
            </span>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {!loading && (
              user ? (
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-900/50 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-accent/40 hover:text-accent"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-zinc-950">{initial}</span>
                  Dashboard
                </a>
              ) : (
                <>
                  <a href="/login" className="px-3.5 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-100">
                    Sign in
                  </a>
                  <MagneticButton
                    href="/#submit"
                    className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-950 transition-all hover:shadow-[0_0_20px_-4px_rgba(52,211,153,0.7)]"
                  >
                    Submit
                  </MagneticButton>
                </>
              )
            )}
          </div>

          {/* Mobile-only CTA */}
          <a
            href="/#submit"
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-950 md:hidden"
          >
            Submit →
          </a>
        </div>

        {/* ── Mega Menu ── */}
        <div
          className={`pointer-events-auto mt-2 hidden w-full max-w-5xl transition-all duration-300 md:block ${
            menuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#050a08] shadow-[0_32px_80px_-8px_rgba(0,0,0,0.95),0_0_0_1px_rgba(52,211,153,0.04)]">
            {/* Accent hairline */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

            {/* Three columns */}
            <div className="grid grid-cols-3 divide-x divide-zinc-900/80">
              {/* Col 1 */}
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-600">The Platform</span>
                  <div className="h-px flex-1 bg-zinc-800/70" />
                </div>
                {MEGA_PLATFORM.map(item => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={closeMenu}
                    className="group -mx-3 mb-0.5 flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-zinc-900/70"
                  >
                    <span className="mt-0.5 w-4 shrink-0 font-mono text-sm text-accent/45 transition-colors group-hover:text-accent">{item.icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-300 transition-colors group-hover:text-zinc-50">{item.label}</p>
                      <p className="text-[11px] leading-snug text-zinc-600 transition-colors group-hover:text-zinc-500">{item.desc}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Col 2 */}
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-600">For Artists</span>
                  <div className="h-px flex-1 bg-zinc-800/70" />
                </div>
                {MEGA_ARTISTS.map(item => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={closeMenu}
                    className="group -mx-3 mb-0.5 flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-zinc-900/70"
                  >
                    <span className="mt-0.5 w-4 shrink-0 font-mono text-sm text-accent/45 transition-colors group-hover:text-accent">{item.icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-300 transition-colors group-hover:text-zinc-50">{item.label}</p>
                      <p className="text-[11px] leading-snug text-zinc-600 transition-colors group-hover:text-zinc-500">{item.desc}</p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Col 3 */}
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-600">For Labels & A&R</span>
                  <div className="h-px flex-1 bg-zinc-800/70" />
                </div>
                {MEGA_LABELS.map(item => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={closeMenu}
                    className="group -mx-3 mb-0.5 flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-zinc-900/70"
                  >
                    <span className="mt-0.5 w-4 shrink-0 font-mono text-sm text-accent/45 transition-colors group-hover:text-accent">{item.icon}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-300 transition-colors group-hover:text-zinc-50">{item.label}</p>
                      <p className="text-[11px] leading-snug text-zinc-600 transition-colors group-hover:text-zinc-500">{item.desc}</p>
                    </div>
                  </a>
                ))}

                {/* Label enquiry card */}
                <div className="mt-3 rounded-xl border border-accent/15 bg-accent/[0.04] p-3.5">
                  <p className="mb-2 text-[11px] leading-relaxed text-zinc-500">
                    Label enquiries and A&R access requests handled directly by our curatorial team.
                  </p>
                  <a
                    href="/#submit"
                    onClick={closeMenu}
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent transition-colors hover:text-accent/70"
                  >
                    Contact the Vault →
                  </a>
                </div>
              </div>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between border-t border-zinc-900/80 bg-zinc-950/60 px-6 py-3">
              <div className="flex items-center gap-2.5">
                <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                  Vault open · curators actively reviewing
                </span>
              </div>
              <a
                href="/#submit"
                onClick={closeMenu}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent transition-colors hover:text-accent/70"
              >
                Submit your track →
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

/* ─── CipherRain ─────────────────────────────────── */

const GLYPHS = "△▲▽▼◆◇○◯⊕⊗⊙★✦☽☾∞≈≡∂∇ΨΩΦΣΛΔΘΞψωφσλθξABCDEF0123456789".split("");

export function CipherRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const FONT = 12;
    const COL_W = 24;
    const TRAIL = 18;

    const resize = () => { el.width = window.innerWidth; el.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    type Drop = { y: number; chars: string[]; speed: number; peak: number; rest: number };

    const make = (): Drop => ({
      y: -(Math.random() * el.height),
      chars: Array.from({ length: TRAIL }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]),
      speed: 0.22 + Math.random() * 0.48,
      peak: 0.045 + Math.random() * 0.065,
      rest: Math.floor(Math.random() * 700),
    });

    const numCols = Math.ceil(el.width / COL_W);
    const drops: Drop[] = Array.from({ length: numCols }, make);

    let frame = 0;
    let raf: number;

    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.font = `${FONT}px 'JetBrains Mono','Courier New',monospace`;
      ctx.textAlign = "center";

      drops.forEach((drop, col) => {
        if (drop.rest > 0) { drop.rest--; return; }

        for (let i = 0; i < TRAIL; i++) {
          const cy = drop.y - i * FONT;
          if (cy < -FONT || cy > el.height + FONT) continue;
          const t = Math.pow(1 - i / TRAIL, 1.8);
          ctx.fillStyle = `rgba(52,211,153,${(drop.peak * t).toFixed(3)})`;
          ctx.fillText(drop.chars[i], col * COL_W + COL_W / 2, cy);
        }

        drop.y += drop.speed;

        // occasionally mutate a glyph for digital-noise feel
        if (frame % 10 === col % 10) {
          drop.chars[Math.floor(Math.random() * TRAIL)] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }

        if (drop.y - TRAIL * FONT > el.height) {
          Object.assign(drop, make());
          drop.rest = 80 + Math.floor(Math.random() * 600);
        }
      });

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[1]" />;
}

/* ─── ClickRipple ────────────────────────────────── */

export function ClickRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    const resize = () => { el.width = window.innerWidth; el.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    type Ripple = { x: number; y: number; born: number; maxR: number };
    const pool: Ripple[] = [];

    const onDown = (e: MouseEvent) => {
      pool.push({ x: e.clientX, y: e.clientY, born: performance.now(), maxR: 72 + Math.random() * 44 });
    };
    document.addEventListener("mousedown", onDown);

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, el.width, el.height);
      const now = performance.now();
      const DUR = 900;

      for (let i = pool.length - 1; i >= 0; i--) {
        const rpl = pool[i];
        const t = (now - rpl.born) / DUR;
        if (t >= 1) { pool.splice(i, 1); continue; }

        const ease = 1 - Math.pow(1 - t, 3);
        const r = rpl.maxR * ease;
        const a = 0.55 * (1 - t);

        // outer upward △
        ctx.beginPath();
        ctx.moveTo(rpl.x, rpl.y - r);
        ctx.lineTo(rpl.x + r * 0.866, rpl.y + r * 0.5);
        ctx.lineTo(rpl.x - r * 0.866, rpl.y + r * 0.5);
        ctx.closePath();
        ctx.strokeStyle = `rgba(52,211,153,${a.toFixed(3)})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // inner inverted ▽ (Star of David / Eye of Ra tension)
        const r2 = r * 0.52;
        ctx.beginPath();
        ctx.moveTo(rpl.x, rpl.y + r2);
        ctx.lineTo(rpl.x + r2 * 0.866, rpl.y - r2 * 0.5);
        ctx.lineTo(rpl.x - r2 * 0.866, rpl.y - r2 * 0.5);
        ctx.closePath();
        ctx.strokeStyle = `rgba(52,211,153,${(a * 0.38).toFixed(3)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousedown", onDown);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[9997]" />;
}

/* ─── PyramidDecor ───────────────────────────────── */

export function PyramidDecor({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-pyramid-glow ${className ?? ""}`}
      viewBox="0 0 300 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer pyramid */}
      <polygon points="150,8 292,226 8,226" stroke="rgba(52,211,153,0.55)" strokeWidth="1.2" />
      {/* Concentric inner silhouettes */}
      <polygon points="150,44 266,226 34,226" stroke="rgba(52,211,153,0.32)" strokeWidth="0.9" />
      <polygon points="150,80 240,226 60,226" stroke="rgba(52,211,153,0.20)" strokeWidth="0.8" />
      <polygon points="150,116 214,226 86,226" stroke="rgba(52,211,153,0.13)" strokeWidth="0.7" />
      <polygon points="150,152 188,226 112,226" stroke="rgba(52,211,153,0.09)" strokeWidth="0.6" />
      {/* Base line */}
      <line x1="8" y1="226" x2="292" y2="226" stroke="rgba(52,211,153,0.55)" strokeWidth="1.2" />
      {/* Horizontal stone-course lines */}
      <line x1="120" y1="68" x2="180" y2="68" stroke="rgba(52,211,153,0.18)" strokeWidth="0.6" />
      <line x1="100" y1="98" x2="200" y2="98" stroke="rgba(52,211,153,0.15)" strokeWidth="0.6" />
      <line x1="80"  y1="128" x2="220" y2="128" stroke="rgba(52,211,153,0.12)" strokeWidth="0.6" />
      <line x1="58"  y1="160" x2="242" y2="160" stroke="rgba(52,211,153,0.10)" strokeWidth="0.5" />
      <line x1="38"  y1="190" x2="262" y2="190" stroke="rgba(52,211,153,0.08)" strokeWidth="0.5" />
      <line x1="22"  y1="210" x2="278" y2="210" stroke="rgba(52,211,153,0.06)" strokeWidth="0.5" />
      {/* Eye of Ra — all-seeing eye inside the pyramid */}
      <ellipse cx="150" cy="108" rx="26" ry="15" stroke="rgba(52,211,153,0.38)" strokeWidth="0.9" className="animate-eye-pulse" />
      <circle  cx="150" cy="108" r="8"  stroke="rgba(52,211,153,0.28)" strokeWidth="0.8" />
      <circle  cx="150" cy="108" r="3"  fill="rgba(52,211,153,0.22)" />
      {/* Eye tail lines left & right */}
      <line x1="124" y1="108" x2="115" y2="108" stroke="rgba(52,211,153,0.28)" strokeWidth="0.8" />
      <line x1="176" y1="108" x2="185" y2="108" stroke="rgba(52,211,153,0.28)" strokeWidth="0.8" />
    </svg>
  );
}

/* ─── EyeOfRa ────────────────────────────────────── */

export function EyeOfRa({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={`animate-eye-pulse ${className ?? ""}`}
      style={style}
      viewBox="0 0 180 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Brow arc */}
      <path d="M24,30 Q90,10 156,30" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.7" />
      {/* Outer eye shape */}
      <path d="M6,54 Q45,18 90,54 Q135,90 174,54 Q135,18 90,54 Q45,90 6,54 Z" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.9" />
      {/* Iris */}
      <circle cx="90" cy="54" r="18" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.65" />
      {/* Pupil */}
      <circle cx="90" cy="54" r="7" fill="currentColor" fillOpacity="0.45" />
      {/* Specular dot */}
      <circle cx="86" cy="50" r="2.5" fill="currentColor" fillOpacity="0.7" />
      {/* Egyptian eye extension lines */}
      <path d="M6,54 L0,48" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M174,54 L180,48" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.7" />
      {/* Tear / plumb drop — left (characteristic Eye of Horus mark) */}
      <path d="M6,54 L2,66 Q0,78 8,82 Q16,84 20,76" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.55" />
      {/* Right descending line */}
      <path d="M174,54 L177,66 L172,76 L178,84" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.55" />
    </svg>
  );
}

/* ─── PyramidDivider ─────────────────────────────── */

export function PyramidDivider({ className }: { className?: string }) {
  return (
    <div className={`relative z-10 flex items-center px-6 py-4 lg:px-10 ${className ?? ""}`}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800/60" />
      <div className="mx-4 flex items-center gap-3">
        <div className="h-px w-6 bg-zinc-800/60" />
        <svg viewBox="0 0 20 18" className="size-3.5 text-accent/40 animate-pyramid-glow" fill="currentColor">
          <polygon points="10,1 19,17 1,17" />
        </svg>
        <div className="h-px w-6 bg-zinc-800/60" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800/60" />
    </div>
  );
}

/* ─── SoundEngine ────────────────────────────────── */

export function SoundEngine() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const from = e.relatedTarget as HTMLElement | null;

      const navLink = t.closest("nav a, footer a");
      if (navLink && !navLink.contains(from)) { sounds.tick(); return; }

      const card = t.closest("article, [data-sound='card']");
      if (card && !card.contains(from)) { sounds.whir(); return; }
    };

    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const btn = t.closest("button, a") as HTMLElement | null;
      if (!btn) return;
      const cls = btn.getAttribute("class") ?? "";
      if (cls.includes("bg-accent") || cls.includes("accent-glow")) {
        sounds.chime();
      } else {
        sounds.click();
      }
    };

    const onFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (t.matches("input, textarea, select")) sounds.blip();
    };

    document.addEventListener("mouseover", onOver);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("focusin", onFocus);
    };
  }, []);

  return null;
}

/* ─── SiteFooter ─────────────────────────────────── */

export function SiteFooter() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-zinc-900/60 bg-zinc-950/95 px-6 py-16 lg:px-10">
      {/* Accent line top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -bottom-20 left-1/2 h-48 w-[600px] -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="font-display text-xl font-bold uppercase italic tracking-tight">The Vault</div>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-700">Est. 2026 · Pittsburgh, PA</p>
            </div>
            <p className="max-w-[220px] text-sm leading-relaxed text-zinc-500">
              The industry's private submission channel. Real curators. Honest feedback. Open doors.
            </p>
            <div className="flex items-center gap-2">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">3 curators active</span>
            </div>
            <a
              href="/#submit"
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
            >
              Submit your track →
            </a>
          </div>

          {/* Platform */}
          <div>
            <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-700">Platform</p>
            <ul className="space-y-3">
              {[
                { href: "/#curators", label: "Curators" },
                { href: "/#how", label: "How it works" },
                { href: "/#packages", label: "Packages" },
                { href: "/services", label: "Services" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-700">Account</p>
            <ul className="space-y-3">
              {[
                { href: "/signup", label: "Create Account" },
                { href: "/login", label: "Sign In" },
                { href: "/dashboard", label: "Artist Dashboard" },
                { href: "/dashboard/submissions", label: "My Submissions" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-700">Legal</p>
            <ul className="space-y-3">
              {[
                { href: "#", label: "Privacy Policy" },
                { href: "#", label: "Terms of Service" },
                { href: "#", label: "Refund Policy" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">{label}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-zinc-900/80 pt-7 md:flex-row">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-700">
            © 2026 The Vault · All rights reserved
          </p>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-700">
            △ Built for independent artists worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
